import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

# Importamos la configuración y la conexión
from app.database.database import engine, Base
from app.routers import usuarios_router  

# 1. Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api-backend")

# 2. Definir el ciclo de vida (Lifespan)
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicación y conectando a MySQL...")
    try:
        # Esto crea las tablas en MySQL Workbench si no existen
        Base.metadata.create_all(bind=engine)
        logger.info("Tablas sincronizadas y conexión exitosa.")
    except Exception as e:
        logger.error(f"Error al conectar con la base de datos: {e}")
        raise
    
    yield
    
    logger.info("Cerrando aplicación...")

# 3. Inicializar FastAPI
app = FastAPI(
    title="Armario Virtual",
    version="1.0.0",
    description="Backend para el proyecto Armario Virtual usando MySQL",
    lifespan=lifespan
)

# 4. Incluir los Routers (Controladores)
app.include_router(usuarios_router.router, prefix="/api/usuarios", tags=["Usuarios"])

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "service": "backend_mvc", 
        "database": "mysql",
        "version": "1.0.0"
    }