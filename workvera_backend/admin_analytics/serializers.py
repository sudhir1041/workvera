from rest_framework import serializers

class BasicDashboardStatsSerializer(serializers.Serializer):
    """
    Serializer for basic dashboard statistics.
    This is a read-only serializer as data is aggregated in the view.
    """
    total_users = serializers.IntegerField()
    total_job_seekers = serializers.IntegerField()
    total_employers = serializers.IntegerField()
    total_job_posts = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    total_skill_tests = serializers.IntegerField()
    