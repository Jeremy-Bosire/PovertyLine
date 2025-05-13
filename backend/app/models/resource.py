"""
Resource model for support services.

This module defines the Resource model that stores information about available
support services, their providers, eligibility criteria, and other details.
"""
from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.db import db, Model


class ResourceCategory(Enum):
    """Enum for resource categories."""
    FOOD = 'food'
    HOUSING = 'housing'
    HEALTHCARE = 'healthcare'
    EDUCATION = 'education'
    EMPLOYMENT = 'employment'
    FINANCIAL = 'financial'
    LEGAL = 'legal'
    CHILDCARE = 'childcare'
    TRANSPORTATION = 'transportation'
    CLOTHING = 'clothing'
    MENTAL_HEALTH = 'mental_health'
    OTHER = 'other'


class ResourceStatus(Enum):
    """Enum for resource status."""
    DRAFT = 'draft'
    PENDING = 'pending'
    ACTIVE = 'active'
    EXPIRED = 'expired'
    INACTIVE = 'inactive'


class Resource(Model):
    """
    Resource model for support services.
    
    Attributes:
        id (UUID): Unique identifier for the resource
        title (str): Title of the resource
        description (str): Detailed description
        category (ResourceCategory): Category of the resource
        provider_id (UUID): ID of the user who provides this resource
        provider_name (str): Name of the organization/individual providing the resource
        provider_contact (JSONB): Contact information for the provider
        location (JSONB): Geographic location information
        eligibility_criteria (JSONB): Requirements to qualify for the resource
        application_process (str): Description of how to apply
        required_documents (JSONB): List of documents needed for application
        capacity (int): Maximum number of people who can access this resource
        availability (JSONB): Availability schedule
        start_date (date): When the resource becomes available
        end_date (date): When the resource expires
        status (ResourceStatus): Current status of the resource
        verification_date (datetime): When the resource was last verified
        verified_by (UUID): ID of the admin who verified the resource
        created_at (datetime): Timestamp when resource was created
        updated_at (datetime): Timestamp when resource was last updated
    """
    __tablename__ = 'resources'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.Enum(ResourceCategory), nullable=False)
    
    # Provider information
    provider_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    provider_name = db.Column(db.String(200), nullable=False)
    provider_contact = db.Column(JSONB)  # Contact details
    
    # Location and availability
    location = db.Column(JSONB)  # Geographic data
    eligibility_criteria = db.Column(JSONB)  # Requirements
    application_process = db.Column(db.Text)
    required_documents = db.Column(JSONB)  # List of required documents
    capacity = db.Column(db.Integer)  # How many can be served
    availability = db.Column(JSONB)  # Schedule information
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    
    # Status and verification
    status = db.Column(db.Enum(ResourceStatus), default=ResourceStatus.DRAFT, nullable=False)
    verification_date = db.Column(db.DateTime)
    verified_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('ResourceApplication', back_populates='resource', cascade='all, delete-orphan')
    provider = db.relationship('User', foreign_keys=[provider_id])
    verifier = db.relationship('User', foreign_keys=[verified_by])
    
    def is_active(self):
        """
        Check if the resource is currently active.
        
        Returns:
            bool: True if resource is active, False otherwise
        """
        now = datetime.utcnow().date()
        return (
            self.status == ResourceStatus.ACTIVE and
            (self.start_date is None or self.start_date <= now) and
            (self.end_date is None or self.end_date >= now)
        )
    
    def to_dict(self):
        """
        Convert resource instance to dictionary for API responses.
        
        Returns:
            dict: Resource data
        """
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'category': self.category.value,
            'provider_id': str(self.provider_id) if self.provider_id else None,
            'provider_name': self.provider_name,
            'provider_contact': self.provider_contact,
            'location': self.location,
            'eligibility_criteria': self.eligibility_criteria,
            'application_process': self.application_process,
            'required_documents': self.required_documents,
            'capacity': self.capacity,
            'availability': self.availability,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status.value,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active()
        }
    
    def __repr__(self):
        return f'<Resource {self.title}>'
