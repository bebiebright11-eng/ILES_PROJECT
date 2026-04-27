from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore
from .serializers import (
    WeeklyLogSerializer,
    EvaluationSerializer,
    EvaluationCriteriaSerializer,
    CriteriaScoreSerializer
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from accounts.permissions import IsStudentOrAcademic, IsEvaluator
from rest_framework.response import Response
from rest_framework import status


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated, IsStudentOrAcademic]

    def get_queryset(self):
        user = self.request.user

    # 🔹 STUDENT → only their own logs
        if user.role == 'student':
            return WeeklyLog.objects.filter(
                placement__student=user
           )

    # 🔹 ACADEMIC SUPERVISOR → only logs of their assigned students
        if user.role == 'academic':
            return WeeklyLog.objects.filter(
                placement__academic_supervisor=user
           )

    #  🚫 Everyone else sees nothing
        return WeeklyLog.objects.none()
    

    

    def perform_create(self, serializer):
    # 🔹 Only students can create weekly logs
        if self.request.user.role != 'student':
            raise PermissionDenied("Only students can submit weekly logs")

        serializer.save()




class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

    # 👨‍🎓 Student → only their evaluation (read-only)
        if user.role == 'student':
            return Evaluation.objects.filter(
               placement__student=user
           )

    # 👨‍🏫 Workplace → only evaluations they created
        if user.role == 'workplace':
            return Evaluation.objects.filter(
               supervisor=user
            )

    # 👨‍🏫 Academic → evaluations for their students
        if user.role == 'academic':
            return Evaluation.objects.filter(
               placement__academic_supervisor=user
           )

    # 🚫 Admin → no direct access here
        return Evaluation.objects.none()
    

    
    
    def perform_create(self, serializer):
        user = self.request.user

    # ❌ Students cannot create
        if user.role == 'student':
            raise PermissionDenied("Students cannot create evaluations")

    # ❌ Admin cannot create
        if user.role == 'admin':
            raise PermissionDenied("Admin cannot create evaluations")

    
    
    # ✅ Workplace creates evaluation (criteria scoring)
        # 🔒 Prevent duplicate evaluation per supervisor type
        exists = Evaluation.objects.filter(
            placement=serializer.validated_data['placement'],
            supervisor=user,
            supervisor_type=serializer.validated_data['supervisor_type']
        ).exists()

        if exists:
            raise PermissionDenied("Evaluation already exists for this type")

        serializer.save(supervisor=user)

    def create(self, request, *args, **kwargs):
        user = request.user

        # 🔥 ALLOW ONLY workplace supervisors
        if user.role != "workplace":
            return Response(
                {"error": "Only workplace supervisors can submit evaluations"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().create(request, *args, **kwargs)

    

    def perform_update(self, serializer):
        user = self.request.user
 

    # 👨‍🏫 Workplace → can ONLY edit criteria scores
        if user.role == 'workplace':
        # Prevent setting final grade
            serializer.save(
                final_grade=None,
                is_final=False
           )
            return

    # 👨‍🏫 Academic → can finalize evaluation
        if user.role == 'academic':
            serializer.save()
            return

    # ❌ Others blocked
        raise PermissionDenied("You cannot update this evaluation")
    



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