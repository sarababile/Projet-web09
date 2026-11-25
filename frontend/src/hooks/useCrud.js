import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../api/client';

/**
 * Gère une ressource de l'API (liste + ajout + modification + suppression).
 * Exemple : const parcelles = useCrud('/parcelles', { search: 'Nord' });
 */
export default function useCrud(endpoint, params = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cleParams = JSON.stringify(params); // recharge quand les filtres changent

  // Requête de la liste : l'état n'est modifié qu'à l'arrivée de la réponse
  const charger = useCallback(
    () => api.get(endpoint, { params: JSON.parse(cleParams) }),
    [endpoint, cleParams],
  );

  const appliquer = (promesse, estActif = () => true) => promesse
    .then(({ data }) => { if (estActif()) { setItems(data); setError(''); } })
    .catch((e) => { if (estActif()) setError(errorMessage(e)); })
    .finally(() => { if (estActif()) setLoading(false); });

  useEffect(() => {
    let actif = true; // ignore une réponse arrivée après un changement de filtre
    appliquer(charger(), () => actif);
    return () => { actif = false; };
  }, [charger]);

  const reload = () => appliquer(charger());

  const create = async (payload) => {
    const { data } = await api.post(endpoint, payload);
    await reload();
    return data;
  };

  const update = async (id, payload) => {
    const { data } = await api.put(`${endpoint}/${id}`, payload);
    await reload();
    return data;
  };

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, loading, error, reload, create, update, remove };
}