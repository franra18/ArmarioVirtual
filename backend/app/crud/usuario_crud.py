from sqlalchemy.orm import Session

from app.models.usuario_model import Usuario
from app.schemas.usuario_schema import UsuarioCreate, UsuarioUpdate


class UsuarioCRUD:
	# Obtener todos los usuarios registrados.
	@staticmethod
	def get_all(db: Session) -> list[Usuario]:
		return db.query(Usuario).all()

	# Obtener un usuario por su identificador.
	@staticmethod
	def get_by_id(db: Session, usuario_id: int) -> Usuario | None:
		return db.query(Usuario).filter(Usuario.id == usuario_id).first()

	# Crear un nuevo usuario con los datos recibidos.
	@staticmethod
	def create(db: Session, data: UsuarioCreate) -> Usuario:
		nuevo_usuario = Usuario(**data.model_dump())
		db.add(nuevo_usuario)
		db.commit()
		db.refresh(nuevo_usuario)
		return nuevo_usuario

	# Actualizar los campos enviados de un usuario existente.
	@staticmethod
	def update(db: Session, usuario_id: int, data: UsuarioUpdate) -> Usuario | None:
		usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
		if not usuario:
			return None

		update_data = data.model_dump(exclude_unset=True)
		for key, value in update_data.items():
			setattr(usuario, key, value)

		db.commit()
		db.refresh(usuario)
		return usuario

	# Eliminar un usuario por su identificador.
	@staticmethod
	def delete(db: Session, usuario_id: int) -> bool:
		usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
		if not usuario:
			return False

		db.delete(usuario)
		db.commit()
		return True
