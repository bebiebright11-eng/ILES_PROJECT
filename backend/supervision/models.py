from django.db import models
from django.conf import settings
from internships.models import Placement
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class WeeklyLog(models.Model):

    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
    )

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    week_number = models.PositiveIntegerField()

    tasks = models.TextField()
    challenges = models.TextField(blank=True)

    attendance_days = models.PositiveIntegerField(default=5)

    supervisor_feedback = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')

    class Meta:
        unique_together = ['placement', 'week_number']

    def __str__(self):
        return f"Week {self.week_number} - {self.placement}"


class Evaluation(models.Model):

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE)

    # ✅ IMPORTANT ADDITION
    supervisor_type = models.CharField(
        max_length=20,
        choices=(
            ('workplace', 'Workplace Supervisor'),
            ('academic', 'Academic Supervisor'),
        )
    )

    score = models.IntegerField(default=0)
    comments = models.TextField()

    final_grade = models.FloatField(null=True, blank=True)
    is_final = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['placement', 'supervisor']

    def __str__(self):
        return f"{self.supervisor_type} - {self.placement}"


class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=100)
    max_score = models.IntegerField()

    def __str__(self):
        return self.name


class CriteriaScore(models.Model):
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name='criteria_scores' 
    )
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)
    score = models.IntegerField()

    def clean(self):
        if self.score > self.criteria.max_score:
            raise ValidationError(f"Score cannot exceed {self.criteria.max_score}")

    def __str__(self):
        return f"{self.criteria} - {self.score}"
