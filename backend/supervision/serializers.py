from rest_framework import serializers
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore


class WeeklyLogSerializer(serializers.ModelSerializer):
                # 🔥 ADD THIS: show student name instead of ID
    student_name = serializers.CharField(source='placement.student.username', read_only=True)

    # 🔥 ADD THIS: show organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)
    class Meta:
        model = WeeklyLog
        fields = '__all__'

class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriteria
        fields = '__all__'


class CriteriaScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriteriaScore
        fields = ['id', 'criteria', 'score']


class EvaluationSerializer(serializers.ModelSerializer):
        # 🔥 ADD: student name
    student_name = serializers.CharField(source='placement.student.username', read_only=True)

    # 🔥 ADD: organization name
    organization_name = serializers.CharField(source='placement.organization.name', read_only=True)

    # 🔥 ADD: supervisor name
    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)
    # 🔥 ADD THIS LINE
    supervisor = serializers.HiddenField(default=serializers.CurrentUserDefault())
    criteria_scores = CriteriaScoreSerializer(many=True)

    class Meta:
        model = Evaluation
        fields = [
            'id',
            'placement',
            'supervisor',
            'supervisor_type',
            'score',
            'comments',
            'final_grade',
            'is_final',
            'criteria_scores'
        ]

    def create(self, validated_data):
        criteria_data = validated_data.pop('criteria_scores')
        evaluation = Evaluation.objects.create(**validated_data)

        total = 0

        for item in criteria_data:
            CriteriaScore.objects.create(
                evaluation=evaluation,
                criteria=item['criteria'],
                score=item['score']
            )
            total += item['score']

        #  auto total scor
        evaluation.score = total

        #  if academic → final
        if evaluation.supervisor_type == 'academic':
            evaluation.final_grade = total
            evaluation.is_final = True

        evaluation.save()

        return evaluation