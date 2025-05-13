"""
Database configuration module for SQLAlchemy.

This module initializes the SQLAlchemy instance and provides a base model class
with common functionality for all models.
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

# Define naming convention for constraints to support migrations properly
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)
db = SQLAlchemy(metadata=metadata)


class CRUDMixin:
    """
    Mixin that adds convenience methods for CRUD operations.
    """
    @classmethod
    def create(cls, **kwargs):
        """Create a new record and save it to the database."""
        instance = cls(**kwargs)
        return instance.save()

    def update(self, commit=True, **kwargs):
        """Update specific fields of a record."""
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        return self.save() if commit else self

    def save(self, commit=True):
        """Save the record."""
        db.session.add(self)
        if commit:
            db.session.commit()
        return self

    def delete(self, commit=True):
        """Remove the record from the database."""
        db.session.delete(self)
        if commit:
            db.session.commit()
        return self


class Model(CRUDMixin, db.Model):
    """Base model class that includes CRUD convenience methods."""
    __abstract__ = True
