"""
Admin API endpoints for the PovertyLine API.

This module defines routes for admin operations, including user management,
resource approval, and analytics data.
"""
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc, and_

from app.models import (
    db, User, UserRole, VerificationStatus, 
    Profile, Resource, ResourceStatus, 
    ResourceApplication, ApplicationStatus, Region
)

admin_bp = Blueprint('admin', __name__)


@admin_bp.before_request
def check_admin():
    """
    Middleware to check if the user is an admin before processing any request.
    """
    # Skip check for OPTIONS requests (CORS preflight)
    if request.method == 'OPTIONS':
        return
        
    # Get current user ID from JWT
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({'error': 'Authentication required'}), 401
        
    # Check if user exists and is an admin
    user = User.query.get(current_user_id)
    if not user or user.role != UserRole.ADMIN:
        return jsonify({'error': 'Admin privileges required'}), 403


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """
    Get summary data for the admin dashboard.
    
    Returns:
        JSON: Dashboard summary data
    """
    # Get counts for various entities
    user_count = User.query.count()
    profile_count = Profile.query.count()
    resource_count = Resource.query.count()
    application_count = ResourceApplication.query.count()
    
    # Get pending resources count
    pending_resources_count = Resource.query.filter_by(status=ResourceStatus.PENDING).count()
    
    # Get pending applications count
    pending_applications_count = ResourceApplication.query.filter_by(
        status=ApplicationStatus.SUBMITTED
    ).count()
    
    # Get user registration trend (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    user_trend = db.session.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= seven_days_ago
    ).group_by(
        func.date(User.created_at)
    ).order_by(
        func.date(User.created_at)
    ).all()
    
    # Format user trend data
    user_trend_data = [
        {'date': date.strftime('%Y-%m-%d'), 'count': count}
        for date, count in user_trend
    ]
    
    # Get resource categories distribution
    resource_categories = db.session.query(
        Resource.category,
        func.count(Resource.id).label('count')
    ).group_by(
        Resource.category
    ).order_by(
        desc('count')
    ).all()
    
    # Format resource categories data
    resource_categories_data = [
        {'category': category.value, 'count': count}
        for category, count in resource_categories
    ]
    
    # Get user roles distribution
    user_roles = db.session.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(
        User.role
    ).order_by(
        desc('count')
    ).all()
    
    # Format user roles data
    user_roles_data = [
        {'role': role.value, 'count': count}
        for role, count in user_roles
    ]
    
    # Get recent activity
    recent_users = User.query.order_by(desc(User.created_at)).limit(5).all()
    recent_resources = Resource.query.order_by(desc(Resource.created_at)).limit(5).all()
    recent_applications = ResourceApplication.query.order_by(
        desc(ResourceApplication.created_at)
    ).limit(5).all()
    
    return jsonify({
        'summary': {
            'users': user_count,
            'profiles': profile_count,
            'resources': resource_count,
            'applications': application_count,
            'pending_resources': pending_resources_count,
            'pending_applications': pending_applications_count,
        },
        'trends': {
            'user_registrations': user_trend_data,
        },
        'distributions': {
            'resource_categories': resource_categories_data,
            'user_roles': user_roles_data,
        },
        'recent_activity': {
            'users': [user.to_dict() for user in recent_users],
            'resources': [resource.to_dict() for resource in recent_resources],
            'applications': [application.to_dict() for application in recent_applications],
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_admin_users():
    """
    Get a paginated list of all users with filtering options.
    
    Query parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20)
        role (str): Filter by role
        status (str): Filter by verification status
        search (str): Search by username or email
        
    Returns:
        JSON: List of users
    """
    # Parse query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    role = request.args.get('role')
    status = request.args.get('status')
    search = request.args.get('search')
    
    # Build query
    query = User.query
    
    # Apply role filter
    if role:
        try:
            query = query.filter_by(role=UserRole(role))
        except ValueError:
            pass
    
    # Apply status filter
    if status:
        try:
            query = query.filter_by(verification_status=VerificationStatus(status))
        except ValueError:
            pass
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.username.ilike(search_term)) | 
            (User.email.ilike(search_term))
        )
    
    # Execute paginated query
    pagination = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }), 200


@admin_bp.route('/users/<user_id>/verify', methods=['PUT'])
@jwt_required()
def verify_user(user_id):
    """
    Update a user's verification status.
    
    Path parameters:
        user_id (str): UUID of the user to update
        
    Request body:
        status (str): New verification status
        
    Returns:
        JSON: Updated user data
    """
    # Get user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get request data
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    # Update verification status
    try:
        user.verification_status = VerificationStatus(data['status'])
        db.session.commit()
        
        return jsonify({
            'message': 'User verification status updated',
            'user': user.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid verification status'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/resources/pending', methods=['GET'])
@jwt_required()
def get_pending_resources():
    """
    Get a list of resources pending approval.
    
    Query parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20)
        
    Returns:
        JSON: List of pending resources
    """
    # Parse query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    # Get pending resources
    pagination = Resource.query.filter_by(
        status=ResourceStatus.PENDING
    ).order_by(
        Resource.created_at
    ).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'resources': [resource.to_dict() for resource in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }), 200


