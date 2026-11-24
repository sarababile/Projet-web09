/** Fonctions d'affichage et libellés partagés par toutes les pages. */

const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/** 183100 → « 183 100 » */
export const fmt = (n) => (n === null || n === undefined || n === '' ? '—' : nombre.format(Number(n)));

/** 183100 kg → « 183,1 t » ; 850 kg → « 850 kg » */
export const fmtPoids = (kg) => {
  const v = Number(kg || 0);
  return v >= 1000
    ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(v / 1000)} t`
    : `${nombre.format(v)} kg`;
};

/** « 2026-11-14 » → « 14 nov. 2026 » (sans décalage de fuseau horaire) */
export const fmtDate = (iso) => {
  if (!iso) return '—';
  const [a, m, j] = iso.slice(0, 10).split('-').map(Number);
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Nombre de jours entre aujourd'hui et une date (négatif = dans le passé). */
export const joursJusqua = (iso) => {
  const [a, m, j] = iso.slice(0, 10).split('-').map(Number);
  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);
  return Math.round((new Date(a, m - 1, j) - aujourdHui) / 86400000);
};

export const ETATS = {
  planifiee: { label: 'Planifiée', tone: 'gray' },
  en_croissance: { label: 'En croissance', tone: 'green' },
  en_floraison: { label: 'En floraison', tone: 'rose' },
  prete_a_recolter: { label: 'Prête à récolter', tone: 'amber' },
  recoltee: { label: 'Récoltée', tone: 'blue' },
};

export const TYPES_INTRANT = {
  semence: { label: 'Semences et plants', couleur: 'var(--pine)' },
  engrais: { label: 'Engrais', couleur: 'var(--botanical)' },
  traitement: { label: 'Traitements', couleur: 'var(--sage)' },
  irrigation: { label: 'Irrigation', couleur: 'var(--gold)' },
  autre: { label: 'Autres', couleur: 'var(--olive)' },
};

export const QUALITES = {
  excellente: { label: 'Excellente', tone: 'dark' },
  bonne: { label: 'Bonne', tone: 'green' },
  moyenne: { label: 'Moyenne', tone: 'amber' },
  faible: { label: 'Faible', tone: 'rose' },
};

/** Les 12 derniers mois : [{ cle: '2026-11', label: 'nov.' }, …] */
export const douzeDerniersMois = () => {
  const mois = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 11; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    mois.push({
      cle: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`,
      label: m.toLocaleDateString('fr-FR', { month: 'short' }),
    });
  }
  return mois;
};