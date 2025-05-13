"""
Profile API endpoints for the PovertyLine API.

This module defines routes for profile management, including creating, retrieving,
updating, and deleting user profiles.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, Profile, UserRole
from app.utils.validators import sanitize_input, validate_phone_number

profiles_bp = Blueprint('profiles', __name__)


@profiles_bp.route('/', methods=['POST'])
@jwt_required()
def create_profile():
    """
    Create a profile for the authenticated user.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Request body:
        first_name (str): User's first name
        last_name (str): User's last name
        date_of_birth (str): Date of birth in ISO format (YYYY-MM-DD)
        gender (str): User's gender
        phone_number (str): Contact phone number
        address (dict): Structured address information
        ... other profile fields
    
    Returns:
        JSON: Created profile data on success, error message on failure
    """
    # Get current user
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user already has a profile
    if user.profile:
        return jsonify({'error': 'User already has a profile'}), 409
    
    # Get request data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate phone number if provided
    if 'phone_number' in data and not validate_phone_number(data['phone_number']):
        return jsonify({'error': 'Invalid phone number format'}), 400
    
    try:
        # Create new profile
        profile = Profile(user_id=user.id)
        
        # Set profile fields from request data
        if 'first_name' in data:
            profile.first_name = sanitize_input(data['first_name'])
            
        if 'last_name' in data:
            profile.last_name = sanitize_input(data['last_name'])
            
        if 'date_of_birth' in data:
            profile.date_of_birth = data['date_of_birth']
            
        if 'gender' in data:
            profile.gender = sanitize_input(data['gender'])
            
        if 'phone_number' in data:
            profile.phone_number = sanitize_input(data['phone_number'])
            
        if 'address' in data:
            profile.address = data['address']
            
        if 'location_coordinates' in data:
            profile.location_coordinates = data['location_coordinates']
            
        if 'education_level' in data:
            profile.education_level = data['education_level']
            
        if 'education_history' in data:
            profile.education_history = data['education_history']
            
        if 'employment_status' in data:
            profile.employment_status = data['employment_status']
            
        if 'employment_history' in data:
            profile.employment_history = data['employment_history']
            
        if 'skills' in data:
            profile.skills = data['skills']
            
        if 'health_information' in data:
            profile.health_information = data['health_information']
            
        if 'income_level' in data:
            profile.income_level = float(data['income_level'])
            
        if 'household_size' in data:
            profile.household_size = int(data['household_size'])
            
        if 'dependents' in data:
            profile.dependents = int(data['dependents'])
            
        if 'needs' in data:
            profile.needs = data['needs']
            
        if 'privacy_settings' in data:
            profile.privacy_settings = data['privacy_settings']
        
        # Calculate profile completion percentage
        profile.calculate_completion_percentage()
        
        # Save profile
        db.session.add(profile)
        db.session.commit()
        
        return jsonify({
            'message': 'Profile created successfully',
            'profile': profile.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@profiles_bp.route('/<profile_id>', methods=['GET'])
@jwt_required()
def get_profile(profile_id):
    """
    Get a specific profile by ID.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        profile_id (str): UUID of the profile to retrieve
    
    Returns:
        JSON: Profile data on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Find requested profile
    profile = Profile.query.get(profile_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Check permissions (user's own profile or admin)
    if str(current_user.id) != str(profile.user_id) and current_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify({
        'profile': profile.to_dict()
    }), 200


@profiles_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    """
    Get the authenticated user's profile.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Returns:
        JSON: Profile data on success, error message on failure
    """
    # Get current user
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user has a profile
    if not user.profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify({
        'profile': user.profile.to_dict()
    }), 200


@profiles_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_my_profile():
    """
    Update the authenticated user's profile.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Request body:
        first_name (str, optional): User's first name
        last_name (str, optional): User's last name
        ... other profile fields
    
    Returns:
        JSON: Updated profile data on success, error message on failure
    """
    # Get current user
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user has a profile
    if not user.profile:
        return jsonify({'error': 'Profile not found, create one first'}), 404
    
    # Get request data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate phone number if provided
    if 'phone_number' in data and not validate_phone_number(data['phone_number']):
        return jsonify({'error': 'Invalid phone number format'}), 400
    
    try:
        profile = user.profile
        
        # Update profile fields from request data
        if 'first_name' in data:
            profile.first_name = sanitize_input(data['first_name'])
            
        if 'last_name' in data:
            profile.last_name = sanitize_input(data['last_name'])
            
        if 'date_of_birth' in data:
            profile.date_of_birth = data['date_of_birth']
            
        if 'gender' in data:
            profile.gender = sanitize_input(data['gender'])
            
        if 'phone_number' in data:
            profile.phone_number = sanitize_input(data['phone_number'])
            
        if 'address' in data:
            profile.address = data['address']
            
        if 'location_coordinates' in data:
            profile.location_coordinates = data['location_coordinates']
            
        if 'education_level' in data:
            profile.education_level = data['education_level']
            
        if 'education_history' in data:
            profile.education_history = data['education_history']
            
        if 'employment_status' in data:
            profile.employment_status = data['employment_status']
            
        if 'employment_history' in data:
            profile.employment_history = data['employment_history']
            
        if 'skills' in data:
            profile.skills = data['skills']
            
        if 'health_information' in data:
            profile.health_information = data['health_information']
            
        if 'income_level' in data:
            profile.income_level = float(data['income_level'])
            
        if 'household_size' in data:
            profile.household_size = int(data['household_size'])
            
        if 'dependents' in data:
            profile.dependents = int(data['dependents'])
            
        if 'needs' in data:
            profile.needs = data['needs']
            
        if 'privacy_settings' in data:
            profile.privacy_settings = data['privacy_settings']
        
        # Recalculate profile completion percentage
        profile.calculate_completion_percentage()
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
