# Armario Virtual

Aplicación móvil y API backend para la gestión integral de guardarropa personal. Permite digitalizar prendas, consultar el clima local en tiempo real y generar combinaciones (outfits) inteligentes asistidas por inteligencia artificial.


## Tecnologías

**Backend**

* **Python 3.10+**
* **FastAPI**: Desarrollo de APIs RESTful.
* **SQLAlchemy & Pydantic**: ORM para gestión de base de datos relacional y validación de esquemas.
* **OpenAI API / Gemini API**: Modelos de visión y lenguaje para análisis de prendas y generación de atuendos.
* **OpenWeatherMap API**: Integración de pronósticos meteorológicos.
* **Pytest**: Pruebas unitarias e integración.

**Frontend**

* **React Native & Expo**: Framework multiplataforma móvil.
* **Expo Router**: Enrutamiento basado en archivos (`app/`).
* **Redux Toolkit**: Gestión reactiva del estado global (`store`, `slices`).
* **Firebase Authentication**: Autenticación segura de usuarios.
* **Cloudinary**: Almacenamiento y optimización de imágenes en la nube.
* **pnpm**: Gestor de paquetes y dependencias.


## Funcionalidades

* **Autenticación de Usuarios**: Registro, inicio de sesión y persistencia de sesión con Firebase.
* **Digitalización de Prendas**:
* **Carga manual**: Registro detallado por tipo, categoría, colores y temporadas.
* **Carga asistida por IA**: Análisis de imágenes subidas para clasificar y etiquetar automáticamente prendas.
* **Creación y Gestión de Outfits**:
* **Generación manual**: Ensamblado directo de prendas del catálogo propio.
* **Recomendación por IA**: Sugerencias automáticas de atuendos considerando el clima actual y estilo.
* **Integración Meteorológica**: Panel con visualización del estado del tiempo local en la pantalla de inicio para contextualizar los atuendos del día.
* **Galería y Detalle**: Visualización, edición y eliminación de prendas y conjuntos.


## Proceso de Desarrollo

1. **Diseño de la Arquitectura**: Separación limpia entre un backend modular (rutas, esquemas, modelos ORM y capas de servicio/IA) y una aplicación móvil por componentes y capas funcionales (*features slice*).
2. **Implementación de Servicios e IA**: Integración de utilidades para análisis de colorimetría, compatibilidad de prendas y llamadas estructuradas a servicios de IA (`ia_utils`, `prenda_ia_crud`, `outfit_ia_crud`).
3. **Construcción del Frontend**: Configuración de Expo Router para navegación por pestañas y rutas dinámicas (`[prenda_id]`, `[outfit_id]`), centralizando llamadas HTTP y estado con Redux.
4. **Pruebas y Verificación**: Cobertura de endpoints críticos mediante tests automatizados en backend (`test_prendas.py`, `test_outfits.py`, `test_usuarios.py`, `test_colores.py`).


## Cómo Ejecutar el Proyecto

### Prerrequisitos

* Node.js (versión 18 o superior)
* Python 3.10 o superior
* Gestor de paquetes `pnpm`
* Expo Go instalado en tu dispositivo físico o un emulador (Android Studio / Xcode)

---

### 1. Configuración del Backend

1. Entra en el directorio del backend:
```bash
cd backend
```
2. Crea y activa un entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate
```
3. Instala las dependencias:
```bash
pip install -r requirements.txt
```
4. Configura las variables de entorno creando un archivo `.env` en la raíz de `backend/` con las siguientes credenciales:
```env
DATABASE_URL=mysql+pymysql://<usuario>:<contraseña>@localhost:3306/<nombreBD>
GEMINI_API_KEY=<tu_api_key_de_gemini>
OPENWEATHER_API_KEY=<tu_api_key_de_openweather>
```
5. Inicia el servidor de desarrollo:
```bash
uvicorn app.main:app -host 0.0.0.0 -port 8000
```
*Documentación Swagger disponible en: `http://localhost:8000/docs`*

---

### 2. Configuración del Frontend

1. Entra en el directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno en un archivo `.env` o dentro de `app.json`:
```env
EXPO_PUBLIC_BACKEND_URL=http://<IP_LOCAL_BACKEND>:8000
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<tu_upload_preset>
EXPO_PUBLIC_CLOUDINARY_UPLOAD_FOLDER=<tu_upload_folder>

EXPO_PUBLIC_FIREBASE_API_KEY=<tu_firebase_api_key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<tu_firebase_auth_domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<tu_firebase_project_id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<tu_firebase_storage_bucket>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<tu_firebase_messaging_sender_id>
EXPO_PUBLIC_FIREBASE_APP_ID=<tu_firebase_app_id>
```

4. Inicia la aplicación:
```bash
pnpm exec expo start
```

5. Escanea el código QR que aparece en consola con **Expo Go** (Android) o la app de Cámara (iOS).


## Demo en Video


https://github.com/user-attachments/assets/69c25155-4a40-4706-a5b0-23ff1b69bed4



https://github.com/user-attachments/assets/e30382f0-5636-4580-9bdf-a35830ccc53d

