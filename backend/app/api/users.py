"""
User API endpoints for the PovertyLine API.

This module defines routes for user management, including listing, retrieving,
updating, and deleting users.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, UserRole
from app.utils.validators import sanitize_input

users_bp = Blueprint('users', __name__)


@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """
    Get a list of users (admin only).
    
    Headers:
        Authorization: Bearer <access_token>
    
    Query parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20)
        role (str): Filter by role
    
    Returns:
        JSON: List of users on success, error message on failure
    """
    # Get current user for role check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Only admins can list all users
    if not current_user or current_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Parse query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Limit max per_page
    role_filter = request.args.get('role')
    
    # Build query
    query = User.query
    
    if role_filter:
        try:
            role = UserRole(role_filter)
            query = query.filter_by(role=role)
        except ValueError:
            # Invalid role, ignore filter
            pass
    
    # Execute paginated query
    pagination = query.paginate(page=page, per_page=per_page)
    
    # Format response
    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }), 200


@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Get a specific user by ID.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        user_id (str): UUID of the user to retrieve
    
    Returns:
        JSON: User data on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Only admins or the user themselves can view user details
    if not current_user or (current_user.role != UserRole.ADMIN and str(current_user.id) != user_id):
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Find requested user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200


@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    Update a specific user by ID.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        user_id (str): UUID of the user to update
    
    Request body:
        username (str, optional): New username
        email (str, optional): New email
        role (str, optional): New role (admin only)
        is_active (bool, optional): Account status (admin only)
    
    Returns:
        JSON: Updated user data on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Only admins or the user themselves can update user details
    if not current_user or (current_user.role != UserRole.ADMIN and str(current_user.id) != user_id):
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Find user to update
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get request data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Update basic fields (available to user themselves)
        if 'username' in data:
            user.username = sanitize_input(data['username'])
            
        if 'email' in data:
            user.email = sanitize_input(data['email'])
        
        # Admin-only fields
        if current_user.role == UserRole.ADMIN:
            if 'role' in data:
                try:
                    user.role = UserRole(data['role'])
                except ValueError:
                    return jsonify({'error': 'Invalid role'}), 400
                
            if 'is_active' in data:
                user.is_active = bool(data['is_active'])
                
            if 'verification_status' in data:
                try:
                    user.verification_status = data['verification_status']
                except ValueError:
                    return jsonify({'error': 'Invalid verification status'}), 400
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Delete a specific user by ID (admin only).
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        user_id (str): UUID of the user to delete
    
    Returns:
        JSON: Success message on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Only admins can delete users
    if not current_user or current_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Find user to delete
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Delete user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
