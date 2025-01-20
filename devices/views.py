# views.py

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import DeviceConfiguration, DeviceConfig, UserProfile, ActivityLog
from .serializers import DeviceConfigurationSerializer



# ---------------------------
#   Vistas basadas en DRF
# ---------------------------
class DeviceConfigView(APIView):
    def get(self, request):
        configs = DeviceConfiguration.objects.all()
        serializer = DeviceConfigurationSerializer(configs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DeviceConfigurationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------
#   Vistas de autenticación
# ---------------------------
from django.contrib.auth import authenticate, login

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Inicio de sesión exitoso.")
            return redirect('index')  # Cambia 'index' por la página principal de tu app
        else:
            messages.error(request, "Usuario o contraseña incorrectos.")
            return redirect('login')
    return render(request, 'devices/login.html')



@login_required
def logout_view(request):
    logout(request)
    messages.success(request, "Sesión cerrada con éxito.")
    return redirect('login')


@login_required
def protected_view(request):
    return render(request, 'devices/protected.html')


@login_required
def profile(request):
    return render(request, 'devices/profile.html', {'user': request.user})

# ---------------------------
#   Vistas de la aplicación
# ---------------------------
@login_required
def index(request):
    return render(request, 'devices/index.html')


@login_required
def pulsera(request):
    return render(request, 'devices/W6.html')


@login_required
def enchufe(request):
    return render(request, 'devices/MK107.html')


@login_required
def save_config(request):
    """Guarda la configuración de un dispositivo."""
    if request.method == 'POST':
        ssid = request.POST.get('ssid')
        password = request.POST.get('password')
        cliente = request.POST.get('cliente')
        localizacion = request.POST.get('localizacion')

        if ssid and password and cliente and localizacion:
            DeviceConfig.objects.create(
                ssid=ssid,
                password=password,
                cliente=cliente,
                localizacion=localizacion
            )
            return JsonResponse({'success': True, 'message': 'Configuración guardada con éxito.'})
        else:
            return JsonResponse({'success': False, 'message': 'Todos los campos son obligatorios.'})

    return JsonResponse({'success': False, 'message': 'Método no permitido.'})


@login_required
def list_configs(request):
    """Lista todas las configuraciones de los dispositivos."""
    configs = DeviceConfig.objects.all()
    return render(request, 'devices/config_list.html', {'configs': configs})


# ---------------------------
#   Registro de usuarios
# ---------------------------

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        location = request.POST.get('location')
        phone_number = request.POST.get('phone_number')

        # 1. Validar contraseñas
        if password != password_confirm:
            messages.error(request, "Las contraseñas no coinciden.")
            return redirect('register')

        # 2. Verificar que no exista el usuario
        if User.objects.filter(username=username).exists():
            messages.error(request, "El nombre de usuario ya está en uso.")
            return redirect('register')

        # 3. Crear el usuario
        user = User.objects.create_user(username=username, password=password)
        user.save()
        
        # (El UserProfile se creará automáticamente por la señal post_save)
        # Pero si quieres asignar location/phone_number de inmediato (sin esperar):
        user.profile.location = location
        user.profile.phone_number = phone_number
        user.profile.save()

        # 4. Iniciar sesión automáticamente
        login(request, user)
        messages.success(request, "Usuario registrado con éxito.")
        return redirect('profile')
    else:
        # GET: solo renderiza la plantilla
        return render(request, 'devices/register.html')

@login_required
def edit_profile(request):
    if request.method == 'POST':
        user = request.user
        user.profile.location = request.POST.get('location')
        user.profile.phone_number = request.POST.get('phone_number')
        user.profile.save()
        return redirect('profile')
    return render(request, 'devices/edit_profile.html')


@login_required
def activity_logs(request):
    """Muestra los registros de actividad del usuario."""
    logs = ActivityLog.objects.filter(user=request.user)
    return render(request, 'devices/activity_logs.html', {'logs': logs})
