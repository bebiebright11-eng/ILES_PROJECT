from rest_framework import viewsets
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore
from .serializers import (
    WeeklyLogSerializer,
    EvaluationSerializer,
    EvaluationCriteriaSerializer,
    CriteriaScoreSerializer
)

from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStudentOrSupervisor, IsEvaluator


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'student':
            return WeeklyLog.objects.filter(placement__student=user)

        return WeeklyLog.objects.all()


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'student':
            return Evaluation.objects.filter(placement__student=user)

        return Evaluation.objects.filter(supervisor=user)



class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAuthenticated]


class CriteriaScoreViewSet(viewsets.ModelViewSet):
    queryset = CriteriaScore.objects.all()
    serializer_class = CriteriaScoreSerializer
    permission_classes = [IsAuthenticated, IsEvaluator]

    def get_queryset(self):
        user = self.request.user
        return CriteriaScore.objects.filter(evaluation__supervisor=user)