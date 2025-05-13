"""
Region seeding module.

This module provides functions to seed the database with test region data for development
and testing purposes.
"""
import uuid
from datetime import datetime

from app.models.db import db
from app.models.region import Region


def seed_regions():
    """
    Seed regions table with test data.
    
    Creates regions with demographic and poverty data for testing.
    """
    regions = []
    
    # New York City
    nyc = Region(
        name="New York City",
        state="NY",
        country="USA",
        population=8336817,
        poverty_rate=17.3,
        median_income=67844,
        unemployment_rate=7.2,
        geographic_data={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "boundaries": {
                "north": 40.9176,
                "south": 40.4774,
                "east": -73.7004,
                "west": -74.2591
            }
        },
        demographic_data={
            "age_distribution": {
                "under_18": 20.9,
                "18_to_64": 65.8,
                "65_and_over": 13.3
            },
            "race_distribution": {
                "white": 42.7,
                "black": 24.3,
                "hispanic": 29.1,
                "asian": 14.1,
                "other": 5.5
            },
            "education_levels": {
                "less_than_high_school": 18.2,
                "high_school": 24.3,
                "some_college": 16.4,
                "bachelors_or_higher": 41.1
            }
        },
        poverty_data={
            "child_poverty_rate": 23.8,
            "senior_poverty_rate": 18.1,
            "food_insecurity_rate": 12.9,
            "homelessness_rate": 0.6
        },
        resource_availability={
            "food_banks": 128,
            "shelters": 91,
            "healthcare_clinics": 73,
            "job_centers": 42
        },
        is_active=True
    )
    regions.append(nyc)
    
    # Los Angeles
    la = Region(
        name="Los Angeles",
        state="CA",
        country="USA",
        population=3979576,
        poverty_rate=19.1,
        median_income=62142,
        unemployment_rate=8.3,
        geographic_data={
            "latitude": 34.0522,
            "longitude": -118.2437,
            "boundaries": {
                "north": 34.3373,
                "south": 33.7037,
                "east": -118.1553,
                "west": -118.6682
            }
        },
        demographic_data={
            "age_distribution": {
                "under_18": 21.6,
                "18_to_64": 66.2,
                "65_and_over": 12.2
            },
            "race_distribution": {
                "white": 52.4,
                "black": 8.9,
                "hispanic": 48.6,
                "asian": 11.6,
                "other": 3.5
            },
            "education_levels": {
                "less_than_high_school": 22.1,
                "high_school": 20.5,
                "some_college": 19.2,
                "bachelors_or_higher": 38.2
            }
        },
        poverty_data={
            "child_poverty_rate": 26.5,
            "senior_poverty_rate": 16.8,
            "food_insecurity_rate": 14.2,
            "homelessness_rate": 1.1
        },
        resource_availability={
            "food_banks": 96,
            "shelters": 73,
            "healthcare_clinics": 58,
            "job_centers": 31
        },
        is_active=True
    )
    regions.append(la)
    
    # Chicago
    chicago = Region(
        name="Chicago",
        state="IL",
        country="USA",
        population=2693976,
        poverty_rate=18.4,
        median_income=57238,
        unemployment_rate=7.9,
        geographic_data={
            "latitude": 41.8781,
            "longitude": -87.6298,
            "boundaries": {
                "north": 42.0230,
                "south": 41.6446,
                "east": -87.5245,
                "west": -87.9402
            }
        },
        demographic_data={
            "age_distribution": {
                "under_18": 21.4,
                "18_to_64": 66.9,
                "65_and_over": 11.7
            },
            "race_distribution": {
                "white": 49.4,
                "black": 30.1,
                "hispanic": 29.0,
                "asian": 6.4,
                "other": 2.7
            },
            "education_levels": {
                "less_than_high_school": 15.9,
                "high_school": 23.1,
                "some_college": 22.0,
                "bachelors_or_higher": 39.0
            }
        },
        poverty_data={
            "child_poverty_rate": 28.9,
            "senior_poverty_rate": 15.3,
            "food_insecurity_rate": 13.8,
            "homelessness_rate": 0.5
        },
        resource_availability={
            "food_banks": 82,
            "shelters": 64,
            "healthcare_clinics": 49,
            "job_centers": 28
        },
        is_active=True
    )
    regions.append(chicago)
    
    # Rural Region
    rural = Region(
        name="Appalachia Region",
        state="KY",
        country="USA",
        population=120000,
        poverty_rate=24.5,
        median_income=38750,
        unemployment_rate=9.8,
        geographic_data={
            "latitude": 37.8393,
            "longitude": -84.2700,
            "boundaries": {
                "north": 38.2000,
                "south": 37.4000,
                "east": -83.8000,
                "west": -84.7000
            }
        },
        demographic_data={
            "age_distribution": {
                "under_18": 19.8,
                "18_to_64": 61.2,
                "65_and_over": 19.0
            },
            "race_distribution": {
                "white": 94.2,
                "black": 2.1,
                "hispanic": 1.8,
                "asian": 0.5,
                "other": 1.4
            },
            "education_levels": {
                "less_than_high_school": 24.7,
                "high_school": 38.3,
                "some_college": 24.1,
                "bachelors_or_higher": 12.9
            }
        },
        poverty_data={
            "child_poverty_rate": 32.6,
            "senior_poverty_rate": 18.9,
            "food_insecurity_rate": 17.5,
            "homelessness_rate": 0.2
        },
        resource_availability={
            "food_banks": 12,
            "shelters": 5,
            "healthcare_clinics": 8,
            "job_centers": 3
        },
        is_active=True
    )
    regions.append(rural)
    
    # Inactive Region
    inactive = Region(
        name="Test Region",
        state="TX",
        country="USA",
        population=50000,
        poverty_rate=15.0,
        median_income=52000,
        unemployment_rate=6.5,
        geographic_data={
            "latitude": 30.2672,
            "longitude": -97.7431,
            "boundaries": {
                "north": 30.4000,
                "south": 30.1000,
                "east": -97.6000,
                "west": -97.9000
            }
        },
        is_active=False
    )
    regions.append(inactive)
    
    # Add all regions to the session
    for region in regions:
        db.session.add(region)
    
    # Commit the changes
    db.session.commit()
    
    print(f"Seeded {len(regions)} regions")
    return regions


def undo_regions():
    """
    Undo region seeds.
    
    Deletes all seeded regions from the database.
    """
    db.session.execute('TRUNCATE regions RESTART IDENTITY CASCADE;')
    db.session.commit()
    print("Regions seed undone!")
