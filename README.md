# 🧥 Armario Virtual

**Armario Virtual** es una aplicación móvil diseñada para digitalizar tu guardarropa, gestionar tus prendas, generar conjuntos (outfits) personalizados y recibir recomendaciones inteligentes basadas en el clima y en Inteligencia Artificial.

El proyecto está dividido en dos partes principales: un **Backend** robusto construido con Python y una **App Móvil** (Frontend) desarrollada con React Native.

---

## 🛠️ Tecnologías Principales

### Backend (`/backend`)
* **Framework:** FastAPI
* **Base de Datos:** MySQL (con SQLAlchemy como ORM) y SQLite (en memoria para tests).
* **Validación de Datos:** Pydantic
* **IA Generativa:** Integración con modelos de Google (Gemini) para análisis de imágenes de ropa y generación de outfits.
* **Clima:** API de OpenWeather.
* **Testing:** Pytest.

### Frontend (`/frontend`)
* **Framework:** React Native con Expo
* **Gestión de Estado:** Redux Toolkit
* **Autenticación:** Firebase Authentication
* **Navegación:** Expo Router
* **Testing:** Jest y React Native Testing Library.

---

## 📁 Estructura del Repositorio

```text
ArmarioVirtual/
├── backend/                # Lógica del servidor, API REST, conexión a BD e IA.
│   ├── app/                # Código fuente principal (routers, models, schemas, crud).
│   ├── tests/              # Pruebas unitarias de la API (Pytest).
│   └── main.py             # Punto de entrada de FastAPI.
├── frontend/               # Código de la aplicación móvil.
│   ├── app/                # Navegación y pantallas principales (Expo Router).
│   ├── src/                # Lógica de la app, componentes, estado (Redux), assets.
│   └── package.json        # Dependencias y scripts del frontend.
└── README.md               # Este archivo.

¡Claro que sí! Teniendo en cuenta la arquitectura y las tecnologías que conforman todo el código del proyecto (FastAPI en el backend y React Native/Expo en el frontend), he redactado un `README.md` completo, claro y estructurado.

Puedes copiar el siguiente bloque y guardarlo como `README.md` en la raíz principal de tu repositorio.

---

```markdown
# 🧥 Armario Virtual

**Armario Virtual** es una aplicación móvil diseñada para digitalizar tu guardarropa, gestionar tus prendas, generar conjuntos (outfits) personalizados y recibir recomendaciones inteligentes basadas en el clima y en Inteligencia Artificial.

El proyecto está dividido en dos partes principales: un **Backend** robusto construido con Python y una **App Móvil** (Frontend) desarrollada con React Native.

---

## 🛠️ Tecnologías Principales

### Backend (`/backend`)
* **Framework:** FastAPI
* **Base de Datos:** MySQL (con SQLAlchemy como ORM) y SQLite (en memoria para tests).
* **Validación de Datos:** Pydantic
* **IA Generativa:** Integración con modelos de Google (Gemini) para análisis de imágenes de ropa y generación de outfits.
* **Clima:** API de OpenWeather.
* **Testing:** Pytest.

### Frontend (`/frontend`)
* **Framework:** React Native con Expo
* **Gestión de Estado:** Redux Toolkit
* **Autenticación:** Firebase Authentication
* **Navegación:** Expo Router
* **Testing:** Jest y React Native Testing Library.

---

## 📁 Estructura del Repositorio

```text
ArmarioVirtual/
├── backend/                # Lógica del servidor, API REST, conexión a BD e IA.
│   ├── app/                # Código fuente principal (routers, models, schemas, crud).
│   ├── tests/              # Pruebas unitarias de la API (Pytest).
│   └── main.py             # Punto de entrada de FastAPI.
├── frontend/               # Código de la aplicación móvil.
│   ├── app/                # Navegación y pantallas principales (Expo Router).
│   ├── src/                # Lógica de la app, componentes, estado (Redux), assets.
│   └── package.json        # Dependencias y scripts del frontend.
└── README.md               # Este archivo.

```

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu entorno antes de comenzar:

* **Python 3.10+** (Para el backend).
* **Node.js 18+** (Para el frontend).
* **MySQL** (Para la base de datos de producción/desarrollo local).
* Variables de entorno y credenciales (ver sección de Configuración).
