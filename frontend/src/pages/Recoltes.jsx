import { Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../api/client';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Field from '../components/ui/Field';
import SidePanel from '../components/ui/SidePanel';
import useCrud from '../hooks/useCrud';
import { QUALITES, fmt, fmtDate, fmtPoids } from '../utils/format';

const aujourdHui = () => new Date().toISOString().slice(0, 10);
const VIDE = { culture_id: '', date_recolte: '', quantite: '', qualite: 'bonne', notes: '' };
const OPTIONS_QUALITE = Object.entries(QUALITES).map(([value, q]) => ({ value, label: q.label }));

export default function Recoltes() {
  const [params, setParams] = useSearchParams();
  const [filtres, setFiltres] = useState({ culture_id: '', qualite: '' });
  // L'API filtre par culture ; la qualité est filtrée ici, côté React
  const { items, loading, error, create, update, remove } = useCrud('/recoltes', filtres.culture_id ? { culture_id: filtres.culture_id } : {});
  const cultures = useCrud('/cultures');
  const affichees = filtres.qualite ? items.filter((r) => r.qualite === filtres.qualite) : items;

  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const optionsCultures = cultures.items.map((c) => ({ value: c.id, label: `${c.nom} — ${c.parcelle?.nom}` }));
  const aucuneCulture = !cultures.loading && cultures.items.length === 0;

  // Résumé
  const production = affichees.reduce((s, r) => s + r.quantite, 0);
  const meilleure = affichees.reduce((best, r) => (r.rendement > (best?.rendement ?? 0) ? r : best), null);

  // Aperçu du rendement dans le formulaire
  const cultureChoisie = cultures.items.find((c) => String(c.id) === String(form.culture_id));
  const superficie = cultureChoisie?.parcelle?.superficie;
  const apercu = superficie > 0 && Number(form.quantite) > 0 ? Number(form.quantite) / superficie : null;

  const ouvrir = (r = {}) => {
    setForm(r.id ? {
      culture_id: r.culture_id, date_recolte: r.date_recolte, quantite: r.quantite,
      qualite: r.qualite, notes: r.notes ?? '',
    } : { ...VIDE, culture_id: filtres.culture_id, date_recolte: aujourdHui() });
    setErreurs({});
    setMessage('');
    setEdition(r);
  };

  // Lien « Nouvelle récolte » du tableau de bord : /recoltes?nouveau=1
  useEffect(() => {
    if (params.get('nouveau')) {
      ouvrir();
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enregistrer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErreurs({});
    setMessage('');
    try {
      const payload = { ...form, notes: form.notes || null };
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
          <p className="page-kicker">{affichees.length} récolte(s)</p>
          <h1>Récoltes</h1>
        </div>
        <Button icon={Plus} onClick={() => ouvrir()} disabled={aucuneCulture}>Nouvelle récolte</Button>
      </header>

      {aucuneCulture && (
        <div className="alert" style={{ background: 'var(--pistachio)', color: 'var(--emerald)' }}>
          Ajoutez d'abord une culture : chaque récolte provient d'une culture.
        </div>
      )}

      {affichees.length > 0 && (
        <section className="card card-dark fade-up hero-stats" style={{ marginTop: 0, borderTop: 0, padding: '28px 32px', flexWrap: 'wrap', rowGap: 16 }}>
          <div>
            <p className="muted" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Production</p>
            <p className="serif" style={{ fontSize: 44, color: 'var(--gold)' }}>{fmtPoids(production)}</p>
          </div>
          <div>
            <p className="muted" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Récoltes</p>
            <p className="serif" style={{ fontSize: 44 }}>{affichees.length}</p>
          </div>
          <div>
            <p className="muted" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Meilleur rendement</p>
            <p className="serif" style={{ fontSize: 44 }}>{meilleure ? fmt(Math.round(meilleure.rendement)) : '—'} <span style={{ fontSize: 18 }}>kg/ha</span></p>
            {meilleure && <span>{meilleure.culture?.nom} · {fmtDate(meilleure.date_recolte)}</span>}
          </div>
        </section>
      )}

      <div className="toolbar">
        <div className="select-pill">
          <label htmlFor="filtre-culture-r" className="sr-only">Filtrer par culture</label>
          <select id="filtre-culture-r" value={filtres.culture_id}
            onChange={(e) => setFiltres({ ...filtres, culture_id: e.target.value })}>
            <option value="">Toutes les cultures</option>
            {optionsCultures.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="chips" role="group" aria-label="Filtrer par qualité">
          <button type="button" className="chip" aria-pressed={filtres.qualite === ''}
            onClick={() => setFiltres({ ...filtres, qualite: '' })}>Toutes qualités</button>
          {OPTIONS_QUALITE.map((o) => (
            <button key={o.value} type="button" className="chip" aria-pressed={filtres.qualite === o.value}
              onClick={() => setFiltres({ ...filtres, qualite: o.value })}>{o.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && !edition && <div className="alert alert-error" role="alert">{message}</div>}

      <section className="card fade-up">
        {loading ? <p className="empty">Chargement…</p> : affichees.length === 0 ? (
          <p className="empty">Aucune récolte {filtres.qualite || filtres.culture_id ? 'pour ces filtres' : 'pour le moment'}.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Culture</th><th className="num">Quantité</th>
                  <th className="num">Rendement</th><th>Qualité</th><th>Notes</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {affichees.map((r) => (
                  <tr key={r.id}>
                    <td className="muted" style={{ fontWeight: 600 }}>{fmtDate(r.date_recolte)}</td>
                    <td>
                      <p style={{ fontWeight: 800 }}>{r.culture?.nom}</p>
                      <p className="muted" style={{ fontSize: 13 }}>{r.culture?.parcelle?.nom} · {fmt(r.culture?.parcelle?.superficie)} ha</p>
                    </td>
                    <td className="num" style={{ fontWeight: 800 }}>{fmt(r.quantite)} kg</td>
                    <td className="num">{fmt(Math.round(r.rendement))} kg/ha</td>
                    <td><Badge tone={QUALITES[r.qualite].tone}>{QUALITES[r.qualite].label}</Badge></td>
                    <td className="muted" style={{ fontSize: 14, maxWidth: 220 }}>{r.notes || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <Button variant="soft" size="sm" icon={Pencil} aria-label="Modifier la récolte" onClick={() => ouvrir(r)} />
                        <Button variant="soft" size="sm" icon={Trash2} aria-label="Supprimer la récolte"
                          onClick={() => setASupprimer(r)} style={{ color: 'var(--danger)' }} />
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
          kicker="Récoltes"
          title={edition.id ? 'Modifier la récolte' : 'Nouvelle récolte'}
          onClose={() => setEdition(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setEdition(null)}>Annuler</Button>
              <Button type="submit" form="form-recolte" loading={saving}>Enregistrer</Button>
            </>
          )}
        >
          <form id="form-recolte" onSubmit={enregistrer} style={{ display: 'contents' }}>
            {message && <div className="alert alert-error" role="alert">{message}</div>}
            <Field label="Culture récoltée" name="culture_id" required options={optionsCultures}
              value={form.culture_id} onChange={onChange} error={erreurs.culture_id} />
            <div className="form-row">
              <Field label="Date de récolte" name="date_recolte" type="date" required
                value={form.date_recolte} onChange={onChange} error={erreurs.date_recolte} />
              <Field label="Quantité (kg)" name="quantite" type="number" step="0.01" min="0.01" icon={Scale} required
                value={form.quantite} onChange={onChange} error={erreurs.quantite} />
            </div>

            {apercu !== null && (
              <div className="apercu" aria-live="polite">
                <span>Rendement de cette récolte</span>
                <strong className="serif">{fmt(Math.round(apercu))} kg/ha</strong>
                <span className="muted">{fmt(form.quantite)} kg ÷ {fmt(superficie)} ha ({cultureChoisie.parcelle.nom})</span>
              </div>
            )}

            <Field label="Qualité" name="qualite" required options={OPTIONS_QUALITE}
              value={form.qualite} onChange={onChange} error={erreurs.qualite} />
            <Field label="Notes" name="notes" textarea placeholder="Calibre, conditions de récolte…"
              value={form.notes} onChange={onChange} error={erreurs.notes} />
          </form>
        </SidePanel>
      )}

      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer cette récolte ?"
          message={`La récolte du ${fmtDate(aSupprimer.date_recolte)} (${fmt(aSupprimer.quantite)} kg de ${aSupprimer.culture?.nom}) sera retirée des calculs de production et de rendement.`}
          loading={deleting}
          onConfirm={supprimer}
          onCancel={() => setASupprimer(null)}
        />
      )}
    </>
  );
}