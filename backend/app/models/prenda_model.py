from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, text
from sqlalchemy.orm import relationship

from app.database.database import Base


class Prenda(Base):
	__tablename__ = "prendas"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	usuario_id = Column(Integer, nullable=False)
	nombre = Column(String(100), nullable=False)
	tipo_prenda = Column(String(50), nullable=False)
	nivel_abrigo = Column(Integer, nullable=True)
	nivel_elegancia = Column(Integer, nullable=True)
	foto_url = Column(Text, nullable=True)
	fecha_creacion = Column(TIMESTAMP, nullable=True, server_default=text("CURRENT_TIMESTAMP"))
	colores = relationship("Color", secondary="prenda_colores", viewonly=True)

	# Obtener los nombres de colores asociados a la prenda.
	@property
	def color_nombres(self) -> list[str]:
		colores_unicos: list[str] = []
		for color in self.colores or []:
			nombre = (color.nombre or "").strip()
			if nombre and nombre not in colores_unicos:
				colores_unicos.append(nombre)
		return colores_unicos
