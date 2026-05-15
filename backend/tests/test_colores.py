import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import get_db, Base
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


def test_crear_color():
    response = client.post(
        "/api/colores/",
        json={"nombre": "Verde"}
    )
    # Suponiendo que tu endpoint devuelve 201 Created al crear
    assert response.status_code in [200, 201] 
    data = response.json()
    assert data["nombre"] == "Verde"
    assert "id" in data

def test_crear_color_invalido_falla():
    # Enviar un payload vacío o sin nombre debería fallar (422 Pydantic)
    response = client.post(
        "/api/colores/",
        json={} 
    )
    assert response.status_code == 422

def test_obtener_colores():
    # Creamos un par de colores primero usando la BD directamente para variar
    db = TestingSessionLocal()
    db.add_all([Color(nombre="Amarillo"), Color(nombre="Rosa")])
    db.commit()
    db.close()

    response = client.get("/api/colores/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    nombres = [c["nombre"] for c in data]
    assert "Amarillo" in nombres
    assert "Rosa" in nombres

def test_obtener_color_por_id():
    # Crear color mediante la API
    post_resp = client.post("/api/colores/", json={"nombre": "Morado"})
    color_id = post_resp.json()["id"]

    # Obtenerlo
    response = client.get(f"/api/colores/{color_id}")
    assert response.status_code == 200
    assert response.json()["id"] == color_id
    assert response.json()["nombre"] == "Morado"

def test_obtener_color_inexistente_falla():
    response = client.get("/api/colores/9999")
    assert response.status_code == 404

def test_actualizar_color():
    # Crear
    post_resp = client.post("/api/colores/", json={"nombre": "Naranja"})
    color_id = post_resp.json()["id"]

    # Actualizar
    response = client.put(
        f"/api/colores/{color_id}",
        json={"nombre": "Naranja Oscuro"}
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "Naranja Oscuro"

def test_eliminar_color():
    # Crear
    post_resp = client.post("/api/colores/", json={"nombre": "Gris"})
    color_id = post_resp.json()["id"]

    # Eliminar
    delete_resp = client.delete(f"/api/colores/{color_id}")
    assert delete_resp.status_code == 200

    # Comprobar que ya no existe
    get_resp = client.get(f"/api/colores/{color_id}")
    assert get_resp.status_code == 404