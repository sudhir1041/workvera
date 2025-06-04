from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, SkillTestViewSet, SkillResultViewSet

router = DefaultRouter()
router.register(r'definitions', SkillViewSet, basename='skill-definition') 
router.register(r'tests', SkillTestViewSet, basename='skilltest')
router.register(r'results', SkillResultViewSet, basename='skillresult')

app_name = 'skills'

urlpatterns = [
    path('', include(router.urls)),
    # /api/skills/tests/<id>/submit/
    # /api/skills/results/me/
]
