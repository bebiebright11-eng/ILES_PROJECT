# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]