from sqlalchemy import Column, Integer, String, TIMESTAMP, text

from app.database.database import Base


class Usuario(Base):
	__tablename__ = "usuarios"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	nombre = Column(String(100), nullable=False)
	email = Column(String(150), nullable=False)
	fecha_registro = Column(TIMESTAMP, nullable=True, server_default=text("CURRENT_TIMESTAMP"))
