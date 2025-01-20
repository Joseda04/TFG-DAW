# models.py

from django.db import models
from django.contrib.auth.models import User


class DeviceConfiguration(models.Model):
    ssid = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    cliente = models.CharField(max_length=255)
    localizacion = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cliente} - {self.ssid}"


class DeviceConfig(models.Model):
    ssid = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    cliente = models.CharField(max_length=255)
    localizacion = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cliente} - {self.ssid}"



class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    location = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"


class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"
