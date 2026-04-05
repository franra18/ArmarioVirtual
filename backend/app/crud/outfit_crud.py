from sqlalchemy.orm import Session

from app.models.outfit_prenda_model import OutfitPrenda
from app.models.outfit_model import Outfit
from app.models.prenda_model import Prenda
from app.schemas.outfit_schema import OutfitCreate, OutfitUpdate


class OutfitCRUD:
	# Normalizar y depurar la lista de IDs de prendas recibida.
	@staticmethod
	def _normalizar_prenda_ids(prenda_ids: list[int]) -> list[int]:
		prenda_ids_limpios = [prenda_id for prenda_id in prenda_ids if prenda_id is not None]
		return list(dict.fromkeys(prenda_ids_limpios))

	# Validar que todos los IDs de prendas existan antes de asociarlos.
	@staticmethod
	def _validar_prendas_existentes(db: Session, prenda_ids: list[int]) -> None:
		cantidad_existentes = db.query(Prenda).filter(Prenda.id.in_(prenda_ids)).count()
		if cantidad_existentes != len(prenda_ids):
			raise ValueError("Una o mas prendas no existen")

	# Verificar que un outfit tenga al menos una prenda asociada.
	@staticmethod
	def _validar_prendas_obligatorias(db: Session, outfit_id: int) -> None:
		tiene_prendas = db.query(OutfitPrenda).filter(OutfitPrenda.outfit_id == outfit_id).first()
		if not tiene_prendas:
			raise ValueError("El outfit debe tener al menos una prenda")

	# Obtener todos los outfits registrados.
	@staticmethod
	def get_all(db: Session) -> list[Outfit]:
		return db.query(Outfit).all()

	# Obtener un outfit por su identificador.
	@staticmethod
	def get_by_id(db: Session, outfit_id: int) -> Outfit | None:
		return db.query(Outfit).filter(Outfit.id == outfit_id).first()

	# Crear un nuevo outfit con los datos recibidos.
	@staticmethod
	def create(db: Session, data: OutfitCreate) -> Outfit:
		prenda_ids = OutfitCRUD._normalizar_prenda_ids(data.prenda_ids)
		if not prenda_ids:
			raise ValueError("El outfit debe tener al menos una prenda")

		OutfitCRUD._validar_prendas_existentes(db, prenda_ids)

		nuevo_outfit = Outfit(**data.model_dump(exclude={"prenda_ids"}))
		db.add(nuevo_outfit)
		db.flush()

		for prenda_id in prenda_ids:
			db.add(OutfitPrenda(outfit_id=nuevo_outfit.id, prenda_id=prenda_id))

		try:
			db.commit()
		except Exception:
			db.rollback()
			raise

		db.refresh(nuevo_outfit)
		return nuevo_outfit

	# Actualizar los campos enviados de un outfit existente.
	@staticmethod
	def update(db: Session, outfit_id: int, data: OutfitUpdate) -> Outfit | None:
		outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
		if not outfit:
			return None

		update_data = data.model_dump(exclude_unset=True, exclude={"prenda_ids"})
		for key, value in update_data.items():
			setattr(outfit, key, value)

		if data.prenda_ids is not None:
			prenda_ids = OutfitCRUD._normalizar_prenda_ids(data.prenda_ids)
			if not prenda_ids:
				raise ValueError("El outfit debe tener al menos una prenda")

			OutfitCRUD._validar_prendas_existentes(db, prenda_ids)
			db.query(OutfitPrenda).filter(OutfitPrenda.outfit_id == outfit_id).delete(synchronize_session=False)
			for prenda_id in prenda_ids:
				db.add(OutfitPrenda(outfit_id=outfit_id, prenda_id=prenda_id))
		else:
			OutfitCRUD._validar_prendas_obligatorias(db, outfit_id)

		try:
			db.commit()
		except Exception:
			db.rollback()
			raise
		db.refresh(outfit)
		return outfit

	# Eliminar un outfit por su identificador.
	@staticmethod
	def delete(db: Session, outfit_id: int) -> bool:
		outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
		if not outfit:
			return False

		db.delete(outfit)
		db.commit()
		return True
