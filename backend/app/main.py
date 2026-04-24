import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text

# Importamos la configuración y la conexión
from app.database.database import engine, Base
import app.models.color_model
import app.models.outfit_prenda_model
import app.models.outfit_model
import app.models.prenda_color_model
import app.models.prenda_model
import app.models.usuario_model
from app.routers import clima_router, colores_router, outfits_router, prendas_router, usuarios_router

# 1. Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api-backend")


# Asegurar que la columna fecha_creacion exista en prendas para bases ya creadas.
def ensure_prendas_fecha_creacion_column() -> None:
    check_column_sql = text(
        """
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'prendas'
          AND COLUMN_NAME = 'fecha_creacion'
        """
    )

    add_column_sql = text(
        """
        ALTER TABLE prendas
        ADD COLUMN fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        """
    )

    with engine.begin() as connection:
        total = connection.execute(check_column_sql).scalar() or 0
        if int(total) == 0:
            connection.execute(add_column_sql)
            logger.info("Columna fecha_creacion agregada en la tabla prendas.")

# 2. Definir el ciclo de vida (Lifespan)
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicación y conectando a MySQL...")
    try:
        # Esto crea las tablas en MySQL Workbench si no existen
        Base.metadata.create_all(bind=engine)
        ensure_prendas_fecha_creacion_column()
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
app.include_router(prendas_router.router, prefix="/api/prendas", tags=["Prendas"])
app.include_router(outfits_router.router, prefix="/api/outfits", tags=["Outfits"])
app.include_router(colores_router.router, prefix="/api/colores", tags=["Colores"])
app.include_router(clima_router.router, prefix="/api/clima", tags=["Clima"])

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "service": "backend_mvc", 
        "database": "mysql",
        "version": "1.0.0"
    }