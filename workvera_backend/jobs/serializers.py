from rest_framework import serializers
from .models import JobPost, Application
from users.serializers import CustomUserSerializer

class JobPostSerializer(serializers.ModelSerializer):
    employer_detail = CustomUserSerializer(source='employer', read_only=True)

    class Meta:
        model = JobPost
        fields = (
            'id',
            'title', 
            'description',
            'employer',
            'employer_detail',
            'skill_tags',
            'gap_friendly',
            'location',
            'job_type',
            'posted_at',
            'updated_at',
            'is_active',
        )
        read_only_fields = ('posted_at', 'updated_at', 'employer_detail', 'is_active')

    def validate_employer(self, value):
        """
        Ensure the user creating the job is an employer.
        This validation is also handled by the view's permission.
        """
        if value.role != 'employer':
            raise serializers.ValidationError("Only users with the 'employer' role can post jobs.")
        return value


class ApplicationSerializer(serializers.ModelSerializer):
    user_detail = CustomUserSerializer(source='user', read_only=True)
    job_detail = JobPostSerializer(source='job', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id',
            'user',
            'user_detail',
            'job',
            'job_detail',
            'status',
            'applied_at',
            'cover_letter',
        )
        read_only_fields = ('applied_at', 'user_detail', 'job_detail', 'status')

    def validate_user(self, value):
        """
        Ensure the user applying is a seeker.
        This validation is also handled by the view's permission.
        """
        if value.role != 'seeker':
            raise serializers.ValidationError("Only users with the 'seeker' role can apply for jobs.")
        return value

    def validate(self, data):
        """
        Check that the user hasn't already applied for this job.
        """
        user = self.context['request'].user
        job = data.get('job')

        if Application.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        return data
