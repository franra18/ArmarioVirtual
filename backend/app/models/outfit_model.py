from sqlalchemy import Boolean, Column, Integer, String, TIMESTAMP, text

from app.database.database import Base


class Outfit(Base):
	__tablename__ = "outfits"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	usuario_id = Column(Integer, nullable=False)
	nombre_outfit = Column(String(100), nullable=True)
	ocasion = Column(String(50), nullable=True)
	creado_por_ia = Column(Boolean, nullable=True, server_default=text("0"))
	fecha_creacion = Column(TIMESTAMP, nullable=True, server_default=text("CURRENT_TIMESTAMP"))
