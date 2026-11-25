import { MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../api/client';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Field from '../components/ui/Field';
import SidePanel from '../components/ui/SidePanel';
import useCrud from '../hooks/useCrud';
import { fmt } from '../utils/format';

const VIDE = { nom: '', superficie: '', localisation: '', type_sol: '', description: '' };

const SOLS = ['Limoneux', 'Sableux', 'Argileux', 'Argilo-calcaire', 'Limono-sableux', 'Humifère']
  .map((s) => ({ value: s, label: s }));

/** Motifs « rangs de culture » des cartes, aux couleurs de la palette. */
const MOTIFS = [
  ['var(--botanical)', 'var(--fern)'],
  ['var(--linden)', 'var(--pistachio)'],
  ['var(--pine)', 'var(--emerald)'],
  ['var(--sage)', 'var(--olive)'],
];
const motif = (i) => {
  const [a, b] = MOTIFS[i % MOTIFS.length];
  return `repeating-linear-gradient(115deg, ${a} 0 18px, ${b} 18px 36px)`;
};

export default function Parcelles() {
  const [params] = useSearchParams();
  const [recherche, setRecherche] = useState(params.get('search') ?? '');
  const [filtre, setFiltre] = useState(recherche);

  // Petite temporisation : on n'interroge l'API qu'après 300 ms sans frappe
  useEffect(() => {
    const t = setTimeout(() => setFiltre(recherche), 300);
    return () => clearTimeout(t);
  }, [recherche]);

  const { items, loading, error, create, update, remove } = useCrud('/parcelles', filtre ? { search: filtre } : {});

  const [edition, setEdition] = useState(null);      // null = panneau fermé ; {} = ajout ; parcelle = modification
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const total = items.reduce((s, p) => s + p.superficie, 0);

  const ouvrir = (parcelle = {}) => {
    setForm(parcelle.id ? {
      nom: parcelle.nom, superficie: parcelle.superficie, localisation: parcelle.localisation,
      type_sol: parcelle.type_sol ?? '', description: parcelle.description ?? '',
    } : VIDE);
    setErreurs({});
    setMessage('');
    setEdition(parcelle);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enregistrer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreurs({});
    setMessage('');
    try {
      const payload = { ...form, type_sol: form.type_sol || null, description: form.description || null };
      if (edition.id) await update(edition.id, payload);
      else await create(payload);
      setEdition(null);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) setErreurs(fe);
      else setMessage(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async () => {
    setDeleting(true);
    try {
      await remove(aSupprimer.id);
      setASupprimer(null);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-kicker">{items.length} parcelle(s) · {fmt(total)} ha au total</p>
          <h1>Parcelles</h1>
        </div>
        <Button icon={Plus} onClick={() => ouvrir()}>Nouvelle parcelle</Button>
      </header>

      <div className="search" style={{ flex: 'none', maxWidth: 520 }}>
        <Search size={20} aria-hidden="true" />
        <label htmlFor="recherche-parcelle" className="sr-only">Rechercher</label>
        <input id="recherche-parcelle" type="search" placeholder="Rechercher par nom ou localisation…"
          value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && !edition && <div className="alert alert-error" role="alert">{message}</div>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="card empty">
          <p>{filtre ? 'Aucune parcelle ne correspond à la recherche.' : 'Aucune parcelle pour le moment.'}</p>
          {!filtre && <Button icon={Plus} onClick={() => ouvrir()} style={{ marginTop: 16 }}>Ajouter ma première parcelle</Button>}
        </div>
      ) : (
        <div className="grid-cards fade-up">
          {items.map((p, i) => (
            <article key={p.id} className="parcel">
              <div className="parcel-cover" style={{ background: motif(i) }}>
                {p.type_sol && <span className="parcel-sol">{p.type_sol}</span>}
              </div>
              <div className="parcel-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: 19 }}>{p.nom}</h2>
                    <p className="muted" style={{ fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={15} aria-hidden="true" /> {p.localisation}
                    </p>
                  </div>
                  <p className="serif parcel-surface">{fmt(p.superficie)}<span>ha</span></p>
                </div>
                {p.description && <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{p.description}</p>}
                <span className="badge badge-green" style={{ alignSelf: 'flex-start' }}>
                  {p.cultures_count} culture(s)
                </span>
                <div className="parcel-actions">
                  <Button variant="soft" size="sm" icon={Pencil} onClick={() => ouvrir(p)}>Modifier</Button>
                  <Button variant="soft" size="sm" icon={Trash2} aria-label={`Supprimer ${p.nom}`}
                    onClick={() => setASupprimer(p)} style={{ color: 'var(--danger)' }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {edition && (
        <SidePanel
          kicker="Parcelles"
          title={edition.id ? 'Modifier la parcelle' : 'Nouvelle parcelle'}
          onClose={() => setEdition(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setEdition(null)}>Annuler</Button>
              <Button type="submit" form="form-parcelle" loading={saving}>Enregistrer</Button>
            </>
          )}
        >
          <form id="form-parcelle" noValidate onSubmit={enregistrer} style={{ display: 'contents' }}>
            {message && <div className="alert alert-error" role="alert">{message}</div>}
            <Field label="Nom" name="nom" required placeholder="Parcelle Nord"
              value={form.nom} onChange={onChange} error={erreurs.nom} />
            <div className="form-row">
              <Field label="Superficie (ha)" name="superficie" type="number" step="0.01" min="0.01" required
                value={form.superficie} onChange={onChange} error={erreurs.superficie} />
              <Field label="Type de sol" name="type_sol" options={SOLS}
                value={form.type_sol} onChange={onChange} error={erreurs.type_sol} />
            </div>
            <Field label="Localisation" name="localisation" icon={MapPin} required placeholder="Commune, douar…"
              value={form.localisation} onChange={onChange} error={erreurs.localisation} />
            <Field label="Description" name="description" textarea placeholder="Irrigation, accès, remarques…"
              value={form.description} onChange={onChange} error={erreurs.description} />
          </form>
        </SidePanel>
      )}

      {aSupprimer && (
        <ConfirmDialog
          title={`Supprimer « ${aSupprimer.nom} » ?`}
          message={`Ses ${aSupprimer.cultures_count} culture(s), ainsi que leurs intrants et récoltes, seront aussi supprimés. Cette action est définitive.`}
          loading={deleting}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </>
  );
}