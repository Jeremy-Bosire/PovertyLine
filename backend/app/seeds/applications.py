"""
Application seeding module.

This module provides functions to seed the database with test application data for development
and testing purposes.
"""
from datetime import datetime, date, timedelta
import uuid

from app.models.db import db
from app.models.application import ResourceApplication, ApplicationStatus, NeedLevel
from app.seeds.users import seed_users
from app.seeds.resources import seed_resources


def seed_applications():
    """
    Seed resource applications table with test data.
    
    Creates applications with different statuses and details.
    """
    # Get users and resources from the database
    from app.models.user import User
    from app.models.resource import Resource
    
    users = User.query.filter_by(role='user').all()
    resources = Resource.query.all()
    
    if not users:
        print("No regular users found. Seeding users first...")
        users = [user for user in seed_users() if user.role.value == 'user']
    
    if not resources:
        print("No resources found. Seeding resources first...")
        resources = seed_resources()
    
    applications = []
    
    # Application 1: Approved food bank application
    app1 = ResourceApplication(
        user_id=users[0].id,  # johndoe
        resource_id=resources[0].id,  # Community Food Pantry
        status=ApplicationStatus.APPROVED,
        need_level=NeedLevel.HIGH,
        reason="I recently lost my job and am struggling to provide food for my family of three. We have depleted our savings and need assistance with groceries until I can secure new employment.",
        documents=[
            {
                "name": "ID Card",
                "type": "identification",
                "uploaded_at": (datetime.utcnow() - timedelta(days=15)).isoformat()
            },
            {
                "name": "Proof of Address",
                "type": "address_verification",
                "uploaded_at": (datetime.utcnow() - timedelta(days=15)).isoformat()
            },
            {
                "name": "Unemployment Notice",
                "type": "income_verification",
                "uploaded_at": (datetime.utcnow() - timedelta(days=15)).isoformat()
            }
        ],
        notes="Approved for weekly food assistance for 3 months. Client meets all eligibility requirements.",
        reviewer_id=resources[0].verified_by,
        review_date=datetime.utcnow() - timedelta(days=10)
    )
    applications.append(app1)
    
    # Application 2: Pending shelter application
    app2 = ResourceApplication(
        user_id=users[1].id,  # janedoe
        resource_id=resources[1].id,  # Safe Haven Emergency Shelter
        status=ApplicationStatus.PENDING,
        need_level=NeedLevel.CRITICAL,
        reason="I'm currently homeless after being evicted from my apartment last week. I have nowhere to go and need emergency shelter while I look for a new place to live.",
        documents=[
            {
                "name": "ID Card",
                "type": "identification",
                "uploaded_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
            },
            {
                "name": "Eviction Notice",
                "type": "housing_documentation",
                "uploaded_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
            }
        ],
        notes=None,
        reviewer_id=None,
        review_date=None
    )
    applications.append(app2)
    
    # Application 3: Rejected healthcare application
    app3 = ResourceApplication(
        user_id=users[2].id,  # bobsmith
        resource_id=resources[2].id,  # Community Health Clinic
        status=ApplicationStatus.REJECTED,
        need_level=NeedLevel.MEDIUM,
        reason="I need dental care but don't have insurance. I'm employed but my job doesn't offer health benefits.",
        documents=[
            {
                "name": "ID Card",
                "type": "identification",
                "uploaded_at": (datetime.utcnow() - timedelta(days=20)).isoformat()
            }
        ],
        notes="Applicant's income exceeds our eligibility threshold. Referred to county dental program which has higher income limits.",
        reviewer_id=resources[2].verified_by,
        review_date=datetime.utcnow() - timedelta(days=15)
    )
    applications.append(app3)
    
    # Application 4: Pending job training application
    app4 = ResourceApplication(
        user_id=users[0].id,  # johndoe
        resource_id=resources[3].id,  # Career Skills Workshop Series
        status=ApplicationStatus.PENDING,
        need_level=NeedLevel.HIGH,
        reason="I've been unemployed for three months and need to improve my job search skills. I'm particularly interested in learning digital skills that will help me find employment in today's job market.",
        documents=[],
        notes=None,
        reviewer_id=None,
        review_date=None
    )
    applications.append(app4)
    
    # Application 5: Withdrawn application
    app5 = ResourceApplication(
        user_id=users[1].id,  # janedoe
        resource_id=resources[0].id,  # Community Food Pantry
        status=ApplicationStatus.WITHDRAWN,
        need_level=NeedLevel.MEDIUM,
        reason="I need assistance with groceries this month as I'm between jobs.",
        documents=[
            {
                "name": "ID Card",
                "type": "identification",
                "uploaded_at": (datetime.utcnow() - timedelta(days=25)).isoformat()
            }
        ],
        notes="Applicant withdrew request after finding employment.",
        reviewer_id=None,
        review_date=None
    )
    applications.append(app5)
    
    # Add all applications to the session
    for application in applications:
        db.session.add(application)
    
    # Commit the changes
    db.session.commit()
    
    print(f"Seeded {len(applications)} applications")
    return applications


def undo_applications():
    """
    Undo application seeds.
    
    Deletes all seeded applications from the database.
    """
    db.session.execute('TRUNCATE resource_applications RESTART IDENTITY CASCADE;')
    db.session.commit()
    print("Applications seed undone!")
