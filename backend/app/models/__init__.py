"""
Models package initialization.

This module imports all models to make them available through the models package.
"""
from app.models.db import db, Model
from app.models.user import User, UserRole, VerificationStatus
from app.models.profile import Profile, EducationLevel, EmploymentStatus
from app.models.resource import Resource, ResourceCategory, ResourceStatus
from app.models.application import ResourceApplication, ApplicationStatus
from app.models.region import Region, RegionType

# Define all models that should be available for import
__all__ = [
    'db', 'Model',
    'User', 'UserRole', 'VerificationStatus',
    'Profile', 'EducationLevel', 'EmploymentStatus',
    'Resource', 'ResourceCategory', 'ResourceStatus',
    'ResourceApplication', 'ApplicationStatus',
    'Region', 'RegionType'
]
