"""
User model for authentication and authorization.

This module defines the User model for authentication, including methods for
password hashing, verification, and role-based access control.
"""
from datetime import datetime
from enum import Enum
import uuid

from flask_bcrypt import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import UUID

from app.models.db import db, Model


class UserRole(Enum):
    """Enum for user roles in the system."""
    USER = 'user'
    PROVIDER = 'provider'
    ADMIN = 'admin'


class VerificationStatus(Enum):
    """Enum for user verification status."""
    UNVERIFIED = 'unverified'
    PENDING = 'pending'
    VERIFIED = 'verified'
    REJECTED = 'rejected'


class User(Model):
    """
    User model for authentication and authorization.
    
    Attributes:
        id (UUID): Unique identifier for the user
        username (str): Unique username for login
        email (str): User's email address
        password_hash (str): Hashed password
        role (UserRole): User's role in the system
        verification_status (VerificationStatus): User's verification status
        created_at (datetime): Timestamp when user was created
        updated_at (datetime): Timestamp when user was last updated
        is_active (bool): Whether the user account is active
    """
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)
    verification_status = db.Column(
        db.Enum(VerificationStatus), 
        default=VerificationStatus.UNVERIFIED,
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    profile = db.relationship('Profile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    resource_applications = db.relationship('ResourceApplication', back_populates='user', cascade='all, delete-orphan')
    
    def __init__(self, username, email, password, role=UserRole.USER):
        """
        Initialize a new User instance.
        
        Args:
            username (str): User's username
            email (str): User's email
            password (str): User's plain text password (will be hashed)
            role (UserRole, optional): User's role. Defaults to UserRole.USER.
        """
        self.username = username
        self.email = email
        self.password = password
        self.role = role
    
    @property
    def password(self):
        """
        Password getter that raises an exception to prevent password access.
        
        Raises:
            AttributeError: Always raised to prevent password access
        """
        raise AttributeError('Password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        """
        Password setter that hashes the password before storing.
        
        Args:
            password (str): Plain text password to hash
        """
        self.password_hash = generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        """
        Verify a password against the stored hash.
        
        Args:
            password (str): Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """
        Convert user instance to dictionary for API responses.
        
        Returns:
            dict: User data without sensitive information
        """
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'role': self.role.value,
            'verification_status': self.verification_status.value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
