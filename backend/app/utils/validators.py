"""
Validation utilities for the PovertyLine API.

This module provides functions for validating user input such as email addresses,
passwords, and other data formats.
"""
import re


def validate_email(email):
    """
    Validate an email address format.
    
    Args:
        email (str): Email address to validate
        
    Returns:
        bool: True if email is valid, False otherwise
    """
    # Basic email validation pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    """
    Validate password strength.
    
    Password must:
    - Be at least 8 characters long
    - Contain at least one uppercase letter
    - Contain at least one lowercase letter
    - Contain at least one digit
    - Contain at least one special character
    
    Args:
        password (str): Password to validate
        
    Returns:
        dict: Dictionary with 'valid' boolean and 'message' string
    """
    # Check length
    if len(password) < 8:
        return {
            'valid': False,
            'message': 'Password must be at least 8 characters long'
        }
    
    # Check for uppercase letter
    if not any(c.isupper() for c in password):
        return {
            'valid': False,
            'message': 'Password must contain at least one uppercase letter'
        }
    
    # Check for lowercase letter
    if not any(c.islower() for c in password):
        return {
            'valid': False,
            'message': 'Password must contain at least one lowercase letter'
        }
    
    # Check for digit
    if not any(c.isdigit() for c in password):
        return {
            'valid': False,
            'message': 'Password must contain at least one digit'
        }
    
    # Check for special character
    special_chars = r'[!@#$%^&*(),.?":{}|<>]'
    if not re.search(special_chars, password):
        return {
            'valid': False,
            'message': 'Password must contain at least one special character'
        }
    
    # All checks passed
    return {
        'valid': True,
        'message': 'Password is valid'
    }


def validate_phone_number(phone):
    """
    Validate a phone number format.
    
    Args:
        phone (str): Phone number to validate
        
    Returns:
        bool: True if phone number is valid, False otherwise
    """
    # Basic international phone number pattern
    # Allows for various formats with or without country code
    pattern = r'^(\+\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$'
    return bool(re.match(pattern, phone))


def sanitize_input(text):
    """
    Sanitize user input to prevent XSS and other injection attacks.
    
    Args:
        text (str): Text to sanitize
        
    Returns:
        str: Sanitized text
    """
    if not text:
        return text
        
    # Replace potentially dangerous characters
    sanitized = text
    sanitized = sanitized.replace('<', '&lt;')
    sanitized = sanitized.replace('>', '&gt;')
    sanitized = sanitized.replace('"', '&quot;')
    sanitized = sanitized.replace("'", '&#x27;')
    sanitized = sanitized.replace('/', '&#x2F;')
    
    return sanitized
