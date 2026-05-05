from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Organization, Application, Placement
from .serializers import (
    OrganizationSerializer,
    ApplicationSerializer,
    PlacementSerializer
)

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]



class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
     #Have been added after getting an error in then frontend trying to apply . 
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    #Added such that when the application is approved, a placement is automatically created for the student.
    def perform_update(self, serializer):
        instance = serializer.save()

        # 🔥 Reject all other applications of this student
        Application.objects.filter(
            student=instance.student
        ).exclude(id=instance.id).update(status='rejected')




class PlacementViewSet(viewsets.ModelViewSet):
    queryset = Placement.objects.all()
    serializer_class = PlacementSerializer

