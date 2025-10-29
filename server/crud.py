"""
Database CRUD operations
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

from database import db
from db_models import (
    User, UserCreate, UserUpdate, UserRole,
    Design, DesignCreate,
    Order, OrderCreate, OrderStatus,
    Transaction, TransactionCreate, TransactionType
)
from auth import get_password_hash

logger = logging.getLogger(__name__)

# Helper functions
def object_id_to_str(obj: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectId to string in a document"""
    if obj and "_id" in obj:
        obj["_id"] = str(obj["_id"])
    return obj

async def generate_order_number() -> str:
    """Generate a unique order number"""
    database = db.get_db()
    if database is None:
        return f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Get the count of orders today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count = await database.orders.count_documents({"created_at": {"$gte": today_start}})
    return f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{count + 1:04d}"

# User CRUD operations
async def create_user(user: UserCreate) -> Optional[User]:
    """Create a new user"""
    database = db.get_db()
    if database is None:
        logger.error("Database not connected")
        return None
    
    try:
        # Check if user already exists
        existing_user = await database.users.find_one({"email": user.email})
        if existing_user:
            logger.warning(f"User with email {user.email} already exists")
            return None
        
        # Create user document
        user_doc = {
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "hashed_password": get_password_hash(user.password),
            "role": UserRole.USER,
            "store_credits": 0,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await database.users.insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        
        return User(**user_doc)
    
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return None

async def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        user_doc = await database.users.find_one({"email": email})
        if user_doc:
            user_doc = object_id_to_str(user_doc)
            return User(**user_doc)
        return None
    except Exception as e:
        logger.error(f"Error getting user by email: {str(e)}")
        return None

async def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        user_doc = await database.users.find_one({"_id": ObjectId(user_id)})
        if user_doc:
            user_doc = object_id_to_str(user_doc)
            return User(**user_doc)
        return None
    except Exception as e:
        logger.error(f"Error getting user by ID: {str(e)}")
        return None

async def update_user(user_id: str, user_update: UserUpdate) -> Optional[User]:
    """Update user information"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        update_data["updated_at"] = datetime.utcnow()
        
        await database.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        return await get_user_by_id(user_id)
    
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        return None

async def update_user_credits(user_id: str, amount: int) -> bool:
    """Update user store credits"""
    database = db.get_db()
    if database is None:
        return False
    
    try:
        await database.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"store_credits": amount}}
        )
        return True
    except Exception as e:
        logger.error(f"Error updating user credits: {str(e)}")
        return False

# Design CRUD operations
async def create_design(design: DesignCreate, user_id: str) -> Optional[Design]:
    """Create a new design"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        design_doc = design.dict()
        design_doc.update({
            "user_id": user_id,
            "is_public": True,
            "views": 0,
            "purchases": 0,
            "likes": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        result = await database.designs.insert_one(design_doc)
        design_doc["_id"] = str(result.inserted_id)
        
        return Design(**design_doc)
    
    except Exception as e:
        logger.error(f"Error creating design: {str(e)}")
        return None

async def get_design_by_id(design_id: str) -> Optional[Design]:
    """Get design by ID"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        design_doc = await database.designs.find_one({"_id": ObjectId(design_id)})
        if design_doc:
            design_doc = object_id_to_str(design_doc)
            return Design(**design_doc)
        return None
    except Exception as e:
        logger.error(f"Error getting design: {str(e)}")
        return None

async def get_user_designs(user_id: str, limit: int = 50) -> List[Design]:
    """Get designs created by a user"""
    database = db.get_db()
    if database is None:
        return []
    
    try:
        cursor = database.designs.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        designs = []
        async for design_doc in cursor:
            design_doc = object_id_to_str(design_doc)
            designs.append(Design(**design_doc))
        return designs
    except Exception as e:
        logger.error(f"Error getting user designs: {str(e)}")
        return []

async def increment_design_purchases(design_id: str) -> bool:
    """Increment design purchase count"""
    database = db.get_db()
    if database is None:
        return False
    
    try:
        await database.designs.update_one(
            {"_id": ObjectId(design_id)},
            {"$inc": {"purchases": 1}}
        )
        return True
    except Exception as e:
        logger.error(f"Error incrementing design purchases: {str(e)}")
        return False

# Order CRUD operations
async def create_order(order: OrderCreate, user_id: Optional[str] = None) -> Optional[Order]:
    """Create a new order"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        order_number = await generate_order_number()
        order_doc = order.dict()
        order_doc.update({
            "user_id": user_id,
            "order_number": order_number,
            "status": OrderStatus.PENDING,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        result = await database.orders.insert_one(order_doc)
        order_doc["_id"] = str(result.inserted_id)
        
        return Order(**order_doc)
    
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        return None

async def get_order_by_id(order_id: str) -> Optional[Order]:
    """Get order by ID"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        order_doc = await database.orders.find_one({"_id": ObjectId(order_id)})
        if order_doc:
            order_doc = object_id_to_str(order_doc)
            return Order(**order_doc)
        return None
    except Exception as e:
        logger.error(f"Error getting order: {str(e)}")
        return None

async def get_user_orders(user_id: str, limit: int = 50) -> List[Order]:
    """Get orders for a user"""
    database = db.get_db()
    if database is None:
        return []
    
    try:
        cursor = database.orders.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        orders = []
        async for order_doc in cursor:
            order_doc = object_id_to_str(order_doc)
            orders.append(Order(**order_doc))
        return orders
    except Exception as e:
        logger.error(f"Error getting user orders: {str(e)}")
        return []

async def update_order_status(order_id: str, status: OrderStatus, **kwargs) -> Optional[Order]:
    """Update order status"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        update_data = {"status": status, "updated_at": datetime.utcnow()}
        
        # Update timestamp based on status
        if status == OrderStatus.PAID:
            update_data["paid_at"] = datetime.utcnow()
        elif status == OrderStatus.SHIPPED:
            update_data["shipped_at"] = datetime.utcnow()
        elif status == OrderStatus.DELIVERED:
            update_data["delivered_at"] = datetime.utcnow()
        
        # Add any additional fields
        update_data.update(kwargs)
        
        await database.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        
        return await get_order_by_id(order_id)
    
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        return None

# Transaction CRUD operations
async def create_transaction(transaction: TransactionCreate) -> Optional[Transaction]:
    """Create a transaction record"""
    database = db.get_db()
    if database is None:
        return None
    
    try:
        # Get current user balance
        user = await get_user_by_id(transaction.user_id)
        if not user:
            return None
        
        balance_after = user.store_credits + transaction.amount
        
        transaction_doc = transaction.dict()
        transaction_doc.update({
            "balance_after": balance_after,
            "created_at": datetime.utcnow()
        })
        
        result = await database.transactions.insert_one(transaction_doc)
        transaction_doc["_id"] = str(result.inserted_id)
        
        # Update user balance
        await update_user_credits(transaction.user_id, transaction.amount)
        
        return Transaction(**transaction_doc)
    
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}")
        return None

async def get_user_transactions(user_id: str, limit: int = 50) -> List[Transaction]:
    """Get transactions for a user"""
    database = db.get_db()
    if database is None:
        return []
    
    try:
        cursor = database.transactions.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        transactions = []
        async for trans_doc in cursor:
            trans_doc = object_id_to_str(trans_doc)
            transactions.append(Transaction(**trans_doc))
        return transactions
    except Exception as e:
        logger.error(f"Error getting user transactions: {str(e)}")
        return []

# Analytics operations
async def get_analytics_data(period: str = "daily") -> Dict[str, Any]:
    """Get analytics data"""
    database = db.get_db()
    if database is None:
        return {}
    
    try:
        # Get total counts
        total_users = await database.users.count_documents({})
        total_orders = await database.orders.count_documents({})
        total_designs = await database.designs.count_documents({})
        
        # Get total revenue
        pipeline = [
            {"$match": {"status": OrderStatus.PAID}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await database.orders.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Get top designs
        top_designs = await database.designs.find().sort("purchases", -1).limit(10).to_list(10)
        
        return {
            "total_users": total_users,
            "total_orders": total_orders,
            "total_designs": total_designs,
            "total_revenue": total_revenue,
            "top_designs": [object_id_to_str(d) for d in top_designs]
        }
    
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        return {}
