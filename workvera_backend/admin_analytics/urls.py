from django.urls import path
from .views import AdminDashboardStatsAPIView, AdminUserListAPIView

app_name = 'core'

urlpatterns = [
    path('admin/stats/', AdminDashboardStatsAPIView.as_view(), name='admin-dashboard-stats'),
    path('admin/users/', AdminUserListAPIView.as_view(), name='admin-user-list'),
]