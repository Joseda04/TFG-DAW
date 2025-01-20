# forms.py
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class CustomUserCreationForm(UserCreationForm):
    # Campos extra si los deseas directamente aquí
    email = forms.EmailField(required=True, help_text="Ingresa tu correo electrónico")
    # Aunque con el UserProfile, normalmente bastaría con los de User
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')  # Ajusta según necesidades
