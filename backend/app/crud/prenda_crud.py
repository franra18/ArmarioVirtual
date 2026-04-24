from sqlalchemy.orm import Session

from app.models.color_model import Color
from app.models.prenda_color_model import PrendaColor
from app.models.prenda_model import Prenda
from app.schemas.prenda_schema import PrendaCreate, PrendaUpdate


class PrendaCRUD:
	# Obtener nombres de colores agrupados por prenda para enriquecer respuestas.
	@staticmethod
	def _get_color_names_by_prenda_id(db: Session, prenda_ids: list[int]) -> dict[int, list[str]]:
		if not prenda_ids:
			return {}

		filas = (
			db.query(PrendaColor.prenda_id, Color.nombre)
			.join(Color, Color.id == PrendaColor.color_id)
			.filter(PrendaColor.prenda_id.in_(prenda_ids))
			.all()
		)

		colores_por_prenda: dict[int, list[str]] = {}
		for prenda_id, color_nombre in filas:
			if not color_nombre:
				continue

			colores_prenda = colores_por_prenda.setdefault(prenda_id, [])
			if color_nombre not in colores_prenda:
				colores_prenda.append(color_nombre)

		return colores_por_prenda

	# Normalizar y depurar la lista de IDs de colores recibida.
	@staticmethod
	def _normalizar_color_ids(color_ids: list[int]) -> list[int]:
		color_ids_limpios = [color_id for color_id in color_ids if color_id is not None]
		return list(dict.fromkeys(color_ids_limpios))

	# Validar que todos los IDs de colores existan antes de asociarlos.
	@staticmethod
	def _validar_colores_existentes(db: Session, color_ids: list[int]) -> None:
		cantidad_existentes = db.query(Color).filter(Color.id.in_(color_ids)).count()
		if cantidad_existentes != len(color_ids):
			raise ValueError("Uno o mas colores no existen")

	# Verificar que una prenda tenga al menos un color asociado.
	@staticmethod
	def _validar_colores_obligatorios(db: Session, prenda_id: int) -> None:
		tiene_colores = db.query(PrendaColor).filter(PrendaColor.prenda_id == prenda_id).first()
		if not tiene_colores:
			raise ValueError("La prenda debe tener al menos un color")

	# Obtener todas las prendas registradas.
	@staticmethod
	def get_all(db: Session) -> list[Prenda]:
		return db.query(Prenda).all()

	# Obtener una prenda por su identificador.
	@staticmethod
	def get_by_id(db: Session, prenda_id: int) -> Prenda | None:
		return db.query(Prenda).filter(Prenda.id == prenda_id).first()

	# Obtener todas las prendas asociadas a un usuario.
	@staticmethod
	def get_by_usuario_id(db: Session, usuario_id: int) -> list[dict]:
		prendas = (
			db.query(Prenda)
			.filter(Prenda.usuario_id == usuario_id)
			.order_by(Prenda.fecha_creacion.desc(), Prenda.id.desc())
			.all()
		)
		prenda_ids = [prenda.id for prenda in prendas]
		colores_por_prenda = PrendaCRUD._get_color_names_by_prenda_id(db, prenda_ids)

		return [
			{
				"id": prenda.id,
				"usuario_id": prenda.usuario_id,
				"nombre": prenda.nombre,
				"tipo_prenda": prenda.tipo_prenda,
				"nivel_abrigo": prenda.nivel_abrigo,
				"nivel_elegancia": prenda.nivel_elegancia,
				"foto_url": prenda.foto_url,
				"color_nombres": colores_por_prenda.get(prenda.id, []),
				"fecha_creacion": prenda.fecha_creacion,
			}
			for prenda in prendas
		]

	# Crear una nueva prenda con los datos recibidos.
	@staticmethod
	def create(db: Session, data: PrendaCreate) -> Prenda:
		color_ids = PrendaCRUD._normalizar_color_ids(data.color_ids)
		if not color_ids:
			raise ValueError("La prenda debe tener al menos un color")

		PrendaCRUD._validar_colores_existentes(db, color_ids)

		nueva_prenda = Prenda(**data.model_dump(exclude={"color_ids"}))
		db.add(nueva_prenda)
		db.flush()

		for color_id in color_ids:
			db.add(PrendaColor(prenda_id=nueva_prenda.id, color_id=color_id))

		try:
			db.commit()
		except Exception:
			db.rollback()
			raise

		db.refresh(nueva_prenda)
		return nueva_prenda

	# Actualizar los campos enviados de una prenda existente.
	@staticmethod
	def update(db: Session, prenda_id: int, data: PrendaUpdate) -> Prenda | None:
		prenda = db.query(Prenda).filter(Prenda.id == prenda_id).first()
		if not prenda:
			return None

		update_data = data.model_dump(exclude_unset=True, exclude={"color_ids"})
		for key, value in update_data.items():
			setattr(prenda, key, value)

		if data.color_ids is not None:
			color_ids = PrendaCRUD._normalizar_color_ids(data.color_ids)
			if not color_ids:
				raise ValueError("La prenda debe tener al menos un color")

			PrendaCRUD._validar_colores_existentes(db, color_ids)

			db.query(PrendaColor).filter(PrendaColor.prenda_id == prenda_id).delete(synchronize_session=False)
			for color_id in color_ids:
				db.add(PrendaColor(prenda_id=prenda_id, color_id=color_id))
		else:
			PrendaCRUD._validar_colores_obligatorios(db, prenda_id)

		try:
			db.commit()
		except Exception:
			db.rollback()
			raise
		db.refresh(prenda)
		return prenda

	# Eliminar una prenda por su identificador.
	@staticmethod
	def delete(db: Session, prenda_id: int) -> bool:
		prenda = db.query(Prenda).filter(Prenda.id == prenda_id).first()
		if not prenda:
			return False

		db.delete(prenda)
		db.commit()
		return True
