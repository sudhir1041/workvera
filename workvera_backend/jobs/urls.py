from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'posts', JobPostViewSet, basename='jobpost') 
router.register(r'applications', ApplicationViewSet, basename='application')

app_name = 'jobs'

urlpatterns = [
    path('', include(router.urls)),
    # path('', JobPostListCreateView.as_view(), name='jobpost-list-create'),
    # path('<int:pk>/', JobPostDetailView.as_view(), name='jobpost-detail'),
    # path('<int:pk>/apply/', JobApplicationView.as_view(), name='jobpost-apply'),
   
]

