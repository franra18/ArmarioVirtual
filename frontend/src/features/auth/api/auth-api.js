import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { get_json, post_json, put_json } from '../../../shared/api/http-client';
import { firebase_auth } from '../../../shared/firebase/firebase-client';

function normalize_email(value) {
  return String(value ?? '').trim().toLowerCase();
}

function resolve_display_name({ display_name, email }) {
  const normalized_display_name = String(display_name ?? '').trim();
  if (normalized_display_name) {
    return normalized_display_name;
  }

  const normalized_email = normalize_email(email);
  if (!normalized_email) {
    return 'Usuario';
  }

  const local_part = normalized_email.split('@')[0];
  return local_part ? local_part.replace(/[._-]+/g, ' ') : 'Usuario';
}

function normalize_firebase_user(firebase_user) {
  return {
    uid: String(firebase_user?.uid ?? '').trim(),
    email: normalize_email(firebase_user?.email),
    display_name: String(
      firebase_user?.displayName ?? firebase_user?.display_name ?? ''
    ).trim(),
  };
}

function normalize_user_id(user_id) {
  const normalized_user_id = Number.parseInt(String(user_id ?? '').trim(), 10);
  if (Number.isNaN(normalized_user_id) || normalized_user_id < 1) {
    throw new Error('El id de usuario debe ser un numero entero positivo');
  }

  return normalized_user_id;
}

async function fetch_or_create_backend_user({ email, display_name }) {
  const normalized_email = normalize_email(email);
  if (!normalized_email) {
    throw new Error('El correo es obligatorio para crear la sesion');
  }

  const usuarios = await get_json('/api/usuarios/');
  const usuarios_list = Array.isArray(usuarios) ? usuarios : [];
  const existing_user = usuarios_list.find((usuario) => (
    normalize_email(usuario?.email) === normalized_email
  ));

  if (existing_user) {
    return existing_user;
  }

  const nombre = resolve_display_name({ display_name, email: normalized_email });
  return post_json('/api/usuarios/', {
    nombre,
    email: normalized_email,
  });
}

export async function fetch_user_profile_from_backend(user_id) {
  const normalized_user_id = normalize_user_id(user_id);

  const [usuario, prendas, outfits] = await Promise.all([
    get_json(`/api/usuarios/${normalized_user_id}`),
    get_json(`/api/usuarios/${normalized_user_id}/prendas`),
    get_json(`/api/usuarios/${normalized_user_id}/outfits`),
  ]);

  const recientes = (Array.isArray(prendas) ? prendas : [])
    .slice(0, 4)
    .map((prenda) => prenda?.nombre)
    .filter(Boolean);

  return {
    id: String(usuario.id),
    nombre: usuario.nombre,
    prendas_total: Array.isArray(prendas) ? prendas.length : 0,
    outfits_total: Array.isArray(outfits) ? outfits.length : 0,
    recientes: recientes.length > 0 ? recientes : ['Sin prendas todavia'],
  };
}

export async function sign_in_with_email_password(email, password) {
  const normalized_email = normalize_email(email);
  if (!normalized_email) {
    throw new Error('El correo es obligatorio');
  }

  if (!String(password ?? '').trim()) {
    throw new Error('La contrasena es obligatoria');
  }

  const user_credential = await signInWithEmailAndPassword(
    firebase_auth,
    normalized_email,
    String(password)
  );

  return user_credential.user;
}

export async function sign_up_with_email_password(email, password) {
  const normalized_email = normalize_email(email);
  if (!normalized_email) {
    throw new Error('El correo es obligatorio');
  }

  if (!String(password ?? '').trim()) {
    throw new Error('La contrasena es obligatoria');
  }

  const user_credential = await createUserWithEmailAndPassword(
    firebase_auth,
    normalized_email,
    String(password)
  );

  return user_credential.user;
}

export function listen_to_auth_changes(callback) {
  return onAuthStateChanged(firebase_auth, callback);
}

export async function sign_out_from_firebase() {
  await signOut(firebase_auth);
}

export async function resolve_user_profile_from_firebase_user(firebase_user) {
  const normalized_user = normalize_firebase_user(firebase_user);
  if (!normalized_user.email) {
    throw new Error('No se pudo obtener el correo del usuario');
  }

  const backend_user = await fetch_or_create_backend_user({
    email: normalized_user.email,
    display_name: normalized_user.display_name,
  });
  const profile = await fetch_user_profile_from_backend(backend_user.id);

  return {
    profile,
    user_id: profile.id,
    firebase_uid: normalized_user.uid,
    firebase_email: normalized_user.email,
  };
}

export async function update_user_name_in_backend(user_id, nombre) {
  const normalized_user_id = normalize_user_id(user_id);
  const normalized_nombre = String(nombre ?? '').trim();
  if (!normalized_nombre) {
    throw new Error('El nombre es obligatorio');
  }

  return put_json(`/api/usuarios/${normalized_user_id}`, {
    nombre: normalized_nombre,
  });
}