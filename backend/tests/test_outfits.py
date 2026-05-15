import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import get_db, Base
from app.models.usuario_model import Usuario
from app.models.color_model import Color
from app.models.prenda_model import Prenda

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

# Fixture para inicializar la BD y poblarla con datos básicos antes de cada prueba
@pytest.fixture(autouse=True)
def setup_database():
    # Aplicamos el override AQUÍ ADENTRO para que solo afecte a este test
    app.dependency_overrides[get_db] = override_get_db
    
    # Crea las tablas
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    # 1. Crear un usuario de prueba
    usuario_test = Usuario(id=1, nombre="Usuario Prueba", email="prueba@correo.es")
    db.add(usuario_test)
    
    # 2. Crear colores básicos
    color_negro = Color(id=1, nombre="Negro")
    color_blanco = Color(id=2, nombre="Blanco")
    db.add_all([color_negro, color_blanco])
    
    db.commit()

    # 3. Crear prendas de prueba (necesarias para poder crear outfits)
    prenda_1 = Prenda(id=1, usuario_id=1, nombre="Camiseta Negra", tipo_prenda="Camiseta", nivel_abrigo=1, nivel_elegancia=2)
    prenda_2 = Prenda(id=2, usuario_id=1, nombre="Pantalón Blanco", tipo_prenda="Pantalon", nivel_abrigo=2, nivel_elegancia=3)
    db.add_all([prenda_1, prenda_2])
    
    db.commit()
    db.close()
    
    yield  # Aquí se ejecutan las pruebas
    
    # Limpia la base de datos después de la prueba
    Base.metadata.drop_all(bind=engine)
    
    # Limpiar los overrides para no afectar a otros tests
    app.dependency_overrides.clear()


def test_crear_outfit():
    response = client.post(
        "/api/outfits/",
        json={
            "usuario_id": 1,
            "nombre_outfit": "Conjunto de Verano",
            "ocasion": "Paseo",
            "creado_por_ia": False,
            "prenda_ids": [1, 2] # Usamos las prendas creadas en el fixture
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre_outfit"] == "Conjunto de Verano"
    assert data["ocasion"] == "Paseo"
    assert data["usuario_id"] == 1
    assert len(data["prenda_ids"]) == 2
    assert 1 in data["prenda_ids"]

def test_crear_outfit_sin_prendas_falla():
    response = client.post(
        "/api/outfits/",
        json={
            "usuario_id": 1,
            "nombre_outfit": "Conjunto Vacío",
            "prenda_ids": [] 
        }
    )
    # Pydantic (Field min_length=1) lanza un 422 si la lista está vacía
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "prenda_ids"

def test_crear_outfit_con_prenda_inexistente_falla():
    response = client.post(
        "/api/outfits/",
        json={
            "usuario_id": 1,
            "nombre_outfit": "Conjunto Fantasma",
            "prenda_ids": [999] # Este ID no existe
        }
    )
    # Nuestra validación en OutfitCRUD lanza un ValueError capturado como 400
    assert response.status_code == 400
    assert "Una o mas prendas no existen" in response.json()["detail"]

def test_obtener_outfits():
    # Creamos un outfit primero
    client.post("/api/outfits/", json={ 
        "usuario_id": 1, "nombre_outfit": "Outfit 1", "prenda_ids": [1]
    })
    
    response = client.get("/api/outfits/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["nombre_outfit"] == "Outfit 1"

def test_obtener_outfit_por_id():
    # Crear outfit
    post_resp = client.post("/api/outfits/", json={ 
        "usuario_id": 1, "nombre_outfit": "Outfit Elegante", "prenda_ids": [2]
    })
    outfit_id = post_resp.json()["id"]

    # Obtenerlo
    response = client.get(f"/api/outfits/{outfit_id}") 
    assert response.status_code == 200
    assert response.json()["id"] == outfit_id
    assert response.json()["nombre_outfit"] == "Outfit Elegante"

def test_actualizar_outfit():
    post_resp = client.post("/api/outfits/", json={ 
        "usuario_id": 1, "nombre_outfit": "Outfit Viejo", "prenda_ids": [1]
    })
    outfit_id = post_resp.json()["id"]

    # Actualizamos el nombre y le añadimos una prenda más
    response = client.put(
        f"/api/outfits/{outfit_id}", 
        json={
            "nombre_outfit": "Outfit Actualizado",
            "prenda_ids": [1, 2]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nombre_outfit"] == "Outfit Actualizado"
    assert len(data["prenda_ids"]) == 2

def test_eliminar_outfit():
    post_resp = client.post("/api/outfits/", json={ 
        "usuario_id": 1, "nombre_outfit": "Para Borrar", "prenda_ids": [1]
    })
    outfit_id = post_resp.json()["id"]

    # Eliminar
    delete_resp = client.delete(f"/api/outfits/{outfit_id}")
    assert delete_resp.status_code == 200

    # Comprobar que ya no existe
    get_resp = client.get(f"/api/outfits/{outfit_id}")
    assert get_resp.status_code == 404