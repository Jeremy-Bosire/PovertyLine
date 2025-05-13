"""
User seeding module.

This module provides functions to seed the database with test user data for development
and testing purposes.
"""
from datetime import datetime
import uuid

from app.models.db import db
from app.models.user import User, UserRole, VerificationStatus


def seed_users():
    """
    Seed users table with test data.
    
    Creates a variety of users with different roles and verification statuses.
    """
    # Create admin users
    admin1 = User(
        username="admin1",
        email="admin1@povertyline.org",
        password="password123",
        role=UserRole.ADMIN
    )
    admin1.verification_status = VerificationStatus.VERIFIED
    
    admin2 = User(
        username="admin2",
        email="admin2@povertyline.org",
        password="password123",
        role=UserRole.ADMIN
    )
    admin2.verification_status = VerificationStatus.VERIFIED
    
    # Create provider users
    provider1 = User(
        username="foodbank",
        email="contact@foodbank.org",
        password="password123",
        role=UserRole.PROVIDER
    )
    provider1.verification_status = VerificationStatus.VERIFIED
    
    provider2 = User(
        username="shelterorg",
        email="help@shelter.org",
        password="password123",
        role=UserRole.PROVIDER
    )
    provider2.verification_status = VerificationStatus.VERIFIED
    
    provider3 = User(
        username="healthclinic",
        email="info@healthclinic.org",
        password="password123",
        role=UserRole.PROVIDER
    )
    provider3.verification_status = VerificationStatus.PENDING
    
    provider4 = User(
        username="jobtraining",
        email="careers@jobtraining.org",
        password="password123",
        role=UserRole.PROVIDER
    )
    provider4.verification_status = VerificationStatus.UNVERIFIED
    
    # Create regular users
    user1 = User(
        username="johndoe",
        email="john@example.com",
        password="password123",
        role=UserRole.USER
    )
    user1.verification_status = VerificationStatus.VERIFIED
    
    user2 = User(
        username="janedoe",
        email="jane@example.com",
        password="password123",
        role=UserRole.USER
    )
    user2.verification_status = VerificationStatus.VERIFIED
    
    user3 = User(
        username="bobsmith",
        email="bob@example.com",
        password="password123",
        role=UserRole.USER
    )
    user3.verification_status = VerificationStatus.PENDING
    
    user4 = User(
        username="alicejones",
        email="alice@example.com",
        password="password123",
        role=UserRole.USER
    )
    user4.verification_status = VerificationStatus.UNVERIFIED
    
    user5 = User(
        username="mikebrown",
        email="mike@example.com",
        password="password123",
        role=UserRole.USER
    )
    user5.verification_status = VerificationStatus.REJECTED
    
    # Add all users to the session
    users = [admin1, admin2, provider1, provider2, provider3, provider4, 
             user1, user2, user3, user4, user5]
    
    for user in users:
        db.session.add(user)
    
    # Commit the changes
    db.session.commit()
    
    print(f"Seeded {len(users)} users")
    return users


def undo_users():
    """
    Undo user seeds.
    
    Deletes all seeded users from the database.
    """
    db.session.execute('TRUNCATE users RESTART IDENTITY CASCADE;')
    db.session.commit()
    print("Users seed undone!")
