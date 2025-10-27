"""
New API routes for authentication, user management, orders, and admin features
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import JSONResponse

from db_models import (
    UserCreate, UserResponse, UserUpdate, LoginRequest, Token,
    DesignCreate, Design,
    OrderCreate, Order, OrderStatus,
    TransactionCreate, Transaction, TransactionType,
    TokenData
)
from auth import (
    get_current_user, get_current_admin_user,
    verify_password, create_access_token
)
from crud import (
    create_user, get_user_by_email, get_user_by_id, update_user,
    create_design, get_design_by_id, get_user_designs, increment_design_purchases,
    create_order, get_order_by_id, get_user_orders, update_order_status,
    create_transaction, get_user_transactions,
    get_analytics_data
)
from payment_service import payment_service
from email_service import email_service
from telegram_service import telegram_service
from database import db

logger = logging.getLogger(__name__)

# Create routers
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])
user_router = APIRouter(prefix="/api/users", tags=["Users"])
design_router = APIRouter(prefix="/api/designs", tags=["Designs"])
order_router = APIRouter(prefix="/api/orders", tags=["Orders"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Authentication routes
@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    if not db.get_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )
    
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = await create_user(user)
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Send welcome email
    await email_service.send_welcome_email(new_user.email, new_user.username)
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        username=new_user.username,
        full_name=new_user.full_name,
        role=new_user.role,
        store_credits=new_user.store_credits,
        is_active=new_user.is_active,
        created_at=new_user.created_at
    )

@auth_router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Login and get access token"""
    if not db.get_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )
    
    # Get user
    user = await get_user_by_email(login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role}
    )
    
    return Token(access_token=access_token)

# User routes
@user_router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: TokenData = Depends(get_current_user)):
    """Get current user profile"""
    user = await get_user_by_id(current_user.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        store_credits=user.store_credits,
        is_active=user.is_active,
        created_at=user.created_at
    )

@user_router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update current user profile"""
    updated_user = await update_user(current_user.user_id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        username=updated_user.username,
        full_name=updated_user.full_name,
        role=updated_user.role,
        store_credits=updated_user.store_credits,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at
    )

@user_router.get("/me/transactions", response_model=List[Transaction])
async def get_user_transaction_history(current_user: TokenData = Depends(get_current_user)):
    """Get user's transaction history"""
    transactions = await get_user_transactions(current_user.user_id)
    return transactions

# Design routes
@design_router.post("/", response_model=Design, status_code=status.HTTP_201_CREATED)
async def save_design(
    design: DesignCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Save a new design"""
    if not db.get_db():
        # If database is not available, return success but don't save
        logger.warning("Database not available, design not saved")
        return JSONResponse(
            content={"message": "Design created but not persisted"},
            status_code=201
        )
    
    new_design = await create_design(design, current_user.user_id)
    if not new_design:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save design"
        )
    
    return new_design

@design_router.get("/me", response_model=List[Design])
async def get_my_designs(current_user: TokenData = Depends(get_current_user)):
    """Get current user's designs"""
    designs = await get_user_designs(current_user.user_id)
    return designs

@design_router.get("/{design_id}", response_model=Design)
async def get_design(design_id: str):
    """Get a specific design"""
    design = await get_design_by_id(design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    return design

# Order routes
@order_router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_new_order(
    order: OrderCreate,
    current_user: Optional[TokenData] = Depends(get_current_user)
):
    """Create a new order"""
    if not db.get_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available. Orders require database connection."
        )
    
    user_id = current_user.user_id if current_user else None
    
    # Create order
    new_order = await create_order(order, user_id)
    if not new_order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )
    
    # Send Telegram notification
    await telegram_service.notify_new_order(
        new_order.order_number,
        new_order.total_amount,
        len(new_order.items)
    )
    
    return new_order

@order_router.get("/me", response_model=List[Order])
async def get_my_orders(current_user: TokenData = Depends(get_current_user)):
    """Get current user's orders"""
    orders = await get_user_orders(current_user.user_id)
    return orders

