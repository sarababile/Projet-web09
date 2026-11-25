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

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoint, { params: JSON.parse(cleParams) });
      setItems(data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [endpoint, cleParams]);

  useEffect(() => { reload(); }, [reload]);

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