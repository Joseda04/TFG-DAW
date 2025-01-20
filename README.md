# Gestión de Dispositivos IoT con Django y JavaScript

## Descripción
Este proyecto consiste en una aplicación web desarrollada con Django y JavaScript, diseñada para gestionar dispositivos IoT de manera eficiente. La solución aborda problemáticas específicas dentro del ámbito tecnológico, proporcionando una herramienta funcional y escalable para usuarios que buscan optimizar la administración de dispositivos conectados.

La aplicación incluye características como:
- Gestión de dispositivos IoT (enchufes inteligentes, pulseras, etc.).
- Panel de control personalizado para cada usuario.
- Interfaces responsivas e intuitivas, diseñadas con Bootstrap.
- Bases de datos relacionales implementadas con SQLite.

## Tecnologías Utilizadas
- **Backend:** Django (Python)
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap
- **Base de datos:** SQLite
- **Servidor:** Gunicorn + NGINX
- **Control de versiones:** Git

## Características Principales
1. **Gestión de Dispositivos:**
   - Añadir, editar y eliminar dispositivos IoT.
   - Control en tiempo real de los dispositivos conectados.
2. **Interfaz Amigable:**
   - Diseño responsivo adaptado a múltiples dispositivos.
   - Funcionalidades accesibles desde una interfaz intuitiva.
3. **Escalabilidad:**
   - Arquitectura diseñada para futuros desarrollos y ampliaciones.
4. **Seguridad:**
   - Gestión segura de usuarios y autenticación.

## Instalación
### Prerrequisitos
Asegúrate de tener instalados los siguientes programas:
- Python 3.10 o superior
- Git
- Virtualenv
- SQLite

### Instrucciones
1. Clona el repositorio:
   ```bash
   git clone <URL del repositorio>
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd tfg_josedavid
   ```
3. Crea un entorno virtual:
   ```bash
   python -m venv venv
   ```
4. Activa el entorno virtual:
   - En Windows:
     ```bash
     venv\Scripts\activate
     ```
   - En macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
5. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
6. Realiza las migraciones de la base de datos:
   ```bash
   python manage.py migrate
   ```
7. Ejecuta el servidor:
   ```bash
   python manage.py runserver
   ```
8. Accede a la aplicación en tu navegador:
   ```
   http://127.0.0.1:8000
   ```

## Uso
1. Regístrate o inicia sesión en la aplicación.
2. Agrega tus dispositivos IoT desde el panel de control.
3. Configura y administra tus dispositivos en tiempo real.

## Estructura del Proyecto
```
.
├── devices/            # Aplicación específica para la gestión de dispositivos
├── tfg_josedavid/      # Configuración principal del proyecto
├── db.sqlite3          # Base de datos local
├── manage.py           # Script de gestión del proyecto
├── requirements.txt    # Dependencias del proyecto
```

## Contribución
Las contribuciones son bienvenidas. Si deseas contribuir:
1. Haz un fork del proyecto.
2. Crea una rama con tu funcionalidad:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza un pull request cuando hayas terminado.

## Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Autor
**Jose David Tabernero Vivancos**  
Este proyecto fue desarrollado como parte del Trabajo de Fin de Grado del Ciclo Formativo de Grado Superior de Desarrollo de Aplicaciones Web (Curso 2024-2025).