@admin_bp.route('/resources/<resource_id>/approve', methods=['PUT'])
@jwt_required()
def approve_resource(resource_id):
    """
    Approve or reject a pending resource.
    
    Path parameters:
        resource_id (str): UUID of the resource to approve/reject
        
    Request body:
        status (str): New status (active or rejected)
        notes (str, optional): Notes about the decision
        
    Returns:
        JSON: Updated resource data
    """
    # Get current user ID
    current_user_id = get_jwt_identity()
    
    # Get resource
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    
    # Check if resource is pending
    if resource.status != ResourceStatus.PENDING:
        return jsonify({'error': 'Resource is not pending approval'}), 400
    
    # Get request data
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    # Update resource status
    try:
        new_status = ResourceStatus(data['status'])
        
        # Only allow active or rejected status
        if new_status not in [ResourceStatus.ACTIVE, ResourceStatus.INACTIVE]:
            return jsonify({'error': 'Invalid status for approval'}), 400
        
        resource.status = new_status
        resource.verification_date = datetime.utcnow()
        resource.verified_by = current_user_id
        
        # Add notes if provided
        if 'notes' in data:
            # We would need to add a notes field to the Resource model
            # For now, we'll just ignore it
            pass
        
        db.session.commit()
        
        return jsonify({
            'message': f'Resource {new_status.value}',
            'resource': resource.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid status'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/applications/pending', methods=['GET'])
@jwt_required()
def get_pending_applications():
    """
    Get a list of applications pending review.
    
    Query parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20)
        
    Returns:
        JSON: List of pending applications
    """
    # Parse query parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    # Get pending applications
    pagination = ResourceApplication.query.filter_by(
        status=ApplicationStatus.SUBMITTED
    ).order_by(
        ResourceApplication.submitted_at
    ).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'applications': [application.to_dict() for application in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }), 200


