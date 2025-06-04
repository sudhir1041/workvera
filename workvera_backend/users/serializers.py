from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from .models import CustomUser, Profile

class CustomUserCreateSerializer(BaseUserCreateSerializer):
    # Djoser's UserCreateSerializer already handles password confirmation.
    # registration.
    class Meta(BaseUserCreateSerializer.Meta):
        model = CustomUser
        fields = ('id', 'email', 'name', 'role', 'password') 

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'name', 'role', 'first_name', 'last_name', 'is_staff') 
        read_only_fields = ('is_staff',)


class ProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Profile
        fields = (
            'id',
            'user', 
            'user_email',
            'user_name',
            'resume',
            'video_pitch',
            'career_gap_years',
            'bio',
            'linkedin_url',
            'github_url',
            # Add other profile fields
        )
        read_only_fields = ('user',) 

    def validate_resume(self, value):
        # Add validation for resume file type, size, etc. if needed
        # Example: if value.size > 5 * 1024 * 1024:  # 5MB
        # raise serializers.ValidationError("Resume file size should not exceed 5MB.")
        return value

    def validate_video_pitch(self, value):
        # Add validation for video file type, size, etc. if needed
        return value