from sqlalchemy import Column, ForeignKey, Integer

from app.database.database import Base


class OutfitPrenda(Base):
	__tablename__ = "outfit_prendas"
	outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), primary_key=True, nullable=False)
	prenda_id = Column(Integer, ForeignKey("prendas.id", ondelete="CASCADE"), primary_key=True, nullable=False)
