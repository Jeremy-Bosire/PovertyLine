"""
Authentication routes for the PovertyLine API.

This module defines routes for user authentication, including registration,
login, logout, and token refresh.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from sqlalchemy.exc import IntegrityError

from app.models import db, User, UserRole
from app.utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    
    Request body:
        username (str): Unique username
        email (str): Valid email address
        password (str): Password meeting security requirements
        role (str, optional): User role (default: 'user')
    
    Returns:
        JSON: User data and tokens on success, error message on failure
    """
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate email format
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    password_validation = validate_password(data['password'])
    if not password_validation['valid']:
        return jsonify({'error': password_validation['message']}), 400
    
    # Check role (default to USER if not provided or invalid)
    role = UserRole.USER
    if 'role' in data:
        try:
            role = UserRole(data['role'])
        except ValueError:
            # Invalid role, use default
            pass
    
    try:
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=role
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate a user and issue tokens.
    
    Request body:
        username (str): Username or email
        password (str): User's password
    
    Returns:
        JSON: User data and tokens on success, error message on failure
    """
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('username', 'password')):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Check if username is email or username
    is_email = '@' in data['username']
    
    # Find user by username or email
    if is_email:
        user = User.query.filter_by(email=data['username']).first()
    else:
        user = User.query.filter_by(username=data['username']).first()
    
    # Verify user exists and password is correct
    if not user or not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Check if user is active
    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh the access token using a valid refresh token.
    
    Headers:
        Authorization: Bearer <refresh_token>
    
    Returns:
        JSON: New access token on success, error message on failure
    """
    current_user_id = get_jwt_identity()
    
    # Verify user still exists and is active
    user = User.query.get(current_user_id)
    if not user or not user.is_active:
        return jsonify({'error': 'User not found or inactive'}), 401
    
    # Generate new access token
    access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user_info():
    """
    Get the current authenticated user's information.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Returns:
        JSON: User data on success, error message on failure
    """
    current_user_id = get_jwt_identity()
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout the current user (client-side token deletion).
    
    Headers:
        Authorization: Bearer <access_token>
    
    Returns:
        JSON: Success message
    """
    # Note: JWT tokens can't be invalidated server-side without a blacklist/database
    # This endpoint is mostly for consistency in the API
    return jsonify({
        'message': 'Logout successful'
    }), 200
