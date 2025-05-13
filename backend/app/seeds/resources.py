"""
Resource seeding module.

This module provides functions to seed the database with test resource data for development
and testing purposes.
"""
from datetime import datetime, date, timedelta
import uuid

from app.models.db import db
from app.models.resource import Resource, ResourceCategory, ResourceStatus
from app.seeds.users import seed_users


def seed_resources():
    """
    Seed resources table with test data.
    
    Creates various resources with different categories, statuses, and details.
    """
    # Get users from the database
    from app.models.user import User
    users = User.query.all()
    
    if not users:
        print("No users found. Seeding users first...")
        users = seed_users()
    
    # Find provider and admin users
    providers = [user for user in users if user.role.value == 'provider']
    admins = [user for user in users if user.role.value == 'admin']
    
    if not providers or not admins:
        print("Warning: No providers or admins found. Some resources may not have proper associations.")
    
    resources = []
    
    # Food Bank Resource (Active)
    food_bank = Resource(
        title="Community Food Pantry",
        description="Weekly food distribution for families in need. Provides fresh produce, canned goods, and other essentials.",
        category=ResourceCategory.FOOD,
        provider_id=providers[0].id if providers else None,
        provider_name="Community Foodbank",
        provider_contact={
            "name": "John Manager",
            "email": "contact@foodbank.org",
            "phone": "555-FOOD-123",
            "website": "www.communityfoodbank.org"
        },
        location={
            "street": "789 Charity Lane",
            "city": "Helpville",
            "state": "NY",
            "zip": "10002",
            "country": "USA",
            "accessibility": "Wheelchair accessible"
        },
        eligibility_criteria={
            "income_requirement": "Below 200% of federal poverty line",
            "residency_requirement": "Must live in Helpville or surrounding areas",
            "documentation_required": True,
            "age_requirement": None
        },
        application_process="Walk-in service available during distribution hours. First-time visitors should bring ID and proof of address.",
        required_documents=["Photo ID", "Proof of address", "Income verification (if available)"],
        capacity=150,
        availability={
            "days": ["Monday", "Wednesday", "Friday"],
            "hours": "9:00 AM - 2:00 PM",
            "notes": "Closed on federal holidays"
        },
        start_date=date.today() - timedelta(days=30),
        end_date=date.today() + timedelta(days=365),
        status=ResourceStatus.ACTIVE,
        verification_date=datetime.utcnow() - timedelta(days=5),
        verified_by=admins[0].id if admins else None
    )
    resources.append(food_bank)
    
    # Shelter Resource (Active)
    shelter = Resource(
        title="Safe Haven Emergency Shelter",
        description="Emergency overnight shelter providing beds, meals, and basic necessities for individuals experiencing homelessness.",
        category=ResourceCategory.HOUSING,
        provider_id=providers[1].id if len(providers) > 1 else None,
        provider_name="Safe Shelter",
        provider_contact={
            "name": "Maria Director",
            "email": "help@shelter.org",
            "phone": "555-SAFE-456",
            "website": "www.safehavenshelter.org"
        },
        location={
            "street": "101 Haven Street",
            "city": "Safetown",
            "state": "CA",
            "zip": "90001",
            "country": "USA",
            "accessibility": "Wheelchair accessible, service animals allowed"
        },
        eligibility_criteria={
            "income_requirement": None,
            "residency_requirement": None,
            "documentation_required": False,
            "age_requirement": "18+ for general shelter, family section available for families with children"
        },
        application_process="Walk-in between 5:00 PM and 10:00 PM for same-day shelter. No appointment necessary.",
        required_documents=[],
        capacity=75,
        availability={
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "hours": "5:00 PM - 8:00 AM",
            "notes": "Open 24 hours during extreme weather events"
        },
        start_date=date.today() - timedelta(days=60),
        end_date=None,
        status=ResourceStatus.ACTIVE,
        verification_date=datetime.utcnow() - timedelta(days=10),
        verified_by=admins[0].id if admins else None
    )
    resources.append(shelter)
    
    # Healthcare Resource (Active)
    healthcare = Resource(
        title="Community Health Clinic",
        description="Free and low-cost healthcare services including primary care, preventive services, and basic dental care.",
        category=ResourceCategory.HEALTHCARE,
        provider_id=providers[2].id if len(providers) > 2 else None,
        provider_name="Health Access Clinic",
        provider_contact={
            "name": "Dr. Sarah Health",
            "email": "info@healthclinic.org",
            "phone": "555-HEAL-789",
            "website": "www.communityhealthclinic.org"
        },
        location={
            "street": "456 Wellness Avenue",
            "city": "Careville",
            "state": "IL",
            "zip": "60001",
            "country": "USA",
            "accessibility": "Fully accessible facility, translation services available"
        },
        eligibility_criteria={
            "income_requirement": "Sliding scale fees based on income",
            "residency_requirement": None,
            "documentation_required": True,
            "age_requirement": None
        },
        application_process="Call to schedule an appointment. New patients should arrive 30 minutes early to complete paperwork.",
        required_documents=["Photo ID", "Insurance card (if insured)", "Proof of income for sliding scale fees"],
        capacity=None,
        availability={
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "hours": "8:00 AM - 5:00 PM",
            "notes": "Walk-in urgent care available 8:00 AM - 12:00 PM on Saturdays"
        },
        start_date=date.today() - timedelta(days=90),
        end_date=None,
        status=ResourceStatus.ACTIVE,
        verification_date=datetime.utcnow() - timedelta(days=15),
        verified_by=admins[1].id if len(admins) > 1 else None
    )
    resources.append(healthcare)
    
    # Job Training Resource (Pending)
    job_training = Resource(
        title="Career Skills Workshop Series",
        description="Free workshop series covering resume writing, interview skills, digital literacy, and job search strategies.",
        category=ResourceCategory.EMPLOYMENT,
        provider_id=providers[3].id if len(providers) > 3 else None,
        provider_name="Workforce Development Center",
        provider_contact={
            "name": "Carlos Martinez",
            "email": "careers@jobtraining.org",
            "phone": "555-JOBS-101",
            "website": "www.workforcedevelopment.org"
        },
        location={
            "street": "222 Opportunity Lane",
            "city": "Growthville",
            "state": "TX",
            "zip": "75001",
            "country": "USA",
            "accessibility": "Wheelchair accessible"
        },
        eligibility_criteria={
            "income_requirement": None,
            "residency_requirement": "County residents preferred",
            "documentation_required": False,
            "age_requirement": "16+"
        },
        application_process="Register online or by phone. Space is limited to 25 participants per workshop.",
        required_documents=[],
        capacity=25,
        availability={
            "days": ["Tuesday", "Thursday"],
            "hours": "6:00 PM - 8:00 PM",
            "notes": "Six-week series, runs quarterly"
        },
        start_date=date.today() + timedelta(days=15),
        end_date=date.today() + timedelta(days=15 + 42),  # 6 weeks
        status=ResourceStatus.PENDING,
        verification_date=None,
        verified_by=None
    )
    resources.append(job_training)
    
    # Education Resource (Draft)
    education = Resource(
        title="Adult Education Program",
        description="Free GED preparation classes and basic adult education in reading, writing, and mathematics.",
        category=ResourceCategory.EDUCATION,
        provider_id=providers[0].id if providers else None,
        provider_name="Community Learning Center",
        provider_contact={
            "name": "Patricia Educator",
            "email": "education@learningcenter.org",
            "phone": "555-LEARN-123",
            "website": "www.communitylearningcenter.org"
        },
        location={
            "street": "333 Knowledge Street",
            "city": "Wisetown",
            "state": "MA",
            "zip": "02101",
            "country": "USA",
            "accessibility": "Wheelchair accessible"
        },
        eligibility_criteria={
            "income_requirement": None,
            "residency_requirement": None,
            "documentation_required": False,
            "age_requirement": "18+"
        },
        application_process="Register in person at the Community Learning Center or call to schedule an assessment.",
        required_documents=[],
        capacity=30,
        availability={
            "days": ["Monday", "Wednesday"],
            "hours": "6:00 PM - 9:00 PM",
            "notes": "Fall, winter, and spring sessions available"
        },
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=30 + 90),  # 3 months
        status=ResourceStatus.DRAFT,
        verification_date=None,
        verified_by=None
    )
    resources.append(education)
    
    # Childcare Resource (Inactive)
    childcare = Resource(
        title="Subsidized Childcare Program",
        description="Financial assistance for childcare services for low-income working families.",
        category=ResourceCategory.CHILDCARE,
        provider_id=providers[1].id if len(providers) > 1 else None,
        provider_name="Family Support Services",
        provider_contact={
            "name": "David Caregiver",
            "email": "childcare@familysupport.org",
            "phone": "555-KIDS-789",
            "website": "www.familysupportservices.org"
        },
        location={
            "street": "444 Family Avenue",
            "city": "Childville",
            "state": "GA",
            "zip": "30301",
            "country": "USA",
            "accessibility": "Wheelchair accessible"
        },
        eligibility_criteria={
            "income_requirement": "Below 150% of federal poverty line",
            "residency_requirement": "State resident",
            "documentation_required": True,
            "age_requirement": "Children ages 0-12"
        },
        application_process="Complete application online or in person. Documentation required.",
        required_documents=["Photo ID", "Birth certificates for children", "Proof of income", "Proof of employment or school enrollment"],
        capacity=100,
        availability={
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "hours": "9:00 AM - 5:00 PM",
            "notes": "Applications processed within 10 business days"
        },
        start_date=date.today() - timedelta(days=180),
        end_date=date.today() - timedelta(days=30),
        status=ResourceStatus.INACTIVE,
        verification_date=datetime.utcnow() - timedelta(days=180),
        verified_by=admins[0].id if admins else None
    )
    resources.append(childcare)
    
    # Add all resources to the session
    for resource in resources:
        db.session.add(resource)
    
    # Commit the changes
    db.session.commit()
    
    print(f"Seeded {len(resources)} resources")
    return resources


def undo_resources():
    """
    Undo resource seeds.
    
    Deletes all seeded resources from the database.
    """
    db.session.execute('TRUNCATE resources RESTART IDENTITY CASCADE;')
    db.session.commit()
    print("Resources seed undone!")
