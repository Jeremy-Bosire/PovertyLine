"""
Resource API endpoints for the PovertyLine API.

This module defines routes for resource management, including creating, retrieving,
updating, and deleting resources, as well as applying for resources.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.models import db, User, Resource, ResourceApplication, UserRole, ResourceStatus, ApplicationStatus
from app.utils.validators import sanitize_input

resources_bp = Blueprint('resources', __name__)


@resources_bp.route('/', methods=['GET'])
def get_resources():
    """
    Get a list of active resources.
    
    Query parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20)
        category (str): Filter by category
        location (dict): Filter by geographic proximity
        search (str): Search term for title and description
    
    Returns:
        JSON: List of resources on success, error message on failure
    """
    # Parse query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Limit max per_page
    category = request.args.get('category')
    search = request.args.get('search')
    
    # Build query for active resources
    query = Resource.query.filter_by(status=ResourceStatus.ACTIVE)
    
    # Apply category filter if provided
    if category:
        try:
            query = query.filter_by(category=category)
        except ValueError:
            # Invalid category, ignore filter
            pass
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Resource.title.ilike(search_term)) | 
            (Resource.description.ilike(search_term)) |
            (Resource.provider_name.ilike(search_term))
        )
    
    # Filter by date range (only show current resources)
    today = datetime.utcnow().date()
    query = query.filter(
        (Resource.start_date.is_(None) | (Resource.start_date <= today)) &
        (Resource.end_date.is_(None) | (Resource.end_date >= today))
    )
    
    # Execute paginated query
    pagination = query.paginate(page=page, per_page=per_page)
    
    # Format response
    return jsonify({
        'resources': [resource.to_dict() for resource in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }), 200


@resources_bp.route('/<resource_id>', methods=['GET'])
def get_resource(resource_id):
    """
    Get a specific resource by ID.
    
    Path parameters:
        resource_id (str): UUID of the resource to retrieve
    
    Returns:
        JSON: Resource data on success, error message on failure
    """
    # Find requested resource
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    
    # Check if resource is active or user is authenticated
    if resource.status != ResourceStatus.ACTIVE:
        # For non-active resources, require authentication
        try:
            # Get JWT token from request
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Unauthorized access'}), 403
                
            # If we get here, the user is authenticated and can view non-active resources
        except Exception:
            return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify({
        'resource': resource.to_dict()
    }), 200


@resources_bp.route('/', methods=['POST'])
@jwt_required()
def create_resource():
    """
    Create a new resource (provider or admin only).
    
    Headers:
        Authorization: Bearer <access_token>
    
    Request body:
        title (str): Resource title
        description (str): Detailed description
        category (str): Resource category
        provider_name (str): Name of the provider
        provider_contact (dict): Contact information
        ... other resource fields
    
    Returns:
        JSON: Created resource data on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Only providers and admins can create resources
    if not current_user or (current_user.role != UserRole.PROVIDER and current_user.role != UserRole.ADMIN):
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get request data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['title', 'description', 'category', 'provider_name']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Create new resource
        resource = Resource(
            title=sanitize_input(data['title']),
            description=sanitize_input(data['description']),
            category=data['category'],
            provider_name=sanitize_input(data['provider_name']),
            provider_id=current_user.id
        )
        
        # Set optional fields
        if 'provider_contact' in data:
            resource.provider_contact = data['provider_contact']
            
        if 'location' in data:
            resource.location = data['location']
            
        if 'eligibility_criteria' in data:
            resource.eligibility_criteria = data['eligibility_criteria']
            
        if 'application_process' in data:
            resource.application_process = sanitize_input(data['application_process'])
            
        if 'required_documents' in data:
            resource.required_documents = data['required_documents']
            
        if 'capacity' in data:
            resource.capacity = int(data['capacity'])
            
        if 'availability' in data:
            resource.availability = data['availability']
            
        if 'start_date' in data:
            resource.start_date = data['start_date']
            
        if 'end_date' in data:
            resource.end_date = data['end_date']
        
        # Set initial status (admins can create active resources directly)
        if current_user.role == UserRole.ADMIN and 'status' in data:
            resource.status = data['status']
            resource.verification_date = datetime.utcnow()
            resource.verified_by = current_user.id
        else:
            # Providers create resources in PENDING status
            resource.status = ResourceStatus.PENDING
        
        # Save resource
        db.session.add(resource)
        db.session.commit()
        
        return jsonify({
            'message': 'Resource created successfully',
            'resource': resource.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@resources_bp.route('/<resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    """
    Update a specific resource by ID (owner or admin only).
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        resource_id (str): UUID of the resource to update
    
    Request body:
        title (str, optional): Resource title
        description (str, optional): Detailed description
        ... other resource fields
    
    Returns:
        JSON: Updated resource data on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Find resource to update
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    
    # Check permissions (resource owner or admin)
    is_owner = str(resource.provider_id) == str(current_user.id)
    is_admin = current_user.role == UserRole.ADMIN
    
    if not (is_owner or is_admin):
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get request data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Update resource fields
        if 'title' in data:
            resource.title = sanitize_input(data['title'])
            
        if 'description' in data:
            resource.description = sanitize_input(data['description'])
            
        if 'category' in data:
            resource.category = data['category']
            
        if 'provider_name' in data:
            resource.provider_name = sanitize_input(data['provider_name'])
            
        if 'provider_contact' in data:
            resource.provider_contact = data['provider_contact']
            
        if 'location' in data:
            resource.location = data['location']
            
        if 'eligibility_criteria' in data:
            resource.eligibility_criteria = data['eligibility_criteria']
            
        if 'application_process' in data:
            resource.application_process = sanitize_input(data['application_process'])
            
        if 'required_documents' in data:
            resource.required_documents = data['required_documents']
            
        if 'capacity' in data:
            resource.capacity = int(data['capacity'])
            
        if 'availability' in data:
            resource.availability = data['availability']
            
        if 'start_date' in data:
            resource.start_date = data['start_date']
            
        if 'end_date' in data:
            resource.end_date = data['end_date']
        
        # Admin-only fields
        if is_admin:
            if 'status' in data:
                resource.status = data['status']
                
                # If changing to active, set verification info
                if resource.status == ResourceStatus.ACTIVE:
                    resource.verification_date = datetime.utcnow()
                    resource.verified_by = current_user.id
        else:
            # Non-admins updating resources resets status to pending
            if resource.status == ResourceStatus.ACTIVE:
                resource.status = ResourceStatus.PENDING
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'message': 'Resource updated successfully',
            'resource': resource.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@resources_bp.route('/<resource_id>/apply', methods=['POST'])
@jwt_required()
def apply_for_resource(resource_id):
    """
    Apply for a specific resource.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        resource_id (str): UUID of the resource to apply for
    
    Request body:
        application_data (dict): Application form data
        notes (str, optional): Additional notes
    
    Returns:
        JSON: Application data on success, error message on failure
    """
    # Get current user
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Find resource
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    
    # Check if resource is active
    if resource.status != ResourceStatus.ACTIVE:
        return jsonify({'error': 'Cannot apply for inactive resource'}), 400
    
    # Check if user already has an active application for this resource
    existing_application = ResourceApplication.query.filter_by(
        user_id=user.id,
        resource_id=resource.id
    ).filter(
        ResourceApplication.status.in_([
            ApplicationStatus.DRAFT,
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.APPROVED,
            ApplicationStatus.WAITLISTED
        ])
    ).first()
    
    if existing_application:
        return jsonify({
            'error': 'You already have an active application for this resource',
            'application_id': str(existing_application.id),
            'status': existing_application.status.value
        }), 409
    
    # Get request data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Create application
        application = ResourceApplication(
            user_id=user.id,
            resource_id=resource.id,
            status=ApplicationStatus.SUBMITTED,
            application_data=data.get('application_data', {}),
            notes=sanitize_input(data.get('notes', '')),
            submitted_at=datetime.utcnow()
        )
        
        # Save application
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@resources_bp.route('/applications/<application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """
    Get a specific application by ID.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Path parameters:
        application_id (str): UUID of the application to retrieve
    
    Returns:
        JSON: Application data on success, error message on failure
    """
    # Get current user for permission check
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Find application
    application = ResourceApplication.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    # Check permissions (applicant, resource provider, or admin)
    is_applicant = str(application.user_id) == str(current_user.id)
    is_provider = str(application.resource.provider_id) == str(current_user.id)
    is_admin = current_user.role == UserRole.ADMIN
    
    if not (is_applicant or is_provider or is_admin):
        return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify({
        'application': application.to_dict()
    }), 200
