from django.urls import path
from .views import UserProfileMeAPIView, UserListAPIView

app_name = 'users'

urlpatterns = [
    path('profile/me/', UserProfileMeAPIView.as_view(), name='profile-me'),

    path('all/', UserListAPIView.as_view(), name='user-list'), 
]