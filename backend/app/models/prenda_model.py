from sqlalchemy import Column, Integer, String, Text

from app.database.database import Base


class Prenda(Base):
	__tablename__ = "prendas"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	usuario_id = Column(Integer, nullable=False)
	nombre = Column(String(100), nullable=False)
	categoria = Column(String(50), nullable=False)
	nivel_abrigo = Column(Integer, nullable=True)
	nivel_elegancia = Column(Integer, nullable=True)
	foto_url = Column(Text, nullable=True)
