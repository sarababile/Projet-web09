import AuthVisual from './AuthVisual';

/** Mise en page des écrans de connexion et d'inscription : panneau visuel + formulaire. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <AuthVisual />

      <section className="auth-form-side">
        <div className="auth-form fade-up">{children}</div>
      </section>
    </div>
  );
}