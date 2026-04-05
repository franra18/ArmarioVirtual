from sqlalchemy import Column, Integer, String

from app.database.database import Base


class Color(Base):
	__tablename__ = "colores"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	nombre = Column(String(50), nullable=False)
