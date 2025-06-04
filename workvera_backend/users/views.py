from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Profile, CustomUser
from .serializers import ProfileSerializer, CustomUserSerializer

# Djoser handles /register and /login
# /api/auth/users/ for user creation (POST) - uses CustomUserCreateSerializer
# /api/auth/token/login/ for login (POST) - returns token
# /api/auth/users/me/ for current user details (GET, PUT, PATCH, DELETE) - uses CustomUserSerializer

class UserProfileMeAPIView(generics.RetrieveUpdateAPIView):
    """
    Get or Update the profile of the currently authenticated user.
    GET /api/users/profile/me/
    PUT /api/users/profile/me/
    PATCH /api/users/profile/me/ (Partial update)
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
        serializer.save()

class UserListAPIView(generics.ListAPIView):
    """
    List all users. (Example: For admin or specific roles)
    GET /api/users/all/
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAdminUser] 
