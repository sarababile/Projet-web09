import Logo from './ui/Logo';

const bandes = ['--pine', '--emerald', '--moss', '--botanical', '--fern', '--sage', '--olive', '--linden', '--pistachio'];
const modules = ['Parcelles', 'Cultures', 'Intrants', 'Récoltes', 'Rendements'];

/** Mise en page des écrans de connexion et d'inscription : panneau de marque + formulaire. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <section className="auth-brand">
        <div className="auth-brand-logo">
          <Logo size={44} />
          <span className="serif" style={{ fontSize: 24 }}>AgriGestion</span>
        </div>

        <div className="auth-brand-text">
          <p className="auth-kicker">Gestion d'exploitation agricole</p>
          <h1 className="auth-title">Cultivez mieux,<br />récoltez plus.</h1>
          <p className="auth-lead">
            Parcelles, cultures, intrants et récoltes réunis au même endroit.
            Suivez vos rendements saison après saison.
          </p>
          <ul className="auth-modules">
            {modules.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>

        <div className="auth-bands" aria-hidden="true">
          {bandes.map((c) => <div key={c} style={{ background: `var(${c})` }} />)}
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form fade-up">{children}</div>
      </section>
    </div>
  );
}