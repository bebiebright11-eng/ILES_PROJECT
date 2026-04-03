# internships/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, ApplicationViewSet, PlacementViewSet

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'placements', PlacementViewSet, basename='placement')

urlpatterns = [
    path('', include(router.urls)),
]