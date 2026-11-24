import { ArrowUpRight, Leaf, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errorMessage } from '../api/client';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import {
  ETATS, QUALITES, TYPES_INTRANT, douzeDerniersMois, fmt, fmtDate, fmtPoids, joursJusqua,
} from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    // Trois requêtes envoyées en parallèle
    Promise.all([api.get('/dashboard'), api.get('/cultures'), api.get('/rendements')])
      .then(([stats, cultures, rendements]) => setData({
        stats: stats.data,
        cultures: cultures.data,
        rendements: rendements.data,
      }))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const heure = new Date().getHours();
  const salutation = heure < 18 ? 'Bonjour' : 'Bonsoir';
  const aujourdHui = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const onRecherche = (e) => {
    e.preventDefault();
    navigate(`/parcelles${recherche ? `?search=${encodeURIComponent(recherche)}` : ''}`);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-kicker" style={{ textTransform: 'capitalize' }}>{aujourdHui}</p>
          <h1>{salutation}, {user.name.split(' ')[0]}</h1>
        </div>
        <form className="search" onSubmit={onRecherche} role="search">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="recherche" className="sr-only">Rechercher une parcelle</label>
          <input id="recherche" type="search" placeholder="Rechercher une parcelle…"
            value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        </form>
        <Link to="/recoltes" className="btn btn-primary">
          <Plus size={18} strokeWidth={2.2} aria-hidden="true" /> Nouvelle récolte
        </Link>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {!data && !error && <p className="empty">Chargement du tableau de bord…</p>}
      {data && (data.stats.nb_parcelles === 0 ? <Bienvenue /> : <Contenu {...data} />)}
    </>
  );
}

/** Premier lancement : aucune parcelle encore. */
function Bienvenue() {
  return (
    <section className="card card-dark fade-up" style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Leaf size={40} color="var(--gold)" aria-hidden="true" />
      <h2 className="serif" style={{ fontSize: 32 }}>Bienvenue sur AgriGestion</h2>
      <p className="muted">Commencez par ajouter votre première parcelle : vos cultures, intrants et récoltes s'y rattacheront.</p>
      <Link to="/parcelles" className="btn btn-light">Ajouter une parcelle</Link>
    </section>
  );
}

