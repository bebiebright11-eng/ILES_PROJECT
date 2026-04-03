from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Organization(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name
    
class Application(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} → {self.organization} ({self.status})"
    
class Placement(models.Model):

    student = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    workplace_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_students',
        limit_choices_to={'role': 'workplace'}
    )

    academic_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_students',
        limit_choices_to={'role': 'academic'}
    )

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.student} Placement"
