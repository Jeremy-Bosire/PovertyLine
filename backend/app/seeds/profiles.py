"""
Profile seeding module.

This module provides functions to seed the database with test profile data for development
and testing purposes.
"""
from datetime import datetime, date
import uuid

from app.models.db import db
from app.models.profile import Profile, EducationLevel, EmploymentStatus
from app.seeds.users import seed_users


def seed_profiles():
    """
    Seed profiles table with test data.
    
    Creates profiles for the seeded users with varied demographic information.
    """
    # Get users from the database
    from app.models.user import User
    users = User.query.all()
    
    if not users:
        print("No users found. Seeding users first...")
        users = seed_users()
    
    profiles = []
    
    # Create profile for user1 (johndoe) - Complete profile
    profile1 = Profile(
        user_id=users[6].id,  # johndoe
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1985, 5, 15),
        gender="Male",
        phone_number="555-123-4567",
        address={
            "street": "123 Main St",
            "city": "Anytown",
            "state": "NY",
            "zip": "10001",
            "country": "USA"
        },
        location_coordinates={
            "latitude": 40.7128,
            "longitude": -74.0060
        },
        education_level=EducationLevel.SECONDARY,
        education_history=[
            {
                "institution": "Anytown High School",
                "degree": "High School Diploma",
                "field_of_study": "General",
                "start_date": "2000-09-01",
                "end_date": "2004-06-15",
                "completed": True
            }
        ],
        employment_status=EmploymentStatus.EMPLOYED_PART_TIME,
        employment_history=[
            {
                "employer": "Local Grocery Store",
                "position": "Cashier",
                "start_date": "2020-03-01",
                "end_date": None,
                "current": True,
                "description": "Customer service and cash handling"
            },
            {
                "employer": "Fast Food Restaurant",
                "position": "Crew Member",
                "start_date": "2018-06-01",
                "end_date": "2020-02-28",
                "current": False,
                "description": "Food preparation and customer service"
            }
        ],
        skills=["Customer Service", "Cash Handling", "Food Preparation", "Inventory Management"],
        health_information={
            "conditions": ["Asthma"],
            "medications": ["Albuterol"],
            "allergies": ["Peanuts"],
            "disabilities": None,
            "insurance_status": "Medicaid"
        },
        income_level=1500.00,
        household_size=3,
        dependents=2,
        needs={
            "food": True,
            "housing": False,
            "healthcare": True,
            "employment": True,
            "education": False,
            "childcare": True,
            "transportation": False
        },
        privacy_settings={
            "share_contact_info": True,
            "share_location": True,
            "share_health_info": False,
            "share_financial_info": False
        }
    )
    profile1.calculate_completion_percentage()
    profiles.append(profile1)
    
    # Create profile for user2 (janedoe) - Partial profile
    profile2 = Profile(
        user_id=users[7].id,  # janedoe
        first_name="Jane",
        last_name="Doe",
        date_of_birth=date(1990, 8, 22),
        gender="Female",
        phone_number="555-987-6543",
        address={
            "street": "456 Oak Ave",
            "city": "Othertown",
            "state": "CA",
            "zip": "90210",
            "country": "USA"
        },
        education_level=EducationLevel.TERTIARY,
        employment_status=EmploymentStatus.UNEMPLOYED,
        income_level=0.00,
        household_size=1,
        dependents=0,
        needs={
            "food": True,
            "housing": True,
            "healthcare": True,
            "employment": True,
            "education": False,
            "childcare": False,
            "transportation": True
        }
    )
    profile2.calculate_completion_percentage()
    profiles.append(profile2)
    
    # Create profile for user3 (bobsmith) - Minimal profile
    profile3 = Profile(
        user_id=users[8].id,  # bobsmith
        first_name="Bob",
        last_name="Smith",
        date_of_birth=date(1975, 3, 10),
        gender="Male",
        phone_number="555-555-5555",
        employment_status=EmploymentStatus.EMPLOYED_FULL_TIME,
        income_level=3200.00,
        household_size=4,
        dependents=2
    )
    profile3.calculate_completion_percentage()
    profiles.append(profile3)
    
    # Create profile for provider1 (foodbank)
    profile4 = Profile(
        user_id=users[2].id,  # foodbank
        first_name="Community",
        last_name="Foodbank",
        phone_number="555-FOOD-123",
        address={
            "street": "789 Charity Lane",
            "city": "Helpville",
            "state": "NY",
            "zip": "10002",
            "country": "USA"
        },
        location_coordinates={
            "latitude": 40.7328,
            "longitude": -73.9860
        }
    )
    profile4.calculate_completion_percentage()
    profiles.append(profile4)
    
    # Create profile for provider2 (shelterorg)
    profile5 = Profile(
        user_id=users[3].id,  # shelterorg
        first_name="Safe",
        last_name="Shelter",
        phone_number="555-SAFE-456",
        address={
            "street": "101 Haven Street",
            "city": "Safetown",
            "state": "CA",
            "zip": "90001",
            "country": "USA"
        },
        location_coordinates={
            "latitude": 34.0522,
            "longitude": -118.2437
        }
    )
    profile5.calculate_completion_percentage()
    profiles.append(profile5)
    
    # Add all profiles to the session
    for profile in profiles:
        db.session.add(profile)
    
    # Commit the changes
    db.session.commit()
    
    print(f"Seeded {len(profiles)} profiles")
    return profiles


def undo_profiles():
    """
    Undo profile seeds.
    
    Deletes all seeded profiles from the database.
    """
    db.session.execute('TRUNCATE profiles RESTART IDENTITY CASCADE;')
    db.session.commit()
    print("Profiles seed undone!")
