from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from django.contrib.auth import get_user_model 
from users.models import Profile 
from jobs.models import JobPost, Application
from skills.models import SkillTest, SkillResult
from users.serializers import CustomUserSerializer 
from .serializers import BasicDashboardStatsSerializer
from django_filters.rest_framework import DjangoFilterBackend 

CustomUser = get_user_model()

class AdminDashboardStatsAPIView(APIView):
    """
    API endpoint for basic admin dashboard statistics.
    GET /api/core/admin/stats/
    """
    permission_classes = [permissions.IsAdminUser] 

    def get(self, request, *args, **kwargs):
        stats = {
            'total_users': CustomUser.objects.count(),
            'total_job_seekers': CustomUser.objects.filter(role='seeker').count(),
            'total_employers': CustomUser.objects.filter(role='employer').count(),
            'total_job_posts': JobPost.objects.count(),
            'total_applications': Application.objects.count(),
            'total_skill_tests': SkillTest.objects.count(),
            # 'active_job_posts': JobPost.objects.filter(is_active=True).count(),
            # 'applications_today': Application.objects.filter(applied_at__date=timezone.now().date()).count(),
        }
        serializer = BasicDashboardStatsSerializer(data=stats)
        serializer.is_valid() # Data is constructed, so it should be valid
        return Response(serializer.data)


class AdminUserListAPIView(generics.ListAPIView):
    """
    API endpoint for listing users with filters for admin.
    GET /api/core/admin/users/
    Example filters: /api/core/admin/users/?role=seeker&is_active=true
    """
    queryset = CustomUser.objects.all().order_by('email')
    serializer_class = CustomUserSerializer 
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend] 
    filterset_fields = ['role', 'is_active', 'is_staff'] 
    # search_fields = ['email', 'name', 'profile__location'] 
    # filterset_class = UserFilterSet (define this class in a filters.py file)