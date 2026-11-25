import { FlaskConical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { errorMessage, fieldErrors } from '../api/client';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Field from '../components/ui/Field';
import SidePanel from '../components/ui/SidePanel';
import useCrud from '../hooks/useCrud';
import { TYPES_INTRANT, fmt, fmtDate } from '../utils/format';

const aujourdHui = () => new Date().toISOString().slice(0, 10);
const VIDE = { culture_id: '', nom: '', type: '', quantite: '', unite: 'kg', date_utilisation: '', cout: '', notes: '' };
const OPTIONS_TYPE = Object.entries(TYPES_INTRANT).map(([value, t]) => ({ value, label: t.label }));
const UNITES = ['kg', 't', 'g', 'L', 'm³', 'sac', 'plant', 'unité'].map((u) => ({ value: u, label: u }));

export default function Intrants() {
  const [filtres, setFiltres] = useState({ culture_id: '', type: '' });
  const params = Object.fromEntries(Object.entries(filtres).filter(([, v]) => v));
  const { items, loading, error, create, update, remove } = useCrud('/intrants', params);
  const cultures = useCrud('/cultures');

  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const optionsCultures = cultures.items.map((c) => ({ value: c.id, label: `${c.nom} — ${c.parcelle?.nom}` }));
  const aucuneCulture = !cultures.loading && cultures.items.length === 0;

  // Résumé des coûts de la liste affichée
  const total = items.reduce((s, i) => s + (i.cout ?? 0), 0);
  const parType = Object.keys(TYPES_INTRANT)
    .map((type) => ({ type, total: items.filter((i) => i.type === type).reduce((s, i) => s + (i.cout ?? 0), 0) }))
    .filter((t) => t.total > 0);

  const ouvrir = (i = {}) => {
    setForm(i.id ? {
      culture_id: i.culture_id, nom: i.nom, type: i.type, quantite: i.quantite, unite: i.unite,
      date_utilisation: i.date_utilisation, cout: i.cout ?? '', notes: i.notes ?? '',
    } : { ...VIDE, culture_id: filtres.culture_id, date_utilisation: aujourdHui() });
    setErreurs({});
    setMessage('');
    setEdition(i);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enregistrer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreurs({});
    setMessage('');
    try {
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
          <p className="page-kicker">{items.length} intrant(s)</p>
          <h1>Intrants</h1>
        </div>
        <Button icon={Plus} onClick={() => ouvrir()} disabled={aucuneCulture}>Nouvel intrant</Button>
      </header>

      {aucuneCulture && (
        <div className="alert" style={{ background: 'var(--pistachio)', color: 'var(--emerald)' }}>
          Ajoutez d'abord une culture : chaque intrant est utilisé sur une culture.
        </div>
      )}

      {/* Résumé des coûts */}
      {items.length > 0 && (
        <section className="card card-dark fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
          <div style={{ flex: '0 0 auto' }}>
            <p className="muted" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Coût total</p>
            <p className="serif" style={{ fontSize: 44, color: 'var(--gold)' }}>{fmt(total)} <span style={{ fontSize: 20 }}>DH</span></p>
          </div>
          <div style={{ flex: '1 1 320px', display: 'grid', gap: 12 }}>
            <div className="stack-bar">
              {parType.map((t) => <div key={t.type} style={{ flex: t.total, background: TYPES_INTRANT[t.type].couleur === 'var(--pine)' ? 'var(--linden)' : TYPES_INTRANT[t.type].couleur }} />)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {parType.map((t) => (
                <span key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--linden)' }}>
                  <span className="dot" style={{ background: TYPES_INTRANT[t.type].couleur === 'var(--pine)' ? 'var(--linden)' : TYPES_INTRANT[t.type].couleur }} />
                  {TYPES_INTRANT[t.type].label} · <strong style={{ color: 'var(--pistachio)' }}>{fmt(t.total)} DH</strong>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="toolbar">
        <div className="select-pill">
          <label htmlFor="filtre-culture" className="sr-only">Filtrer par culture</label>
          <select id="filtre-culture" value={filtres.culture_id}
            onChange={(e) => setFiltres({ ...filtres, culture_id: e.target.value })}>
            <option value="">Toutes les cultures</option>
            {optionsCultures.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="chips" role="group" aria-label="Filtrer par type">
          <button type="button" className="chip" aria-pressed={filtres.type === ''}
            onClick={() => setFiltres({ ...filtres, type: '' })}>Tous les types</button>
          {OPTIONS_TYPE.map((o) => (
            <button key={o.value} type="button" className="chip" aria-pressed={filtres.type === o.value}
              onClick={() => setFiltres({ ...filtres, type: o.value })}>{o.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && !edition && <div className="alert alert-error" role="alert">{message}</div>}

      <section className="card fade-up">
        {loading ? <p className="empty">Chargement…</p> : items.length === 0 ? (
          <p className="empty">Aucun intrant {filtres.type || filtres.culture_id ? 'pour ces filtres' : 'pour le moment'}.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Intrant</th><th>Type</th><th>Culture</th><th className="num">Quantité</th>
                  <th>Utilisé le</th><th className="num">Coût</th><th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <p style={{ fontWeight: 800 }}>{i.nom}</p>
                      {i.notes && <p className="muted" style={{ fontSize: 13 }}>{i.notes}</p>}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <span className="dot" style={{ background: TYPES_INTRANT[i.type].couleur }} />
                        {TYPES_INTRANT[i.type].label}
                      </span>
                    </td>
                    <td>
                      <p>{i.culture?.nom}</p>
                      <p className="muted" style={{ fontSize: 13 }}>{i.culture?.parcelle?.nom}</p>
                    </td>
                    <td className="num">{fmt(i.quantite)} {i.unite}</td>
                    <td>{fmtDate(i.date_utilisation)}</td>
                    <td className="num" style={{ fontWeight: 800 }}>{i.cout !== null ? `${fmt(i.cout)} DH` : '—'}</td>
                    <td>
                      <div className="row-actions">
                        <Button variant="soft" size="sm" icon={Pencil} aria-label={`Modifier ${i.nom}`} onClick={() => ouvrir(i)} />
                        <Button variant="soft" size="sm" icon={Trash2} aria-label={`Supprimer ${i.nom}`}
                          onClick={() => setASupprimer(i)} style={{ color: 'var(--danger)' }} />
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
          kicker="Intrants"
          title={edition.id ? "Modifier l'intrant" : 'Nouvel intrant'}
          onClose={() => setEdition(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setEdition(null)}>Annuler</Button>
              <Button type="submit" form="form-intrant" loading={saving}>Enregistrer</Button>
            </>
          )}
        >
          <form id="form-intrant" noValidate onSubmit={enregistrer} style={{ display: 'contents' }}>
            {message && <div className="alert alert-error" role="alert">{message}</div>}
            <Field label="Culture concernée" name="culture_id" required options={optionsCultures}
              value={form.culture_id} onChange={onChange} error={erreurs.culture_id} />
            <Field label="Nom de l'intrant" name="nom" icon={FlaskConical} required placeholder="NPK 15-15-15…"
              value={form.nom} onChange={onChange} error={erreurs.nom} />
            <Field label="Type" name="type" required options={OPTIONS_TYPE}
              value={form.type} onChange={onChange} error={erreurs.type} />
            <div className="form-row">
              <Field label="Quantité" name="quantite" type="number" step="0.01" min="0.01" required
                value={form.quantite} onChange={onChange} error={erreurs.quantite} />
              <Field label="Unité" name="unite" required options={UNITES}
                value={form.unite} onChange={onChange} error={erreurs.unite} />
            </div>
            <div className="form-row">
              <Field label="Date d'utilisation" name="date_utilisation" type="date" required
                value={form.date_utilisation} onChange={onChange} error={erreurs.date_utilisation} />
              <Field label="Coût (DH)" name="cout" type="number" step="0.01" min="0"
                value={form.cout} onChange={onChange} error={erreurs.cout} />
            </div>
            <Field label="Notes" name="notes" textarea placeholder="Dose, conditions d'application…"
              value={form.notes} onChange={onChange} error={erreurs.notes} />
          </form>
        </SidePanel>
      )}

      {aSupprimer && (
        <ConfirmDialog
          title={`Supprimer « ${aSupprimer.nom} » ?`}
          message="Cet intrant sera retiré de la culture et des calculs de coût. Cette action est définitive."
          loading={deleting}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </>
  );
}