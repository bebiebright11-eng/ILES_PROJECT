# supervision/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CriteriaScoreViewSet, EvaluationCriteriaViewSet, WeeklyLogViewSet, EvaluationViewSet

router = DefaultRouter()
router.register(r'weeklylogs', WeeklyLogViewSet, basename='weeklylog')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'criteria', EvaluationCriteriaViewSet, basename='criteria')
router.register(r'scores', CriteriaScoreViewSet, basename='score')

urlpatterns = [
    path('', include(router.urls)),
]