@order_router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a specific order"""
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns this order or is admin
    if order.user_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return order

@order_router.post("/{order_id}/checkout")
async def checkout_order(
    order_id: str,
    current_user: Optional[TokenData] = Depends(get_current_user)
):
    """Create payment intent for order checkout"""
    if not payment_service.is_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment processing is not configured"
        )
    
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Create payment intent
    payment_intent = await payment_service.create_payment_intent(
        amount=order.total_amount,
        metadata={"order_id": order_id, "order_number": order.order_number}
    )
    
    if not payment_intent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )
    
    # Update order with payment intent ID
    await update_order_status(
        order_id,
        OrderStatus.PROCESSING,
        payment_intent_id=payment_intent["payment_intent_id"]
    )
    
    return payment_intent

@order_router.post("/{order_id}/confirm-payment")
async def confirm_order_payment(
    order_id: str,
    current_user: Optional[TokenData] = Depends(get_current_user)
):
    """Confirm payment for an order"""
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not order.payment_intent_id:
        raise HTTPException(status_code=400, detail="No payment intent found")
    
    # Verify payment with Stripe
    payment_confirmed = await payment_service.confirm_payment(order.payment_intent_id)
    
    if not payment_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not confirmed"
        )
    
    # Update order status
    updated_order = await update_order_status(order_id, OrderStatus.PAID)
    
    # Process store credits for design purchases
    for item in order.items:
        if item.design_id:
            # Get design and credit the creator
            design = await get_design_by_id(item.design_id)
            if design:
                # Credit design creator with 10 credits
                transaction = TransactionCreate(
                    user_id=design.user_id,
                    amount=10,
                    transaction_type=TransactionType.PURCHASE_REWARD,
                    description=f"Design purchased: {design.prompt}"
                )
                await create_transaction(transaction)
                
                # Increment design purchase count
                await increment_design_purchases(item.design_id)
                
                # Send notification to designer
                designer = await get_user_by_id(design.user_id)
                if designer:
                    await email_service.send_design_purchase_notification(
                        designer.email,
                        design.prompt,
                        10
                    )
    
    # Send order confirmation email
    await email_service.send_order_confirmation(
        order.contact_email,
        order.order_number,
        order.total_amount
    )
    
    # Send Telegram notification
    await telegram_service.notify_payment_received(
        order.order_number,
        order.total_amount
    )
    
    return {"status": "success", "order": updated_order}

# Admin routes
@admin_router.get("/analytics")
async def get_admin_analytics(current_user: TokenData = Depends(get_current_admin_user)):
    """Get analytics dashboard data"""
    if not db.get_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )
    
    analytics = await get_analytics_data()
    return analytics

@admin_router.post("/orders/{order_id}/update-status")
async def admin_update_order_status(
    order_id: str,
    new_status: OrderStatus = Body(...),
    tracking_number: Optional[str] = Body(None),
    notes: Optional[str] = Body(None),
    current_user: TokenData = Depends(get_current_admin_user)
):
    """Update order status (admin only)"""
    kwargs = {}
    if tracking_number:
        kwargs["tracking_number"] = tracking_number
    if notes:
        kwargs["notes"] = notes
    
    updated_order = await update_order_status(order_id, new_status, **kwargs)
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )
    
    return updated_order

@admin_router.post("/telegram/test")
async def test_telegram_notification(current_user: TokenData = Depends(get_current_admin_user)):
    """Test Telegram notification"""
    if not telegram_service.is_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Telegram not configured"
        )
    
    success = await telegram_service.send_message("🧪 <b>Test notification from T-Shirt Designer</b>")
    return {"success": success}

@admin_router.post("/analytics/send-daily-report")
async def send_daily_analytics_report(current_user: TokenData = Depends(get_current_admin_user)):
    """Send daily analytics report via Telegram"""
    if not telegram_service.is_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Telegram not configured"
        )
    
    analytics = await get_analytics_data()
    
    success = await telegram_service.send_daily_analytics(
        total_orders=analytics.get("total_orders", 0),
        total_revenue=analytics.get("total_revenue", 0),
        new_users=0,  # TODO: Track daily new users
        new_designs=0  # TODO: Track daily new designs
    )
    
    return {"success": success, "analytics": analytics}