function Contenu({ stats, cultures, rendements }) {
  // ---- Production par mois (12 derniers mois, en tonnes) ----
  const mois = douzeDerniersMois().map((m) => ({
    label: m.label,
    tonnes: Math.round(((stats.production_par_mois[m.cle] ?? 0) / 1000) * 10) / 10,
  }));
  const maxMois = Math.max(...mois.map((m) => m.tonnes));

  // ---- Indicateurs ----
  const meilleur = rendements.find((r) => r.rendement);
  const coutParKg = stats.production_totale > 0 ? stats.cout_intrants / stats.production_totale : null;

  // ---- Cultures en cours (non récoltées) ----
  const enCours = cultures.filter((c) => c.etat !== 'recoltee').slice(0, 4).map((c) => {
    const depuis = -joursJusqua(c.date_plantation);
    let progression = null;
    if (c.date_recolte_prevue && depuis >= 0) {
      const duree = depuis + joursJusqua(c.date_recolte_prevue);
      progression = duree > 0 ? Math.min(100, Math.round((depuis / duree) * 100)) : 100;
    }
    const cycle = depuis < 0
      ? `Plantation dans ${-depuis} j`
      : depuis < 60 ? `Plantée il y a ${depuis} j` : `Plantée il y a ${Math.round(depuis / 30)} mois`;
    return { ...c, progression, cycle };
  });

  // ---- Coûts par type d'intrant ----
  const couts = Object.entries(stats.cout_par_type)
    .map(([type, total]) => ({ type, total: Number(total) }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <>
      {/* Rangée 1 : production + graphique */}
      <div className="row fade-up">
        <section className="card card-dark hero" style={{ flex: '5 1 340px' }}>
          <Leaf className="hero-leaf" size={260} aria-hidden="true" />
          <p className="hero-kicker">Production totale</p>
          <p className="serif hero-value">{fmtPoids(stats.production_totale)}</p>
          <p style={{ color: 'var(--linden)' }}>{fmt(stats.production_totale)} kg récoltés sur {fmt(stats.superficie_totale)} ha cultivés</p>
          <div className="hero-stats">
            <div><p className="serif">{stats.nb_parcelles}</p><span>parcelles</span></div>
            <div><p className="serif">{stats.nb_cultures}</p><span>cultures</span></div>
            <div><p className="serif">{fmt(stats.cout_intrants)}</p><span>DH d'intrants</span></div>
          </div>
          <Link to="/rendements" className="btn btn-light btn-sm" style={{ alignSelf: 'flex-start' }}>
            Voir les rendements <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section className="card" style={{ flex: '7 1 440px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2>Production par mois</h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>Quantités récoltées sur les 12 derniers mois, en tonnes</p>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mois} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#4e6355', fontSize: 12, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4e6355', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(195,221,186,0.35)' }}
                  formatter={(v) => [`${fmt(v)} t`, 'Production']}
                  contentStyle={{ borderRadius: 14, border: '1px solid #dce7d6', fontFamily: 'Urbanist' }}
                />
                <Bar dataKey="tonnes" radius={[10, 10, 0, 0]} maxBarSize={44}>
                  {mois.map((m) => (
                    <Cell key={m.label} fill={m.tonnes === maxMois && maxMois > 0 ? '#14381f' : m.tonnes > 0 ? '#5aa06d' : '#e1ebdc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Rangée 2 : indicateurs */}
      <div className="row fade-up">
        <Kpi label="Surface cultivée" value={fmt(stats.superficie_totale)} unit="ha" sub={`réparties sur ${stats.nb_parcelles} parcelle(s)`} />
        <Kpi label="Cultures actives" value={stats.cultures_actives} unit={`sur ${stats.nb_cultures}`} sub={`${stats.nb_cultures - stats.cultures_actives} culture(s) récoltée(s)`} />
        <Kpi label="Coût des intrants" value={fmt(stats.cout_intrants)} unit="DH"
          sub={coutParKg !== null ? `soit ${fmt(Math.round(coutParKg * 100) / 100)} DH par kg produit` : 'aucune récolte pour le moment'} />
        <Kpi label="Meilleur rendement" value={meilleur ? fmt(Math.round(meilleur.rendement)) : '—'} unit={meilleur ? 'kg/ha' : ''}
          sub={meilleur ? `${meilleur.culture} · ${meilleur.parcelle}` : 'aucune récolte pour le moment'} />
      </div>

      {/* Rangée 3 : cultures + coûts */}
      <div className="row fade-up">
        <section className="card" style={{ flex: '7 1 440px' }}>
          <div className="card-head">
            <h2>Cultures en cours</h2>
            <Link to="/cultures" className="link">Tout voir</Link>
          </div>
          {enCours.length === 0 && <p className="empty">Aucune culture en cours.</p>}
          {enCours.map((c) => (
            <div key={c.id} className="list-row">
              <div className="initial serif">{c.nom[0]}</div>
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <p style={{ fontWeight: 800 }}>{c.nom} <span className="muted" style={{ fontWeight: 500 }}>{c.variete}</span></p>
                <p className="muted" style={{ fontSize: 13 }}>{c.parcelle?.nom} · {fmt(c.parcelle?.superficie)} ha</p>
              </div>
              <div style={{ flex: '0 1 180px', display: 'grid', gap: 6 }}>
                <div className="progress"><div style={{ width: `${c.progression ?? 0}%` }} /></div>
                <span className="muted" style={{ fontSize: 12 }}>{c.cycle}</span>
              </div>
              <Badge tone={ETATS[c.etat].tone}>{ETATS[c.etat].label}</Badge>
            </div>
          ))}
        </section>

        <section className="card" style={{ flex: '5 1 320px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h2>Coût des intrants</h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{fmt(stats.cout_intrants)} DH au total</p>
          </div>
          {couts.length === 0 ? <p className="empty">Aucun intrant enregistré.</p> : (
            <>
              <div className="stack-bar">
                {couts.map((c) => <div key={c.type} style={{ flex: c.total, background: TYPES_INTRANT[c.type].couleur }} />)}
              </div>
              {couts.map((c) => (
                <div key={c.type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="dot" style={{ background: TYPES_INTRANT[c.type].couleur }} />
                  <span style={{ flex: 1, fontWeight: 600 }}>{TYPES_INTRANT[c.type].label}</span>
                  <span className="muted" style={{ fontSize: 13, width: 44, textAlign: 'right' }}>
                    {Math.round((c.total / stats.cout_intrants) * 100)} %
                  </span>
                  <span style={{ fontWeight: 800, width: 100, textAlign: 'right' }}>{fmt(c.total)} DH</span>
                </div>
              ))}
            </>
          )}
        </section>
      </div>

      {/* Rangée 4 : dernières récoltes */}
      <section className="card fade-up">
        <div className="card-head">
          <h2>Dernières récoltes</h2>
          <Link to="/recoltes" className="link">Tout voir</Link>
        </div>
        {stats.dernieres_recoltes.length === 0 ? <p className="empty">Aucune récolte enregistrée.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Culture</th><th>Parcelle</th>
                  <th className="num">Quantité</th><th className="num">Rendement</th><th>Qualité</th>
                </tr>
              </thead>
              <tbody>
                {stats.dernieres_recoltes.map((r) => (
                  <tr key={r.id}>
                    <td className="muted" style={{ fontWeight: 600 }}>{fmtDate(r.date_recolte)}</td>
                    <td style={{ fontWeight: 800 }}>{r.culture?.nom}</td>
                    <td>{r.culture?.parcelle?.nom}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(r.quantite)} kg</td>
                    <td className="num">{fmt(Math.round(r.rendement))} kg/ha</td>
                    <td><Badge tone={QUALITES[r.qualite].tone}>{QUALITES[r.qualite].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Kpi({ label, value, unit, sub }) {
  return (
    <div className="card kpi">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)' }}>{label}</span>
        <span className="kpi-icon"><Leaf size={18} aria-hidden="true" /></span>
      </div>
      <p className="serif kpi-value">{value}<span>{unit}</span></p>
      <p className="muted" style={{ fontSize: 13 }}>{sub}</p>
    </div>
  );
}