@admin_bp.route('/applications/<application_id>/review', methods=['PUT'])
@jwt_required()
def review_application(application_id):
    """
    Review an application and update its status.
    
    Path parameters:
        application_id (str): UUID of the application to review
        
    Request body:
        status (str): New status
        reason (str, optional): Reason for the decision
        admin_notes (str, optional): Admin-only notes
        
    Returns:
        JSON: Updated application data
    """
    # Get current user ID
    current_user_id = get_jwt_identity()
    
    # Get application
    application = ResourceApplication.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    # Check if application is submitted
    if application.status != ApplicationStatus.SUBMITTED:
        return jsonify({'error': 'Application is not pending review'}), 400
    
    # Get request data
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    # Update application status
    try:
        new_status = ApplicationStatus(data['status'])
        
        # Only allow certain statuses for review
        valid_statuses = [
            ApplicationStatus.APPROVED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.WAITLISTED,
            ApplicationStatus.UNDER_REVIEW
        ]
        
        if new_status not in valid_statuses:
            return jsonify({'error': 'Invalid status for review'}), 400
        
        # Use the review method from the ResourceApplication model
        application.review(
            reviewer_id=current_user_id,
            status=new_status,
            reason=data.get('reason'),
            admin_notes=data.get('admin_notes')
        )
        
        return jsonify({
            'message': f'Application {new_status.value}',
            'application': application.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid status'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/analytics/users', methods=['GET'])
@jwt_required()
def get_user_analytics():
    """
    Get detailed analytics about users.
    
    Query parameters:
        period (str): Time period for trend data (week, month, year)
        
    Returns:
        JSON: User analytics data
    """
    # Parse query parameters
    period = request.args.get('period', 'week')
    
    # Determine date range based on period
    now = datetime.utcnow()
    if period == 'week':
        start_date = now - timedelta(days=7)
        group_by = func.date(User.created_at)
    elif period == 'month':
        start_date = now - timedelta(days=30)
        group_by = func.date(User.created_at)
    elif period == 'year':
        start_date = now - timedelta(days=365)
        group_by = func.date_trunc('month', User.created_at)
    else:
        return jsonify({'error': 'Invalid period'}), 400
    
    # Get user registration trend
    user_trend = db.session.query(
        group_by.label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        group_by
    ).order_by(
        group_by
    ).all()
    
    # Format user trend data
    user_trend_data = [
        {'date': date.strftime('%Y-%m-%d'), 'count': count}
        for date, count in user_trend
    ]
    
    # Get user roles distribution
    user_roles = db.session.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(
        User.role
    ).order_by(
        desc('count')
    ).all()
    
    # Format user roles data
    user_roles_data = [
        {'role': role.value, 'count': count}
        for role, count in user_roles
    ]
    
    # Get verification status distribution
    verification_statuses = db.session.query(
        User.verification_status,
        func.count(User.id).label('count')
    ).group_by(
        User.verification_status
    ).order_by(
        desc('count')
    ).all()
    
    # Format verification status data
    verification_status_data = [
        {'status': status.value, 'count': count}
        for status, count in verification_statuses
    ]
    
    # Get profile completion distribution
    profile_completion = db.session.query(
        func.floor(Profile.completion_percentage / 10) * 10,
        func.count(Profile.id)
    ).group_by(
        func.floor(Profile.completion_percentage / 10) * 10
    ).order_by(
        func.floor(Profile.completion_percentage / 10) * 10
    ).all()
    
    # Format profile completion data
    profile_completion_data = [
        {'range': f"{int(range_start)}-{int(range_start) + 9}%", 'count': count}
        for range_start, count in profile_completion
    ]
    
    return jsonify({
        'trends': {
            'registrations': user_trend_data,
        },
        'distributions': {
            'roles': user_roles_data,
            'verification_status': verification_status_data,
            'profile_completion': profile_completion_data,
        }
    }), 200


@admin_bp.route('/analytics/resources', methods=['GET'])
@jwt_required()
def get_resource_analytics():
    """
    Get detailed analytics about resources.
    
    Query parameters:
        period (str): Time period for trend data (week, month, year)
        
    Returns:
        JSON: Resource analytics data
    """
    # Parse query parameters
    period = request.args.get('period', 'week')
    
    # Determine date range based on period
    now = datetime.utcnow()
    if period == 'week':
        start_date = now - timedelta(days=7)
        group_by = func.date(Resource.created_at)
    elif period == 'month':
        start_date = now - timedelta(days=30)
        group_by = func.date(Resource.created_at)
    elif period == 'year':
        start_date = now - timedelta(days=365)
        group_by = func.date_trunc('month', Resource.created_at)
    else:
        return jsonify({'error': 'Invalid period'}), 400
    
    # Get resource creation trend
    resource_trend = db.session.query(
        group_by.label('date'),
        func.count(Resource.id).label('count')
    ).filter(
        Resource.created_at >= start_date
    ).group_by(
        group_by
    ).order_by(
        group_by
    ).all()
    
    # Format resource trend data
    resource_trend_data = [
        {'date': date.strftime('%Y-%m-%d'), 'count': count}
        for date, count in resource_trend
    ]
    
    # Get resource categories distribution
    resource_categories = db.session.query(
        Resource.category,
        func.count(Resource.id).label('count')
    ).group_by(
        Resource.category
    ).order_by(
        desc('count')
    ).all()
    
    # Format resource categories data
    resource_categories_data = [
        {'category': category.value, 'count': count}
        for category, count in resource_categories
    ]
    
    # Get resource status distribution
    resource_statuses = db.session.query(
        Resource.status,
        func.count(Resource.id).label('count')
    ).group_by(
        Resource.status
    ).order_by(
        desc('count')
    ).all()
    
    # Format resource status data
    resource_status_data = [
        {'status': status.value, 'count': count}
        for status, count in resource_statuses
    ]
    
    # Get application status distribution
    application_statuses = db.session.query(
        ResourceApplication.status,
        func.count(ResourceApplication.id).label('count')
    ).group_by(
        ResourceApplication.status
    ).order_by(
        desc('count')
    ).all()
    
    # Format application status data
    application_status_data = [
        {'status': status.value, 'count': count}
        for status, count in application_statuses
    ]
    
    return jsonify({
        'trends': {
            'creations': resource_trend_data,
        },
        'distributions': {
            'categories': resource_categories_data,
            'statuses': resource_status_data,
            'application_statuses': application_status_data,
        }
    }), 200


@admin_bp.route('/export/users', methods=['GET'])
@jwt_required()
def export_users():
    """
    Export user data for reporting.
    
    Query parameters:
        format (str): Export format (json, csv)
        
    Returns:
        JSON: User data for export
    """
    # For now, we'll just return JSON data
    # In a real implementation, this would generate CSV or other formats
    
    users = User.query.all()
    user_data = [user.to_dict() for user in users]
    
    return jsonify({
        'data': user_data,
        'count': len(user_data),
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@admin_bp.route('/export/resources', methods=['GET'])
@jwt_required()
def export_resources():
    """
    Export resource data for reporting.
    
    Query parameters:
        format (str): Export format (json, csv)
        
    Returns:
        JSON: Resource data for export
    """
    # For now, we'll just return JSON data
    # In a real implementation, this would generate CSV or other formats
    
    resources = Resource.query.all()
    resource_data = [resource.to_dict() for resource in resources]
    
    return jsonify({
        'data': resource_data,
        'count': len(resource_data),
        'timestamp': datetime.utcnow().isoformat()
    }), 200
