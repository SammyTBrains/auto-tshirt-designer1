"""
Extended database models for MongoDB collections
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Re-export existing models
from models import TaskStatus, DesignRequest, Task

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class TransactionType(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"
    PURCHASE_REWARD = "purchase_reward"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    role: UserRole = UserRole.USER
    store_credits: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        from_attributes = True

class UserInDB(User):
    pass

class UserResponse(UserBase):
    id: str
    role: UserRole
    store_credits: int
    is_active: bool
    created_at: datetime

# Design Models
class DesignTransform(BaseModel):
    position: Dict[str, float] = {"x": 0, "y": 0}
    scale: float = 1.0
    rotation: float = 0.0

class DesignBase(BaseModel):
    prompt: str
    image_url: str
    thumbnail_url: Optional[str] = None
    style: Optional[str] = "realistic"
    colors: List[str] = []
    transform: Optional[DesignTransform] = None

class DesignCreate(DesignBase):
    pass

class Design(DesignBase):
    id: str = Field(alias="_id")
    user_id: str
    is_public: bool = True
    views: int = 0
    purchases: int = 0
    likes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    design_id: Optional[str] = None
    quantity: int = 1
    size: str = "M"
    color: str = "#FFFFFF"
    price: float
    design_data: Optional[Dict[str, Any]] = None

class OrderBase(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: Dict[str, str]
    contact_email: EmailStr
    contact_phone: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: str = Field(alias="_id")
    user_id: Optional[str] = None
    order_number: str
    status: OrderStatus = OrderStatus.PENDING
    payment_intent_id: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

# Transaction Models (for store credits)
class TransactionBase(BaseModel):
    amount: int
    transaction_type: TransactionType
    description: str

class TransactionCreate(TransactionBase):
    user_id: str

class Transaction(TransactionBase):
    id: str = Field(alias="_id")
    user_id: str
    design_id: Optional[str] = None
    order_id: Optional[str] = None
    balance_after: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Analytics Models
class AnalyticsPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class AnalyticsData(BaseModel):
    period: AnalyticsPeriod
    date: datetime
    total_orders: int = 0
    total_revenue: float = 0.0
    total_designs: int = 0
    total_users: int = 0
    top_designs: List[Dict[str, Any]] = []
    revenue_by_day: List[Dict[str, Any]] = []

# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[UserRole] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
