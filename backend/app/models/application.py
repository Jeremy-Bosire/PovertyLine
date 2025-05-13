"""
ResourceApplication model for tracking user applications to resources.

This module defines the ResourceApplication model that connects users with resources
and tracks the status of applications.
"""
from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.db import db, Model


class ApplicationStatus(Enum):
    """Enum for application status."""
    DRAFT = 'draft'
    SUBMITTED = 'submitted'
    PENDING = 'pending'  # Added for compatibility with seed data
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    WAITLISTED = 'waitlisted'
    EXPIRED = 'expired'
    WITHDRAWN = 'withdrawn'


class NeedLevel(Enum):
    """Enum for applicant's level of need."""
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'


class ResourceApplication(Model):
    """
    ResourceApplication model for connecting users with resources.
    
    Attributes:
        id (UUID): Unique identifier for the application
        user_id (UUID): Foreign key to the user
        resource_id (UUID): Foreign key to the resource
        status (ApplicationStatus): Current status of the application
        application_data (JSONB): Form data submitted by the user
        notes (str): Additional notes or comments
        admin_notes (str): Notes visible only to administrators
        submitted_at (datetime): When the application was submitted
        reviewed_at (datetime): When the application was reviewed
        reviewed_by (UUID): ID of the admin who reviewed the application
        decision_reason (str): Reason for approval/rejection
        created_at (datetime): Timestamp when application was created
        updated_at (datetime): Timestamp when application was last updated
    """
    __tablename__ = 'resource_applications'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    resource_id = db.Column(UUID(as_uuid=True), db.ForeignKey('resources.id'), nullable=False)
    
    # Application status and data
    status = db.Column(db.Enum(ApplicationStatus), default=ApplicationStatus.DRAFT, nullable=False)
    need_level = db.Column(db.Enum(NeedLevel), default=NeedLevel.MEDIUM)  # Applicant's level of need
    reason = db.Column(db.Text)  # Applicant's reason for applying
    documents = db.Column(JSONB)  # Array of document information
    application_data = db.Column(JSONB)  # Form data
    notes = db.Column(db.Text)  # User-visible notes
    admin_notes = db.Column(db.Text)  # Admin-only notes
    
    # Timestamps and review information
    submitted_at = db.Column(db.DateTime)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    decision_reason = db.Column(db.Text)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], back_populates='resource_applications')
    resource = db.relationship('Resource', back_populates='applications')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])
    
    def submit(self):
        """
        Submit the application, changing its status from DRAFT to SUBMITTED.
        
        Returns:
            ResourceApplication: The updated application instance
        """
        self.status = ApplicationStatus.SUBMITTED
        self.submitted_at = datetime.utcnow()
        return self.save()
    
    def review(self, reviewer_id, status, reason=None, admin_notes=None):
        """
        Review the application, updating its status and review information.
        
        Args:
            reviewer_id (UUID): ID of the admin reviewing the application
            status (ApplicationStatus): New status for the application
            reason (str, optional): Reason for the decision. Defaults to None.
            admin_notes (str, optional): Notes for administrators. Defaults to None.
            
        Returns:
            ResourceApplication: The updated application instance
        """
        self.status = status
        self.reviewed_at = datetime.utcnow()
        self.reviewed_by = reviewer_id
        
        if reason:
            self.decision_reason = reason
            
        if admin_notes:
            self.admin_notes = admin_notes
            
        return self.save()
    
    def to_dict(self):
        """
        Convert application instance to dictionary for API responses.
        
        Returns:
            dict: Application data
        """
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'resource_id': str(self.resource_id),
            'status': self.status.value,
            'need_level': self.need_level.value if self.need_level else None,
            'reason': self.reason,
            'documents': self.documents,
            'application_data': self.application_data,
            'notes': self.notes,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': str(self.reviewed_by) if self.reviewed_by else None,
            'decision_reason': self.decision_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<ResourceApplication {self.id} - Status: {self.status.value}>'
