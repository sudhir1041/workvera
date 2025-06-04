from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

app_name = 'community'

urlpatterns = [
    path('', include(router.urls)),
    # Actions are part of ViewSets:
    # /api/community/posts/<id>/comments/ (GET)
    # /api/community/posts/<id>/comment/ (POST)
]