from sqlalchemy.orm import Session

from app.models.color_model import Color
from app.schemas.color_schema import ColorCreate, ColorUpdate


class ColorCRUD:
	# Obtener todos los colores registrados.
	@staticmethod
	def get_all(db: Session) -> list[Color]:
		return db.query(Color).all()

	# Obtener un color por su identificador.
	@staticmethod
	def get_by_id(db: Session, color_id: int) -> Color | None:
		return db.query(Color).filter(Color.id == color_id).first()

	# Crear un nuevo color con los datos recibidos.
	@staticmethod
	def create(db: Session, data: ColorCreate) -> Color:
		nuevo_color = Color(**data.model_dump())
		db.add(nuevo_color)
		db.commit()
		db.refresh(nuevo_color)
		return nuevo_color

	# Actualizar los campos enviados de un color existente.
	@staticmethod
	def update(db: Session, color_id: int, data: ColorUpdate) -> Color | None:
		color = db.query(Color).filter(Color.id == color_id).first()
		if not color:
			return None

		update_data = data.model_dump(exclude_unset=True)
		for key, value in update_data.items():
			setattr(color, key, value)

		db.commit()
		db.refresh(color)
		return color

	# Eliminar un color por su identificador.
	@staticmethod
	def delete(db: Session, color_id: int) -> bool:
		color = db.query(Color).filter(Color.id == color_id).first()
		if not color:
			return False

		db.delete(color)
		db.commit()
		return True
