"""
Authentication service for CP2B Maps V3
Handles user registration, login, logout, and profile management using Supabase
"""
from typing import Dict, Any, Optional, Tuple
from fastapi import HTTPException, status
from datetime import datetime

from app.services.supabase_client import get_supabase_client
from app.models.auth import (
    UserRegistration,
    UserLogin,
    UserProfile,
    AuthResponse,
    UpdateProfile
)

class AuthService:
    """Authentication service using Supabase"""

    def __init__(self):
        self.supabase = get_supabase_client()

    async def register_user(self, registration: UserRegistration) -> AuthResponse:
        """
        Register a new user

        Args:
            registration: User registration data

        Returns:
            AuthResponse: Authentication response with token and user profile

        Raises:
            HTTPException: If registration fails
        """
        try:
            # Create user in Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": registration.email,
                "password": registration.password,
                "options": {
                    "data": {
                        "full_name": registration.full_name
                    }
                }
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user account"
                )

            # Get user profile (auto-created by trigger)
            profile_response = self.supabase.table("user_profiles").select("*").eq(
                "id", auth_response.user.id
            ).execute()

            if not profile_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile"
                )

            profile_data = profile_response.data[0]

            # Create user profile object
            user_profile = UserProfile(
                id=str(auth_response.user.id),
                email=auth_response.user.email,
                full_name=profile_data["full_name"],
                role=profile_data["role"],
                created_at=datetime.fromisoformat(profile_data["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(profile_data["updated_at"].replace('Z', '+00:00'))
            )

            return AuthResponse(
                access_token=auth_response.session.access_token,
                token_type="bearer",
                user=user_profile
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}"
            )

    async def login_user(self, login: UserLogin) -> AuthResponse:
        """
        Authenticate user and create session

        Args:
            login: User login credentials

        Returns:
            AuthResponse: Authentication response with token and user profile

        Raises:
            HTTPException: If login fails
        """
        try:
            # Authenticate with Supabase
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": login.email,
                "password": login.password
            })

            if not auth_response.user or not auth_response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            # Get user profile
            profile_response = self.supabase.table("user_profiles").select("*").eq(
                "id", auth_response.user.id
            ).execute()

            if not profile_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )

            profile_data = profile_response.data[0]

            # Create user profile object
            user_profile = UserProfile(
                id=str(auth_response.user.id),
                email=auth_response.user.email,
                full_name=profile_data["full_name"],
                role=profile_data["role"],
                created_at=datetime.fromisoformat(profile_data["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(profile_data["updated_at"].replace('Z', '+00:00'))
            )

            return AuthResponse(
                access_token=auth_response.session.access_token,
                token_type="bearer",
                user=user_profile
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Login failed: {str(e)}"
            )

    async def logout_user(self, access_token: str) -> Dict[str, str]:
        """
        Logout user and invalidate session

        Args:
            access_token: User's access token

        Returns:
            Dict with success message

        Raises:
            HTTPException: If logout fails
        """
        try:
            # Sign out the user - Supabase handles session invalidation
            self.supabase.auth.sign_out()

            return {"message": "Logout successful"}

        except Exception as e:
            # Log the error but still return success
            # Client should clear token regardless of server-side result
            import logging
            logging.getLogger(__name__).warning(f"Logout warning: {e}")
            return {"message": "Logout successful"}

    async def get_current_user(self, access_token: str) -> UserProfile:
        """
        Get current user profile from access token

        Args:
            access_token: User's access token

        Returns:
            UserProfile: Current user's profile

        Raises:
            HTTPException: If user not found or token invalid
        """
        try:
            # Verify token and get user
            user_response = self.supabase.auth.get_user(access_token)

            if not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )

            # Get user profile
            profile_response = self.supabase.table("user_profiles").select("*").eq(
                "id", user_response.user.id
            ).execute()

            if not profile_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )

            profile_data = profile_response.data[0]

            return UserProfile(
                id=str(user_response.user.id),
                email=user_response.user.email,
                full_name=profile_data["full_name"],
                role=profile_data["role"],
                created_at=datetime.fromisoformat(profile_data["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(profile_data["updated_at"].replace('Z', '+00:00'))
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {str(e)}"
            )

    async def update_user_profile(
        self,
        access_token: str,
        update_data: UpdateProfile
    ) -> UserProfile:
        """
        Update user profile

        Args:
            access_token: User's access token
            update_data: Profile update data

        Returns:
            UserProfile: Updated user profile

        Raises:
            HTTPException: If update fails
        """
        try:
            # Get current user
            current_user = await self.get_current_user(access_token)

            # Prepare update data
            update_dict = {}
            if update_data.full_name is not None:
                update_dict["full_name"] = update_data.full_name

            if not update_dict:
                return current_user  # Nothing to update

            # Update profile in database
            update_response = self.supabase.table("user_profiles").update(
                update_dict
            ).eq("id", current_user.id).execute()

            if not update_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update profile"
                )

            # Return updated profile
            return await self.get_current_user(access_token)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Profile update failed: {str(e)}"
            )

# Create global instance
auth_service = AuthService()
