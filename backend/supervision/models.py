from django.db import models
from django.conf import settings
from internships.models import Placement

User = settings.AUTH_USER_MODEL

class WeeklyLog(models.Model):

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)

    week_number = models.PositiveIntegerField()

    tasks = models.TextField()
    challenges = models.TextField(blank=True)

    attendance_days = models.PositiveIntegerField(default=5)

    supervisor_feedback = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Week {self.week_number} - {self.placement}"
    
class Evaluation(models.Model):

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)

    supervisor = models.ForeignKey(User, on_delete=models.CASCADE)

    score = models.IntegerField()
    comments = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluation - {self.placement}"

