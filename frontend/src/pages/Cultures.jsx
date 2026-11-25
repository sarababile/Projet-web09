import { Pencil, Plus, Sprout, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { errorMessage, fieldErrors } from '../api/client';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Field from '../components/ui/Field';
import SidePanel from '../components/ui/SidePanel';
import useCrud from '../hooks/useCrud';
import { ETATS, fmt, fmtDate } from '../utils/format';

const VIDE = {
  parcelle_id: '', nom: '', variete: '', date_plantation: '',
  date_recolte_prevue: '', etat: 'planifiee', notes: '',
};
const OPTIONS_ETAT = Object.entries(ETATS).map(([value, e]) => ({ value, label: e.label }));

export default function Cultures() {
  const [filtres, setFiltres] = useState({ parcelle_id: '', etat: '' });
  // On n'envoie à l'API que les filtres remplis
  const params = Object.fromEntries(Object.entries(filtres).filter(([, v]) => v));
  const { items, loading, error, create, update, remove } = useCrud('/cultures', params);
  const parcelles = useCrud('/parcelles');

  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const optionsParcelles = parcelles.items.map((p) => ({ value: p.id, label: `${p.nom} (${fmt(p.superficie)} ha)` }));
  const aucuneParcelle = !parcelles.loading && parcelles.items.length === 0;

  const ouvrir = (c = {}) => {
    setForm(c.id ? {
      parcelle_id: c.parcelle_id, nom: c.nom, variete: c.variete ?? '',
      date_plantation: c.date_plantation, date_recolte_prevue: c.date_recolte_prevue ?? '',
      etat: c.etat, notes: c.notes ?? '',
    } : { ...VIDE, parcelle_id: filtres.parcelle_id });
    setErreurs({});
    setMessage('');
    setEdition(c);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enregistrer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreurs({});
    setMessage('');
    try {
      // Les champs facultatifs vides sont envoyés à null
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]));
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
          <p className="page-kicker">{items.length} culture(s)</p>
          <h1>Cultures</h1>
        </div>
        <Button icon={Plus} onClick={() => ouvrir()} disabled={aucuneParcelle}>Nouvelle culture</Button>
      </header>

      {aucuneParcelle && (
        <div className="alert" style={{ background: 'var(--pistachio)', color: 'var(--emerald)' }}>
          Ajoutez d'abord une parcelle : chaque culture est rattachée à une parcelle.
        </div>
      )}

      <div className="toolbar">
        <div className="select-pill">
          <label htmlFor="filtre-parcelle" className="sr-only">Filtrer par parcelle</label>
          <select id="filtre-parcelle" value={filtres.parcelle_id}
            onChange={(e) => setFiltres({ ...filtres, parcelle_id: e.target.value })}>
            <option value="">Toutes les parcelles</option>
            {optionsParcelles.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="chips" role="group" aria-label="Filtrer par état">
          <button type="button" className="chip" aria-pressed={filtres.etat === ''}
            onClick={() => setFiltres({ ...filtres, etat: '' })}>Tous les états</button>
          {OPTIONS_ETAT.map((o) => (
            <button key={o.value} type="button" className="chip" aria-pressed={filtres.etat === o.value}
              onClick={() => setFiltres({ ...filtres, etat: o.value })}>{o.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && !edition && <div className="alert alert-error" role="alert">{message}</div>}

      <section className="card fade-up">
        {loading ? <p className="empty">Chargement…</p> : items.length === 0 ? (
          <p className="empty">Aucune culture {filtres.etat || filtres.parcelle_id ? 'pour ces filtres' : 'pour le moment'}.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Culture</th><th>Parcelle</th><th>Plantation</th><th>Récolte prévue</th>
                  <th className="num">Récolté</th><th>État</th><th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="initial serif" style={{ width: 40, height: 40, fontSize: 17, borderRadius: 12 }}>{c.nom[0]}</div>
                        <div>
                          <p style={{ fontWeight: 800 }}>{c.nom}</p>
                          {c.variete && <p className="muted" style={{ fontSize: 13 }}>{c.variete}</p>}
                        </div>
                      </div>
                    </td>
                    <td>{c.parcelle?.nom}</td>
                    <td>{fmtDate(c.date_plantation)}</td>
                    <td>{fmtDate(c.date_recolte_prevue)}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(Number(c.recoltes_sum_quantite || 0))} kg</td>
                    <td><Badge tone={ETATS[c.etat].tone}>{ETATS[c.etat].label}</Badge></td>
                    <td>
                      <div className="row-actions">
                        <Button variant="soft" size="sm" icon={Pencil} aria-label={`Modifier ${c.nom}`} onClick={() => ouvrir(c)} />
                        <Button variant="soft" size="sm" icon={Trash2} aria-label={`Supprimer ${c.nom}`}
                          onClick={() => setASupprimer(c)} style={{ color: 'var(--danger)' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {edition && (
        <SidePanel
          kicker="Cultures"
          title={edition.id ? 'Modifier la culture' : 'Nouvelle culture'}
          onClose={() => setEdition(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setEdition(null)}>Annuler</Button>
              <Button type="submit" form="form-culture" loading={saving}>Enregistrer</Button>
            </>
          )}
        >
          <form id="form-culture" onSubmit={enregistrer} style={{ display: 'contents' }}>
            {message && <div className="alert alert-error" role="alert">{message}</div>}
            <Field label="Parcelle" name="parcelle_id" required options={optionsParcelles}
              value={form.parcelle_id} onChange={onChange} error={erreurs.parcelle_id} />
            <div className="form-row">
              <Field label="Culture" name="nom" icon={Sprout} required placeholder="Blé, Tomate…"
                value={form.nom} onChange={onChange} error={erreurs.nom} />
              <Field label="Variété" name="variete" placeholder="Achtar…"
                value={form.variete} onChange={onChange} error={erreurs.variete} />
            </div>
            <div className="form-row">
              <Field label="Date de plantation" name="date_plantation" type="date" required
                value={form.date_plantation} onChange={onChange} error={erreurs.date_plantation} />
              <Field label="Récolte prévue" name="date_recolte_prevue" type="date"
                value={form.date_recolte_prevue} onChange={onChange} error={erreurs.date_recolte_prevue} />
            </div>
            <Field label="État" name="etat" required options={OPTIONS_ETAT}
              value={form.etat} onChange={onChange} error={erreurs.etat} />
            <Field label="Notes de suivi" name="notes" textarea placeholder="Observations, traitements prévus…"
              value={form.notes} onChange={onChange} error={erreurs.notes} />
          </form>
        </SidePanel>
      )}

      {aSupprimer && (
        <ConfirmDialog
          title={`Supprimer « ${aSupprimer.nom} » ?`}
          message="Les intrants et les récoltes de cette culture seront aussi supprimés. Cette action est définitive."
          loading={deleting}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </>
  );
}