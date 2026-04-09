from sqlalchemy import Column, ForeignKey, Integer

from app.database.database import Base


class PrendaColor(Base):
	__tablename__ = "prenda_colores"
	prenda_id = Column(Integer, ForeignKey("prendas.id", ondelete="CASCADE"), primary_key=True, nullable=False)
	color_id = Column(Integer, ForeignKey("colores.id", ondelete="RESTRICT"), primary_key=True, nullable=False)
