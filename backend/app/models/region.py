"""
Region model for geographic data.

This module defines the Region model that stores geographic hierarchies,
regional statistics, and administrative boundaries.
"""
from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.db import db, Model


class RegionType(Enum):
    """Enum for region types."""
    COUNTRY = 'country'
    STATE = 'state'
    COUNTY = 'county'
    CITY = 'city'
    DISTRICT = 'district'
    NEIGHBORHOOD = 'neighborhood'


class Region(Model):
    """
    Region model for geographic data.
    
    Attributes:
        id (UUID): Unique identifier for the region
        name (str): Name of the region
        type (RegionType): Type of region
        code (str): Official code for the region
        parent_id (UUID): Foreign key to parent region
        boundaries (JSONB): GeoJSON boundaries
        center_coordinates (JSONB): Center point coordinates
        population (int): Population count
        statistics (JSONB): Various regional statistics
        created_at (datetime): Timestamp when region was created
        updated_at (datetime): Timestamp when region was last updated
    """
    __tablename__ = 'regions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.Enum(RegionType), nullable=False)
    code = db.Column(db.String(50))  # Official region code
    parent_id = db.Column(UUID(as_uuid=True), db.ForeignKey('regions.id'))
    
    # Geographic data
    state = db.Column(db.String(50))  # State/province
    country = db.Column(db.String(50))  # Country
    geographic_data = db.Column(JSONB)  # Geographic information including boundaries and coordinates
    
    # Statistical data
    population = db.Column(db.Integer)
    poverty_rate = db.Column(db.Float)  # Percentage of population below poverty line
    median_income = db.Column(db.Float)  # Median household income
    unemployment_rate = db.Column(db.Float)  # Unemployment rate percentage
    demographic_data = db.Column(JSONB)  # Demographic information
    poverty_data = db.Column(JSONB)  # Poverty-related statistics
    resource_availability = db.Column(JSONB)  # Available resources in the region
    is_active = db.Column(db.Boolean, default=True)  # Whether the region is active
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = db.relationship('Region', remote_side=[id], backref='subregions')
    
    def get_hierarchy(self):
        """
        Get the full hierarchy of regions from this region up to the top level.
        
        Returns:
            list: List of regions in the hierarchy, from top to bottom
        """
        hierarchy = [self]
        current = self
        
        while current.parent_id:
            current = current.parent
            hierarchy.insert(0, current)
            
        return hierarchy
    
    def to_dict(self):
        """
        Convert region instance to dictionary for API responses.
        
        Returns:
            dict: Region data
        """
        return {
            'id': str(self.id),
            'name': self.name,
            'type': self.type.value,
            'code': self.code,
            'state': self.state,
            'country': self.country,
            'parent_id': str(self.parent_id) if self.parent_id else None,
            'geographic_data': self.geographic_data,
            'population': self.population,
            'poverty_rate': self.poverty_rate,
            'median_income': self.median_income,
            'unemployment_rate': self.unemployment_rate,
            'demographic_data': self.demographic_data,
            'poverty_data': self.poverty_data,
            'resource_availability': self.resource_availability,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Region {self.name} ({self.type.value})>'
