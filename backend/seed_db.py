#!/usr/bin/env python
"""
Database seeding script for PovertyLine.

This script provides a convenient way to seed the database with test data
for development and testing purposes.

Usage:
    python seed_db.py [--unseed]

Options:
    --unseed    Remove all seeded data instead of adding it
"""
import os
import sys
import click
from flask.cli import FlaskGroup

from app import create_app
from app.seeds import seed_all, undo_all


@click.group(cls=FlaskGroup, create_app=create_app)
def cli():
    """Management script for the PovertyLine application."""
    pass


@cli.command("seed")
def seed():
    """Seed the database with test data."""
    print("Seeding database with test data...")
    seed_all()
    print("Database seeded successfully!")


@cli.command("unseed")
def unseed():
    """Remove all seeded data from the database."""
    print("Removing all seeded data...")
    undo_all()
    print("All seeded data removed successfully!")


if __name__ == "__main__":
    # If run directly with arguments, parse them
    if len(sys.argv) > 1 and sys.argv[1] == "--unseed":
        print("Removing all seeded data...")
        app = create_app()
        with app.app_context():
            undo_all()
        print("All seeded data removed successfully!")
    else:
        # Default behavior is to seed
        print("Seeding database with test data...")
        app = create_app()
        with app.app_context():
            seed_all()
        print("Database seeded successfully!")
