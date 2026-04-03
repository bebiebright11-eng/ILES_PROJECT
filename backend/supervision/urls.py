# supervision/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeeklyLogViewSet, EvaluationViewSet

router = DefaultRouter()
router.register(r'weeklylogs', WeeklyLogViewSet, basename='weeklylog')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')

urlpatterns = [
    path('', include(router.urls)),
]