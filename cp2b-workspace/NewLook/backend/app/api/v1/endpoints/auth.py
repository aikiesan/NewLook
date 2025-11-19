"""
Authentication API endpoints
Handles user registration, login, logout, and profile management
"""
from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials

from app.models.auth import (
    UserRegistration,
    UserLogin,
    AuthResponse,
    UserProfile,
    UpdateProfile,
    MessageResponse
)
from app.services.auth_service import auth_service
from app.middleware.auth import get_current_user, security

router = APIRouter()

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email and password"
)
async def register(registration: UserRegistration):
    """
    Register a new user account

    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **full_name**: User's full name

    Returns authentication token and user profile
    """
    return await auth_service.register_user(registration)

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login user",
    description="Authenticate user and create session"
)
async def login(login_data: UserLogin):
    """
    Authenticate user with email and password

    - **email**: User's email address
    - **password**: User's password

    Returns authentication token and user profile
    """
    return await auth_service.login_user(login_data)

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout user",
    description="Invalidate user session"
)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout current user and invalidate session

    Requires: Bearer token in Authorization header
    """
    access_token = credentials.credentials
    return await auth_service.logout_user(access_token)

@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get current user",
    description="Get authenticated user's profile information"
)
async def get_me(current_user: UserProfile = Depends(get_current_user)):
    """
    Get current authenticated user's profile

    Requires: Bearer token in Authorization header

    Returns user profile with role and metadata
    """
    return current_user

@router.put(
    "/me",
    response_model=UserProfile,
    summary="Update user profile",
    description="Update authenticated user's profile information"
)
async def update_me(
    update_data: UpdateProfile,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update current user's profile

    Requires: Bearer token in Authorization header

    - **full_name**: Updated full name (optional)

    Returns updated user profile
    """
    access_token = credentials.credentials
    return await auth_service.update_user_profile(access_token, update_data)

@router.get(
    "/verify",
    response_model=MessageResponse,
    summary="Verify token",
    description="Verify if authentication token is valid"
)
async def verify_token(current_user: UserProfile = Depends(get_current_user)):
    """
    Verify authentication token validity

    Requires: Bearer token in Authorization header

    Returns success message if token is valid
    """
    return MessageResponse(message=f"Token is valid for user: {current_user.email}")