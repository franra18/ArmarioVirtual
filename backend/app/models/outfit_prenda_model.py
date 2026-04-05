from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint

from app.database.database import Base


class OutfitPrenda(Base):
	__tablename__ = "outfit_prendas"
	__table_args__ = (UniqueConstraint("outfit_id", "prenda_id", name="uq_outfit_prendas_outfit_id_prenda_id"),)

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)
	prenda_id = Column(Integer, ForeignKey("prendas.id", ondelete="CASCADE"), nullable=False, index=True)
