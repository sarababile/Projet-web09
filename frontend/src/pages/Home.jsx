import { useAuth } from '../context/AuthContext';

/** Accueil temporaire — remplacé par le tableau de bord à l'étape 9B. */
export default function Home() {
  const { user } = useAuth();
  return (
    <header className="page-header">
      <div>
        <p className="page-kicker">Tableau de bord</p>
        <h1>Bonjour, {user.name.split(' ')[0]}</h1>
      </div>
    </header>
  );
}