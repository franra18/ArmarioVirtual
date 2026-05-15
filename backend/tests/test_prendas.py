import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import get_db, Base
from app.models.usuario_model import Usuario
from app.models.color_model import Color

# Configuración de base de datos SQLite en memoria para que los tests sean rápidos
# y no afecten a tu base de datos MySQL real.
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Interceptamos la inyección de dependencias de FastAPI.
# Siempre que un endpoint pida "get_db", le entregaremos nuestra BD en memoria.
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = TestClient(app)

# Fixture: Esto se ejecuta automáticamente antes y después de cada test (gracias a autouse=True).
@pytest.fixture(autouse=True)
def setup_database():
    # 1. Aplicamos el override AQUÍ ADENTRO para que solo afecte a este test
    app.dependency_overrides[get_db] = override_get_db
    
    # Crea las tablas
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    # 2. Crear un usuario de prueba (Requisito: las prendas necesitan pertenecer a un usuario)
    usuario_test = Usuario(id=1, nombre="Usuario Prueba", email="prueba@correo.es")
    db.add(usuario_test)
    
    # 3. Crear colores de prueba (Requisito: tu lógica de negocio exige que una prenda tenga al menos un color)
    color_rojo = Color(id=1, nombre="Rojo")
    color_azul = Color(id=2, nombre="Azul")
    db.add_all([color_rojo, color_azul])
    
    db.commit()
    db.close()
    
    yield  # Aquí se ejecutan las pruebas
    
    # Limpia la base de datos después de la prueba
    Base.metadata.drop_all(bind=engine)
    
    # Limpiar los overrides para no afectar a otros tests
    app.dependency_overrides.clear()


def test_crear_prenda():
    response = client.post(
        "/api/prendas/",
        json={
            "usuario_id": 1,
            "nombre": "Camiseta Básica",
            "tipo_prenda": "Camiseta",
            "nivel_abrigo": 1,
            "nivel_elegancia": 2,
            "foto_url": "http://ejemplo.com/foto.jpg",
            "color_ids": [1] # Usamos el color Rojo que creamos en el fixture
        }
    )
    # Validamos que se creó correctamente (HTTP 201 Created)
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Camiseta Básica"
    assert data["usuario_id"] == 1
    # Validamos que la respuesta incluye la propiedad mapeada correctamente
    assert "color_nombres" in data

def test_crear_prenda_sin_colores_falla():
    response = client.post(
        "/api/prendas/",
        json={
            "usuario_id": 1,
            "nombre": "Camiseta Sin Color",
            "tipo_prenda": "Camiseta",
            "nivel_abrigo": 1,
            "nivel_elegancia": 1,
            "foto_url": "http://ejemplo.com/foto2.jpg",
            "color_ids": [] # Enviamos la lista vacía a propósito
        }
    )
    # Pydantic intercepta esto automáticamente porque en tu esquema definiste: 
    # color_ids: list[int] = Field(min_length=1)
    # Por lo tanto, devuelve un HTTP 422 (Unprocessable Entity) antes de llegar a la lógica CRUD.
    assert response.status_code == 422
    # Verificamos que el error apunta específicamente al campo "color_ids"
    assert response.json()["detail"][0]["loc"][-1] == "color_ids"

def test_obtener_prendas():
    # Creamos una prenda de prueba primero para tener algo que leer
    client.post("/api/prendas/", json={ 
        "usuario_id": 1, "nombre": "Pantalón Vaquero", "tipo_prenda": "Pantalon",
        "nivel_abrigo": 2, "nivel_elegancia": 3, "foto_url": "url", "color_ids": [2]
    })
    
    response = client.get("/api/prendas/")
    
    # Validamos que responde OK y nos devuelve un array con nuestra prenda
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["nombre"] == "Pantalón Vaquero"

def test_obtener_prenda_por_id():
    # Crear la prenda
    post_resp = client.post("/api/prendas/", json={ 
        "usuario_id": 1, "nombre": "Chaqueta Cuero", "tipo_prenda": "Chaqueta",
        "nivel_abrigo": 4, "nivel_elegancia": 4, "foto_url": "url", "color_ids": [1, 2]
    })
    prenda_id = post_resp.json()["id"]

    # Obtenerla usando el ID generado
    response = client.get(f"/api/prendas/{prenda_id}") 
    assert response.status_code == 200
    assert response.json()["id"] == prenda_id
    assert response.json()["nombre"] == "Chaqueta Cuero"

def test_actualizar_prenda():
    # Crear la prenda original
    post_resp = client.post("/api/prendas/", json={ 
        "usuario_id": 1, "nombre": "Zapatillas Viejas", "tipo_prenda": "Calzado",
        "nivel_abrigo": 1, "nivel_elegancia": 1, "foto_url": "url", "color_ids": [1]
    })
    prenda_id = post_resp.json()["id"]

    # Ejecutar la actualización (PUT) enviando solo los campos que cambian
    response = client.put(
        f"/api/prendas/{prenda_id}", 
        json={
            "nombre": "Zapatillas Nuevas",
            "nivel_elegancia": 2
        }
    )
    # Validar que los campos nuevos cambiaron y que los antiguos se mantienen igual
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Zapatillas Nuevas"
    assert data["nivel_elegancia"] == 2
    assert data["tipo_prenda"] == "Calzado"

def test_eliminar_prenda():
    # Crear la prenda a eliminar
    post_resp = client.post("/api/prendas/", json={ 
        "usuario_id": 1, "nombre": "Bufanda", "tipo_prenda": "Accesorio",
        "nivel_abrigo": 5, "nivel_elegancia": 2, "foto_url": "url", "color_ids": [2]
    })
    prenda_id = post_resp.json()["id"]

    # 1. Llamar al endpoint de borrado
    delete_resp = client.delete(f"/api/prendas/{prenda_id}")
    assert delete_resp.status_code == 200

    # 2. Comprobar que efectivamente ya no existe (debe devolver un HTTP 404)
    get_resp = client.get(f"/api/prendas/{prenda_id}")
    assert get_resp.status_code == 404