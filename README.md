# 👕 Armario Virtual

> **Tu armario en el móvil: digitaliza tu ropa con una foto y deja que la IA te proponga qué ponerte según el tiempo y la ocasión.**

**Armario Virtual** es una aplicación móvil con su propia API para gestionar el guardarropa personal. Permite registrar prendas a mano o a partir de una foto analizada con IA, consultar el clima de tu ubicación y crear outfits manualmente o generados por **Gemini** a partir de una descripción en lenguaje natural.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 📑 Índice

- [Demo en vídeo](#-demo-en-vídeo)
- [Funcionalidades](#-funcionalidades)
- [Cómo funciona la IA](#-cómo-funciona-la-ia)
- [Arquitectura](#️-arquitectura)
- [Tecnologías](#️-tecnologías)
- [API](#-api)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)

---

## 🎥 Demo en vídeo


https://github.com/user-attachments/assets/69c25155-4a40-4706-a5b0-23ff1b69bed4



https://github.com/user-attachments/assets/e30382f0-5636-4580-9bdf-a35830ccc53d


---

## ✨ Funcionalidades

- **🔐 Autenticación:** registro, inicio de sesión y sesión persistente con Firebase Authentication.
- **👚 Prendas:**
  - **Alta manual:** nombre, tipo, colores, nivel de abrigo y nivel de elegancia.
  - **Alta con IA:** haces una foto o eliges una de la galería, se sube a Cloudinary y Gemini la analiza para rellenar todos los campos automáticamente.
- **🧥 Outfits:**
  - **Creación manual** combinando prendas de tu armario.
  - **Generación con IA:** describes la ocasión (*"cena con amigos"*, *"entrevista de trabajo"*...) y la IA elige prendas de tu catálogo teniendo en cuenta el clima actual.
- **🌦️ Clima en tiempo real:** la pantalla de inicio muestra el tiempo de tu ubicación (OpenWeatherMap + `expo-location`).
- **🗂️ Galería y detalle:** consulta, edición y borrado de prendas y outfits.
- **👤 Cuenta:** edición del nombre y cierre de sesión.

---

## 🤖 Cómo funciona la IA

Toda la IA se apoya en **Gemini** (`gemini-2.5-flash-lite` por defecto) con **salida estructurada**: el modelo responde con un JSON que se valida contra un esquema de Pydantic antes de guardar nada en la base de datos.

Las prendas se clasifican con dos escalas del 1 al 5:

| Nivel | Abrigo | Elegancia |
|---|---|---|
| 1 | Muy ligero (> 30 °C) | Deportivo / Casa |
| 2 | Ligero (20–25 °C) | Informal / Casual |
| 3 | Intermedio (15–20 °C) | Casual elegante |
| 4 | Abrigado (5–15 °C) | Semi-formal |
| 5 | Muy abrigado (< 5 °C) | Formal / Gala |

- **Prenda desde imagen** (`POST /api/prendas/desde-imagen-ia`): Gemini recibe la foto y la lista de colores de la base de datos, y devuelve el nombre, el tipo, los colores, el nivel de abrigo y el de elegancia.
- **Outfit desde texto** (`POST /api/outfits/generar-desde-ia`): Gemini recibe tu descripción, tu catálogo de prendas y, si envías coordenadas, la temperatura y la sensación térmica. Si la descripción y el clima entran en conflicto, manda la descripción. Después se valida que las prendas elegidas existan y sean tuyas.

---

## 🏗️ Arquitectura

```text
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────┐
│   App móvil (Expo)   │  HTTP  │   API FastAPI        │  ORM   │  MySQL   │
│ React Native + Redux │ ─────▶ │ routers → crud →     │ ─────▶ │          │
└──────────┬───────────┘        │ models / schemas     │        └──────────┘
           │                    └──────┬────────┬──────┘
           │ fotos                     │        │
           ▼                           ▼        ▼
     ┌────────────┐             ┌──────────┐ ┌────────────────┐
     │ Cloudinary │             │  Gemini  │ │ OpenWeatherMap │
     └────────────┘             └──────────┘ └────────────────┘
  Firebase Auth gestiona el inicio de sesión desde la app.
```

---

## 🛠️ Tecnologías

| Área | Tecnología |
|---|---|
| **App móvil** | React Native 0.81, Expo SDK 54, Expo Router, Redux Toolkit, `expo-image-picker`, `expo-location` |
| **Autenticación** | Firebase Authentication |
| **Imágenes** | Cloudinary |
| **Backend** | Python, FastAPI, SQLAlchemy 2, Pydantic 2, `pydantic-settings` |
| **Base de datos** | MySQL (PyMySQL) |
| **IA** | Google Gemini (`google-genai`) con salida estructurada en JSON |
| **Clima** | OpenWeatherMap API |
| **Tests** | Pytest |
| **Gestor de paquetes** | pnpm (frontend), pip (backend) |

---

## 🔌 API

Documentación interactiva (Swagger) en `http://localhost:8000/docs`.

| Recurso | Endpoints |
|---|---|
| **Usuarios** `/api/usuarios` | `GET /`, `GET /{id}`, `GET /{id}/prendas`, `GET /{id}/outfits`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| **Prendas** `/api/prendas` | `GET /`, `GET /{id}`, `POST /`, `POST /desde-imagen-ia`, `PUT /{id}`, `DELETE /{id}` |
| **Outfits** `/api/outfits` | `GET /`, `GET /{id}`, `POST /`, `POST /generar-desde-ia`, `PUT /{id}`, `DELETE /{id}` |
| **Colores** `/api/colores` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| **Clima** `/api/clima` | `GET /actual?lat=...&lon=...` |

---

## 📁 Estructura del proyecto

```text
ArmarioVirtual/
├── backend/
│   ├── app/
│   │   ├── core/config.py        # Variables de entorno
│   │   ├── database/database.py  # Motor y sesión de SQLAlchemy
│   │   ├── models/               # Usuario, Prenda, Outfit, Color y tablas intermedias
│   │   ├── schemas/              # Esquemas Pydantic de entrada y salida
│   │   ├── crud/                 # Lógica de negocio + IA (ia_utils, prenda_ia_crud, outfit_ia_crud)
│   │   ├── routers/              # Endpoints REST
│   │   └── main.py
│   ├── tests/                    # Tests de usuarios, prendas, outfits y colores
│   └── requirements.txt
└── frontend/
    ├── app/                      # Rutas de Expo Router
    │   ├── (tabs)/               # home, items, outfits, account
    │   ├── prendas/              # detalle, edición, alta manual y con IA
    │   └── outfits/              # detalle, edición, alta manual y con IA
    └── src/
        ├── features/             # auth, home, prendas, outfits, usuarios (api, screens, state)
        ├── shared/               # cliente HTTP, Firebase, Cloudinary, tema, componentes
        └── store/                # Store de Redux
```

---

## 🚀 Cómo ejecutar el proyecto

### Requisitos

- Node.js 18 o superior y `pnpm`
- Python 3.10 o superior
- Un servidor MySQL
- Expo Go en tu móvil, o un emulador (Android Studio / Xcode)
- Claves de Gemini, OpenWeatherMap, Firebase y Cloudinary

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Crea un archivo `.env` en `backend/`:

```env
DATABASE_URL=mysql+pymysql://<usuario>:<contraseña>@localhost:3306/<nombreBD>
GEMINI_API_KEY=<tu_api_key_de_gemini>
GEMINI_MODEL=gemini-2.5-flash-lite
OPENWEATHER_API_KEY=<tu_api_key_de_openweather>
```

Arranca el servidor (las tablas se crean automáticamente al iniciar):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Para lanzar los tests (usan SQLite en memoria, no necesitan MySQL):

```bash
pytest
```

### 2. Frontend

```bash
cd frontend
pnpm install
```

Configura las variables en un archivo `.env` (o en `app.json`):

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

Inicia la app y escanea el código QR con **Expo Go** (Android) o con la cámara (iOS):

```bash
pnpm start
```

> 💡 Usa la IP local de tu ordenador en `EXPO_PUBLIC_BACKEND_URL` (no `localhost`) para que el móvil pueda llegar al backend.

---

<p align="center">Hecho por <a href="https://github.com/franra18">Francisco Ramírez Cañadas</a></p>
