from rest_framework import serializers
from .models import Organization, Application, Placement


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
        # 🔥 ADD: organization name
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    # 🔥 ADD: student name
    student_name = serializers.CharField(source='student.username', read_only=True)
    class Meta:
        model = Application
        fields = '__all__'
        #Added for apply reasons
        read_only_fields = ['student']

class PlacementSerializer(serializers.ModelSerializer):
        # 🔥 ADD: organization name
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    status = serializers.CharField(read_only=True)

    is_fully_assigned = serializers.ReadOnlyField()
    workplace_supervisor_name = serializers.CharField(source='workplace_supervisor.username', read_only=True)
    academic_supervisor_name = serializers.CharField(source='academic_supervisor.username', read_only=True)

    # 🔥 ADD: student name
    student_name = serializers.CharField(source='student.username', read_only=True)
    class Meta:
        model = Placement
        fields = '__all__'