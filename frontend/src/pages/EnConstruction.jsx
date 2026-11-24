import { Sprout } from 'lucide-react';

/** Page temporaire, remplacée au fur et à mesure des étapes 10 et 11. */
export default function EnConstruction({ titre }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-kicker">Bientôt disponible</p>
          <h1>{titre}</h1>
        </div>
      </header>
      <div className="card empty fade-up">
        <Sprout size={40} color="var(--sage)" aria-hidden="true" />
        <p style={{ marginTop: 12 }}>Cette page sera construite dans une prochaine étape.</p>
      </div>
    </>
  );
}