import { useEffect, useRef } from 'react';
import { use_app_dispatch, use_app_selector } from '../../../store/hooks';
import { listen_to_auth_changes } from '../api/auth-api';
import { clear_user_session, load_firebase_user_profile } from './auth-slice';
import { select_auth_firebase_uid, select_auth_status } from '../selectors/auth-selectors';

export function AuthListener() {
  const dispatch = use_app_dispatch();
  const firebase_uid = use_app_selector(select_auth_firebase_uid);
  const auth_status = use_app_selector(select_auth_status);
  const firebase_uid_ref = useRef(firebase_uid);
  const auth_status_ref = useRef(auth_status);

  useEffect(() => {
    firebase_uid_ref.current = firebase_uid;
  }, [firebase_uid]);

  useEffect(() => {
    auth_status_ref.current = auth_status;
  }, [auth_status]);

  useEffect(() => {
    const unsubscribe = listen_to_auth_changes((user) => {
      const current_uid = firebase_uid_ref.current;
      const current_status = auth_status_ref.current;

      if (user?.uid) {
        if (current_status === 'loading' || user.uid === current_uid) {
          return;
        }

        dispatch(load_firebase_user_profile({
          uid: user.uid,
          email: user.email,
          display_name: user.displayName,
        }));
        return;
      }

      if (current_uid) {
        dispatch(clear_user_session());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
