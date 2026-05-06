from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# 1. El motor de MySQL (Equivalente al Client de Mongo)
engine = create_engine(settings.DATABASE_URL)

# 2. La fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Base para los modelos ORM
Base = declarative_base()

# Obtener una sesion de base de datos para los endpoints.
def get_db():
    """Utilidad para los controladores (routers)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()