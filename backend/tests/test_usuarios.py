import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import get_db, Base
from app.models.usuario_model import Usuario
from app.models.prenda_model import Prenda
from app.models.outfit_model import Outfit
from app.models.color_model import Color

# Configuración de base de datos SQLite en memoria para pruebas
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sobrescribimos la dependencia de base de datos de FastAPI
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = TestClient(app)

# Fixture para inicializar la BD antes de cada prueba
@pytest.fixture(autouse=True)
def setup_database():
    # Aplicamos el override AQUÍ ADENTRO para que solo afecte a este test
    app.dependency_overrides[get_db] = override_get_db

    # Crea las tablas
    Base.metadata.create_all(bind=engine)
    
    yield  # Aquí se ejecutan las pruebas
    
    # Limpia la base de datos después de la prueba
    Base.metadata.drop_all(bind=engine)

    # Limpiar los overrides para no afectar a otros tests
    app.dependency_overrides.clear()

def test_crear_usuario():
    response = client.post(
        "/api/usuarios/",
        json={
            "nombre": "Fran",
            "email": "fran@correo.com"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Fran"
    assert data["email"] == "fran@correo.com"
    assert "id" in data

def test_crear_usuario_invalido_falla():
    # Pydantic debe rechazar una petición si falta el nombre o el email
    response = client.post(
        "/api/usuarios/",
        json={"nombre": "Usuario Incompleto"} 
    )
    assert response.status_code == 422

def test_obtener_usuarios():
    # Crear un par de usuarios
    client.post("/api/usuarios/", json={"nombre": "User 1", "email": "u1@correo.com"})
    client.post("/api/usuarios/", json={"nombre": "User 2", "email": "u2@correo.com"})
    
    response = client.get("/api/usuarios/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_obtener_usuario_por_id():
    post_resp = client.post("/api/usuarios/", json={"nombre": "Ana", "email": "ana@correo.com"})
    usuario_id = post_resp.json()["id"]

    response = client.get(f"/api/usuarios/{usuario_id}")
    assert response.status_code == 200
    assert response.json()["nombre"] == "Ana"

def test_obtener_usuario_inexistente_falla():
    response = client.get("/api/usuarios/999")
    assert response.status_code == 404

def test_actualizar_usuario():
    post_resp = client.post("/api/usuarios/", json={"nombre": "Carlos Viejo", "email": "carlos@correo.com"})
    usuario_id = post_resp.json()["id"]

    response = client.put(
        f"/api/usuarios/{usuario_id}",
        json={"nombre": "Carlos Nuevo"} # Actualizamos solo el nombre
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "Carlos Nuevo"
    assert response.json()["email"] == "carlos@correo.com" # El email debería mantenerse

def test_eliminar_usuario():
    post_resp = client.post("/api/usuarios/", json={"nombre": "Borrable", "email": "borrar@correo.com"})
    usuario_id = post_resp.json()["id"]

    delete_resp = client.delete(f"/api/usuarios/{usuario_id}")
    assert delete_resp.status_code == 200

    get_resp = client.get(f"/api/usuarios/{usuario_id}")
    assert get_resp.status_code == 404


# --- Tests para los endpoints combinados (Relaciones) ---

def test_obtener_prendas_de_usuario():
    # 1. Crear usuario
    usuario_id = client.post("/api/usuarios/", json={"nombre": "Laura", "email": "laura@correo.com"}).json()["id"]
    
    # 2. Crear color necesario para las prendas
    color_id = client.post("/api/colores/", json={"nombre": "Azul"}).json()["id"]
    
    # 3. Crear una prenda para ese usuario
    client.post("/api/prendas/", json={
        "usuario_id": usuario_id, "nombre": "Falda Azul", "tipo_prenda": "Pantalon", 
        "color_ids": [color_id]
    })
    
    # 4. Verificar que se obtiene la prenda desde el endpoint del usuario
    response = client.get(f"/api/usuarios/{usuario_id}/prendas")
    assert response.status_code == 200
    prendas = response.json()
    assert len(prendas) == 1
    assert prendas[0]["nombre"] == "Falda Azul"

def test_obtener_outfits_de_usuario():
    # 1. Crear usuario
    usuario_id = client.post("/api/usuarios/", json={"nombre": "David", "email": "david@correo.com"}).json()["id"]
    
    # 2. Crear color y prenda necesarios para el outfit
    color_id = client.post("/api/colores/", json={"nombre": "Negro"}).json()["id"]
    prenda_id = client.post("/api/prendas/", json={
        "usuario_id": usuario_id, "nombre": "Gorra Negra", "tipo_prenda": "Accesorio", 
        "color_ids": [color_id]
    }).json()["id"]
    
    # 3. Crear outfit
    client.post("/api/outfits/", json={
        "usuario_id": usuario_id, "nombre_outfit": "Look Skate", "prenda_ids": [prenda_id]
    })
    
    # 4. Verificar que se obtiene el outfit
    response = client.get(f"/api/usuarios/{usuario_id}/outfits")
    assert response.status_code == 200
    outfits = response.json()
    assert len(outfits) == 1
    assert outfits[0]["nombre_outfit"] == "Look Skate"