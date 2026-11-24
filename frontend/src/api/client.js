import axios from 'axios';

/**
 * Stockage du jeton :
 * « Se souvenir de moi » coché → localStorage (garde la session après fermeture du navigateur)
 * sinon → sessionStorage (effacée à la fermeture de l'onglet)
 */
export const session = {
  get(key) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },
  save({ user, token }, remember) {
    session.clear();
    const store = remember ? localStorage : sessionStorage;
    store.setItem('token', token);
    store.setItem('user', JSON.stringify(user));
  },
  clear() {
    ['token', 'user'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};

/** Instance Axios partagée par toute l'application. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
});

// Ajoute le jeton à chaque requête
api.interceptors.request.use((config) => {
  const token = session.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Jeton expiré ou invalide → retour à la page de connexion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.includes('/login')) {
      session.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/** Message d'erreur lisible pour l'utilisateur. */
export function errorMessage(error) {
  if (!error.response) {
    return "Impossible de joindre le serveur. Vérifiez que « php artisan serve » est lancé.";
  }
  return error.response.data?.message || `Erreur ${error.response.status}.`;
}

/** Erreurs de validation Laravel (422) → { champ: 'message' } */
export function fieldErrors(error) {
  const errors = error.response?.data?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]]));
}

export default api;