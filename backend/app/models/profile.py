"""
Profile model for detailed user information.

This module defines the Profile model that stores comprehensive information about users
including personal details, education, employment, health, and financial information.
"""
from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.db import db, Model


class EducationLevel(Enum):
    """Enum for education levels."""
    NONE = 'none'
    PRIMARY = 'primary'
    SECONDARY = 'secondary'
    TERTIARY = 'tertiary'
    VOCATIONAL = 'vocational'
    GRADUATE = 'graduate'


class EmploymentStatus(Enum):
    """Enum for employment status."""
    UNEMPLOYED = 'unemployed'
    EMPLOYED_FULL_TIME = 'employed_full_time'
    EMPLOYED_PART_TIME = 'employed_part_time'
    SELF_EMPLOYED = 'self_employed'
    STUDENT = 'student'
    RETIRED = 'retired'
    UNABLE_TO_WORK = 'unable_to_work'


class Profile(Model):
    """
    Profile model for detailed user information.
    
    Attributes:
        id (UUID): Unique identifier for the profile
        user_id (UUID): Foreign key to the user
        first_name (str): User's first name
        last_name (str): User's last name
        date_of_birth (date): User's date of birth
        gender (str): User's gender
        phone_number (str): User's phone number
        address (JSONB): User's address information
        location_coordinates (JSONB): Geographic coordinates of user's location
        education_level (EducationLevel): User's highest education level
        education_history (JSONB): Detailed education history
        employment_status (EmploymentStatus): Current employment status
        employment_history (JSONB): Detailed employment history
        skills (JSONB): List of user's skills
        health_information (JSONB): Health-related information
        income_level (float): Monthly income amount
        household_size (int): Number of people in household
        dependents (int): Number of dependents
        needs (JSONB): Specific needs and requirements
        completion_percentage (int): Profile completion percentage
        privacy_settings (JSONB): User's privacy preferences
        created_at (datetime): Timestamp when profile was created
        updated_at (datetime): Timestamp when profile was last updated
    """
    __tablename__ = 'profiles'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Personal information
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(50))
    phone_number = db.Column(db.String(20))
    
    # Location information
    address = db.Column(JSONB)  # Structured address data
    location_coordinates = db.Column(JSONB)  # Latitude, longitude
    
    # Education information
    education_level = db.Column(db.Enum(EducationLevel), default=EducationLevel.NONE)
    education_history = db.Column(JSONB)  # Array of education entries
    
    # Employment information
    employment_status = db.Column(db.Enum(EmploymentStatus), default=EmploymentStatus.UNEMPLOYED)
    employment_history = db.Column(JSONB)  # Array of employment entries
    skills = db.Column(JSONB)  # Array of skills
    
    # Health information
    health_information = db.Column(JSONB)  # Health-related data
    
    # Financial information
    income_level = db.Column(db.Float, default=0.0)
    household_size = db.Column(db.Integer, default=1)
    dependents = db.Column(db.Integer, default=0)
    
    # Needs and preferences
    needs = db.Column(JSONB)  # Array of specific needs
    
    # Profile metadata
    completion_percentage = db.Column(db.Integer, default=0)
    privacy_settings = db.Column(JSONB, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='profile')
    
    def calculate_completion_percentage(self):
        """
        Calculate the profile completion percentage based on filled fields.
        
        Returns:
            int: Percentage of profile completion (0-100)
        """
        # Define required fields for a complete profile
        required_fields = [
            self.first_name, self.last_name, self.date_of_birth,
            self.gender, self.phone_number, self.address,
            self.education_level, self.employment_status
        ]
        
        # Count non-empty fields
        filled_fields = sum(1 for field in required_fields if field is not None)
        
        # Calculate percentage
        percentage = int((filled_fields / len(required_fields)) * 100)
        self.completion_percentage = percentage
        return percentage
    
    def to_dict(self):
        """
        Convert profile instance to dictionary for API responses.
        
        Returns:
            dict: Profile data
        """
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'phone_number': self.phone_number,
            'address': self.address,
            'location_coordinates': self.location_coordinates,
            'education_level': self.education_level.value if self.education_level else None,
            'education_history': self.education_history,
            'employment_status': self.employment_status.value if self.employment_status else None,
            'employment_history': self.employment_history,
            'skills': self.skills,
            'health_information': self.health_information,
            'income_level': self.income_level,
            'household_size': self.household_size,
            'dependents': self.dependents,
            'needs': self.needs,
            'completion_percentage': self.completion_percentage,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Profile {self.first_name} {self.last_name}>'
