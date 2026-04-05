from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint

from app.database.database import Base


class PrendaColor(Base):
	__tablename__ = "prenda_colores"
	__table_args__ = (UniqueConstraint("prenda_id", "color_id", name="uq_prenda_colores_prenda_id_color_id"),)

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	prenda_id = Column(Integer, ForeignKey("prendas.id", ondelete="CASCADE"), nullable=False, index=True)
	color_id = Column(Integer, ForeignKey("colores.id", ondelete="RESTRICT"), nullable=False, index=True)
