# 👕 Armario Virtual

> **Your wardrobe in your pocket: digitise your clothes with a photo and let AI suggest what to wear based on the weather and the occasion.**

**Armario Virtual** ("Virtual Wardrobe") is a mobile app with its own API for managing your personal wardrobe. You can add clothing items by hand or from a photo analysed by AI, check the weather where you are, and build outfits manually or have **Gemini** generate them from a natural-language description.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

> ℹ️ The app UI, API routes and code are in Spanish (e.g. *prendas* = clothing items).

---

## 📑 Table of Contents

- [Video Demo](#-video-demo)
- [Features](#-features)
- [How the AI Works](#-how-the-ai-works)
- [Architecture](#️-architecture)
- [Tech Stack](#️-tech-stack)
- [API](#-api)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)

---

## 🎥 Video Demo


https://github.com/user-attachments/assets/69c25155-4a40-4706-a5b0-23ff1b69bed4



https://github.com/user-attachments/assets/e30382f0-5636-4580-9bdf-a35830ccc53d


---

## ✨ Features

- **🔐 Authentication:** sign-up, login and persistent sessions with Firebase Authentication.
- **👚 Clothing items:**
  - **Manual entry:** name, type, colours, warmth level and elegance level.
  - **AI entry:** take a photo or pick one from your gallery; it is uploaded to Cloudinary and Gemini analyses it to fill in every field automatically.
- **🧥 Outfits:**
  - **Manual creation** by combining items from your wardrobe.
  - **AI generation:** describe the occasion (*"dinner with friends"*, *"job interview"*...) and the AI picks items from your catalogue, taking the current weather into account.
- **🌦️ Live weather:** the home screen shows the weather at your location (OpenWeatherMap + `expo-location`).
- **🗂️ Gallery and details:** view, edit and delete items and outfits.
- **👤 Account:** edit your name and sign out.

---

## 🤖 How the AI Works

All AI features run on **Gemini** (`gemini-2.5-flash-lite` by default) with **structured output**: the model returns JSON that is validated against a Pydantic schema before anything is saved to the database.

Clothing items are rated on two 1–5 scales:

| Level | Warmth | Elegance |
|---|---|---|
| 1 | Very light (> 30 °C) | Sporty / Loungewear |
| 2 | Light (20–25 °C) | Casual |
| 3 | Medium (15–20 °C) | Smart casual |
| 4 | Warm (5–15 °C) | Semi-formal |
| 5 | Very warm (< 5 °C) | Formal / Black tie |

- **Item from image** (`POST /api/prendas/desde-imagen-ia`): Gemini receives the photo and the list of colours in the database, and returns the name, type, colours, warmth level and elegance level.
- **Outfit from text** (`POST /api/outfits/generar-desde-ia`): Gemini receives your description, your clothing catalogue and, if you send coordinates, the temperature and "feels like" temperature. If the description and the weather conflict, the description wins. The chosen items are then checked to make sure they exist and belong to you.

---

## 🏗️ Architecture

```text
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────┐
│   Mobile app (Expo)  │  HTTP  │   FastAPI API        │  ORM   │  MySQL   │
│ React Native + Redux │ ─────▶ │ routers → crud →     │ ─────▶ │          │
└──────────┬───────────┘        │ models / schemas     │        └──────────┘
           │                    └──────┬────────┬──────┘
           │ photos                    │        │
           ▼                           ▼        ▼
     ┌────────────┐             ┌──────────┐ ┌────────────────┐
     │ Cloudinary │             │  Gemini  │ │ OpenWeatherMap │
     └────────────┘             └──────────┘ └────────────────┘
  Firebase Auth handles sign-in from the app.
```

---

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| **Mobile app** | React Native 0.81, Expo SDK 54, Expo Router, Redux Toolkit, `expo-image-picker`, `expo-location` |
| **Authentication** | Firebase Authentication |
| **Images** | Cloudinary |
| **Backend** | Python, FastAPI, SQLAlchemy 2, Pydantic 2, `pydantic-settings` |
| **Database** | MySQL (PyMySQL) |
| **AI** | Google Gemini (`google-genai`) with structured JSON output |
| **Weather** | OpenWeatherMap API |
| **Tests** | Pytest |
| **Package managers** | pnpm (frontend), pip (backend) |

---

## 🔌 API

Interactive docs (Swagger) at `http://localhost:8000/docs`.

| Resource | Endpoints |
|---|---|
| **Users** `/api/usuarios` | `GET /`, `GET /{id}`, `GET /{id}/prendas`, `GET /{id}/outfits`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| **Items** `/api/prendas` | `GET /`, `GET /{id}`, `POST /`, `POST /desde-imagen-ia`, `PUT /{id}`, `DELETE /{id}` |
| **Outfits** `/api/outfits` | `GET /`, `GET /{id}`, `POST /`, `POST /generar-desde-ia`, `PUT /{id}`, `DELETE /{id}` |
| **Colours** `/api/colores` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| **Weather** `/api/clima` | `GET /actual?lat=...&lon=...` |

---

## 📁 Project Structure

```text
ArmarioVirtual/
├── backend/
│   ├── app/
│   │   ├── core/config.py        # Environment variables
│   │   ├── database/database.py  # SQLAlchemy engine and session
│   │   ├── models/               # User, Item, Outfit, Colour and join tables
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── crud/                 # Business logic + AI (ia_utils, prenda_ia_crud, outfit_ia_crud)
│   │   ├── routers/              # REST endpoints
│   │   └── main.py
│   ├── tests/                    # User, item, outfit and colour tests
│   └── requirements.txt
└── frontend/
    ├── app/                      # Expo Router routes
    │   ├── (tabs)/               # home, items, outfits, account
    │   ├── prendas/              # item detail, edit, manual and AI creation
    │   └── outfits/              # outfit detail, edit, manual and AI creation
    └── src/
        ├── features/             # auth, home, prendas, outfits, usuarios (api, screens, state)
        ├── shared/               # HTTP client, Firebase, Cloudinary, theme, components
        └── store/                # Redux store
```

---

## 🚀 Getting Started

### Requirements

- Node.js 18+ and `pnpm`
- Python 3.10+
- A MySQL server
- Expo Go on your phone, or an emulator (Android Studio / Xcode)
- API keys for Gemini, OpenWeatherMap, Firebase and Cloudinary

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

Create a `.env` file in `backend/`:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/<database>
GEMINI_API_KEY=<your_gemini_api_key>
GEMINI_MODEL=gemini-2.5-flash-lite
OPENWEATHER_API_KEY=<your_openweather_api_key>
```

Start the server (tables are created automatically on startup):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Run the tests (they use an in-memory SQLite database, no MySQL needed):

```bash
pytest
```

### 2. Frontend

```bash
cd frontend
pnpm install
```

Set the variables in a `.env` file (or in `app.json`):

```env
EXPO_PUBLIC_BACKEND_URL=http://<BACKEND_LOCAL_IP>:8000
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your_upload_preset>
EXPO_PUBLIC_CLOUDINARY_UPLOAD_FOLDER=<your_upload_folder>

EXPO_PUBLIC_FIREBASE_API_KEY=<your_firebase_api_key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_firebase_auth_domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<your_firebase_project_id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_firebase_storage_bucket>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_firebase_messaging_sender_id>
EXPO_PUBLIC_FIREBASE_APP_ID=<your_firebase_app_id>
```

Start the app and scan the QR code with **Expo Go** (Android) or the Camera app (iOS):

```bash
pnpm start
```

> 💡 Use your computer's local IP in `EXPO_PUBLIC_BACKEND_URL` (not `localhost`) so your phone can reach the backend.

---

<p align="center">Made by <a href="https://github.com/franra18">Francisco Ramírez Cañadas</a></p>
