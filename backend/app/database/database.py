import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Configuramos el logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. El motor de MySQL (Equivalente al Client de Mongo)
engine = create_engine(settings.DATABASE_URL)

# 2. La fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Base para los modelos ORM
Base = declarative_base()

def init_mysql():
    try:
        logger.info("Conectando a MySQL...")
        # Esto busca todos los modelos que heredan de Base y crea las tablas
        Base.metadata.create_all(bind=engine)
        logger.info("Tablas de MySQL sincronizadas exitosamente.")
    except Exception as e:
        logger.error(f"Error conectando a MySQL: {e}")
        raise e

def get_db():
    """Utilidad para los controladores (routers)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()