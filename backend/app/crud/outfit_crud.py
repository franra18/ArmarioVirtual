from sqlalchemy.orm import Session, selectinload

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

	# Obtener todas los outfits registrados.
	@staticmethod
	def get_all(db: Session) -> list[Outfit]: # Fíjate que devolvemos la clase Outfit (importada de models)
		return db.query(Outfit).all()

	# Obtener todos los outfits asociados a un usuario.
	@staticmethod
	def get_by_usuario_id(db: Session, usuario_id: int) -> list[Outfit]:
		return db.query(Outfit).filter(Outfit.usuario_id == usuario_id).order_by(Outfit.id.desc()).all()

	# Obtener un outfit por su identificador.
	@staticmethod
	def get_by_id(db: Session, outfit_id: int) -> Outfit | None:
		return db.query(Outfit).filter(Outfit.id == outfit_id).first()

	# Crear un nuevo outfit con los datos recibidos.
	@staticmethod
	def create(db: Session, data: OutfitCreate) -> Outfit:
		prenda_ids = OutfitCRUD._normalizar_prenda_ids(data.prenda_ids)
		if not prenda_ids:
			raise ValueError("El conjunto debe tener al menos una prenda")

		OutfitCRUD._validar_prendas_existentes(db, prenda_ids)

		# Traer los objetos Prenda de la BD
		prendas_db = db.query(Prenda).filter(Prenda.id.in_(prenda_ids)).all()

		# Crear el Outfit pasándole la lista de objetos Prenda
		outfit_data = data.model_dump(exclude={"prenda_ids"})
		nuevo_outfit = Outfit(**outfit_data, prendas=prendas_db)

		db.add(nuevo_outfit)
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
				raise ValueError("El conjunto debe tener al menos una prenda")

			OutfitCRUD._validar_prendas_existentes(db, prenda_ids)

			# Traer los objetos Prenda de la BD y actualizar la relación
			prendas_db = db.query(Prenda).filter(Prenda.id.in_(prenda_ids)).all()
			outfit.prendas = prendas_db

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
		try:
			db.commit()
		except Exception:
			db.rollback()
			raise
		return True
