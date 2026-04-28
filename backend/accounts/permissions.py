from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'student'



class IsWorkplaceSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'workplace'


class IsAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'academic'


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

   # 🔥 ONLY student + academic supervisor can access logs 
class IsStudentOrAcademic(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in [
            'student',
            'academic',
        ]
    
class IsEvaluator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in [
            'academic',
            'workplace'
            'student'
        ]
    