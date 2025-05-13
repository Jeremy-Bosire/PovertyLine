"""
Database seeding module.

This module provides functions to seed the database with test data for development
and testing purposes.
"""
from flask import Flask
from app.models.db import db
from app.seeds.users import seed_users, undo_users
from app.seeds.profiles import seed_profiles, undo_profiles
from app.seeds.resources import seed_resources, undo_resources
from app.seeds.applications import seed_applications, undo_applications
from app.seeds.regions import seed_regions, undo_regions


def seed_all():
    """
    Seed all tables in the database.
    
    This function should be called in the order that respects foreign key constraints.
    """
    seed_users()
    seed_profiles()
    seed_regions()
    seed_resources()
    seed_applications()
    print("Database seeded successfully!")


def undo_all():
    """
    Undo all seeds.
    
    This function should be called in the reverse order of seed_all to respect
    foreign key constraints.
    """
    undo_applications()
    undo_resources()
    undo_regions()
    undo_profiles()
    undo_users()
    print("All seeds undone successfully!")


def register_seed_commands(app: Flask):
    """
    Register seed commands with the Flask CLI.
    
    Args:
        app (Flask): The Flask application instance
    """
    @app.cli.command("seed_db")
    def seed_db():
        """Seed the database with test data."""
        seed_all()
    
    @app.cli.command("unseed_db")
    def unseed_db():
        """Remove all seeded data from the database."""
        undo_all()
