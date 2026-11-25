import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errorMessage } from '../api/client';
import Badge from '../components/ui/Badge';
import { ETATS, fmt, fmtPoids } from '../utils/format';

export default function Rendements() {
  const [lignes, setLignes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/rendements')
      .then((r) => setLignes(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <div className="alert alert-error" role="alert">{error}</div>;
  if (!lignes) return <p className="empty">Chargement…</p>;

  const production = lignes.reduce((s, l) => s + l.production_totale, 0);
  const cout = lignes.reduce((s, l) => s + l.cout_intrants, 0);
  const coutMoyen = production > 0 ? cout / production : null;

  // Cultures déjà récoltées, pour les graphiques
  const recoltees = lignes.filter((l) => l.rendement);
  const parRendement = [...recoltees].sort((a, b) => b.rendement - a.rendement)
    .map((l) => ({ nom: l.culture, valeur: Math.round(l.rendement) }));
  const parCout = [...recoltees].filter((l) => l.cout_par_kg !== null).sort((a, b) => b.cout_par_kg - a.cout_par_kg)
    .map((l) => ({ nom: l.culture, valeur: l.cout_par_kg }));

  // Phrase « À retenir » calculée à partir des données
  const plusCher = parCout[0];
  const moinsCher = parCout[parCout.length - 1];
  const aRetenir = parCout.length >= 2
    ? `${plusCher.nom} coûte ${fmt(plusCher.valeur)} DH par kg à produire, contre ${fmt(moinsCher.valeur)} DH pour ${moinsCher.nom.toLowerCase()}.`
    : 'Enregistrez des récoltes et des intrants sur plusieurs cultures pour comparer leur rentabilité.';

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-kicker">Rendement = production récoltée ÷ superficie de la parcelle</p>
          <h1>Rendements</h1>
        </div>
      </header>

      {lignes.length === 0 ? (
        <div className="card empty">Aucune culture enregistrée pour le moment.</div>
      ) : (
        <>
          <div className="row fade-up">
            <Kpi label="Production totale" value={fmt(production)} unit="kg" />
            <Kpi label="Coût des intrants" value={fmt(cout)} unit="DH" />
            <Kpi label="Coût de revient moyen" value={coutMoyen !== null ? fmt(Math.round(coutMoyen * 100) / 100) : '—'} unit="DH/kg" />
            <section className="card card-dark" style={{ flex: '1.4 1 300px', padding: 24, display: 'grid', gap: 8, alignContent: 'start' }}>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>À retenir</p>
              <p style={{ fontSize: 17, lineHeight: 1.45, fontWeight: 600 }}>{aRetenir}</p>
            </section>
          </div>

          <div className="row fade-up">
            <Graphique
              titre="Rendement par culture"
              sousTitre="En kilogrammes par hectare — plus c'est haut, mieux c'est"
              data={parRendement}
              format={(v) => `${fmt(v)}`}
              unite="kg/ha"
            />
            <Graphique
              titre="Coût de revient"
              sousTitre="Coût des intrants par kilogramme produit — plus c'est bas, mieux c'est"
              data={parCout}
              format={(v) => `${fmt(v)} DH`}
              unite="DH/kg"
              couleur="#c9a86a"
            />
          </div>

          <section className="card fade-up">
            <h2 style={{ marginBottom: 14 }}>Détail par culture</h2>
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 860 }}>
                <thead>
                  <tr>
                    <th>Culture</th><th>Parcelle</th><th className="num">Superficie</th>
                    <th className="num">Production</th><th className="num">Rendement</th>
                    <th className="num">Coût intrants</th><th className="num">Coût / kg</th><th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((l) => (
                    <tr key={l.culture_id}>
                      <td>
                        <p style={{ fontWeight: 800 }}>{l.culture}</p>
                        {l.variete && <p className="muted" style={{ fontSize: 13 }}>{l.variete}</p>}
                      </td>
                      <td>{l.parcelle}</td>
                      <td className="num">{fmt(l.superficie)} ha</td>
                      <td className="num" style={{ fontWeight: 700 }}>{l.production_totale > 0 ? fmtPoids(l.production_totale) : '—'}</td>
                      <td className="num">{l.rendement ? `${fmt(Math.round(l.rendement))} kg/ha` : '—'}</td>
                      <td className="num">{fmt(l.cout_intrants)} DH</td>
                      <td className="num" style={{ fontWeight: 800 }}>{l.cout_par_kg !== null ? `${fmt(l.cout_par_kg)} DH` : '—'}</td>
                      <td><Badge tone={ETATS[l.etat].tone}>{ETATS[l.etat].label}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Kpi({ label, value, unit }) {
  return (
    <div className="card kpi" style={{ flex: '1 1 200px' }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)' }}>{label}</span>
      <p className="serif kpi-value">{value}<span>{unit}</span></p>
    </div>
  );
}

/** Graphique à barres horizontales ; la meilleure valeur (la 1re) est en vert foncé. */
function Graphique({ titre, sousTitre, data, format, unite, couleur = '#5aa06d' }) {
  const hauteur = Math.max(160, data.length * 56);
  return (
    <section className="card" style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2>{titre}</h2>
        <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{sousTitre}</p>
      </div>
      {data.length === 0 ? <p className="empty">Pas encore de récolte.</p> : (
        <div style={{ height: hauteur }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nom" width={120} tickLine={false} axisLine={false}
                tick={{ fill: '#0d1f16', fontSize: 14, fontWeight: 700 }} />
              <Tooltip
                cursor={{ fill: 'rgba(195,221,186,0.35)' }}
                formatter={(v) => [`${format(v)} ${unite.includes('DH') ? '/ kg' : unite}`, titre]}
                contentStyle={{ borderRadius: 14, border: '1px solid #dce7d6', fontFamily: 'Urbanist' }}
              />
              <Bar dataKey="valeur" radius={[0, 10, 10, 0]} barSize={22} background={{ fill: '#eef3ea', radius: 10 }}>
                {data.map((d, i) => <Cell key={d.nom} fill={i === 0 && couleur === '#5aa06d' ? '#14381f' : couleur} />)}
                <LabelList dataKey="valeur" position="right" formatter={format}
                  style={{ fill: '#0d1f16', fontWeight: 800, fontSize: 14, fontFamily: 'Fraunces' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}