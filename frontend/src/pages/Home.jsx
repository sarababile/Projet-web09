import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main style={{ maxWidth: 720, margin: '96px auto', padding: 24 }}>
      <div className="card fade-up" style={{ display: 'grid', gap: 16 }}>
        <h1>Bonjour, {user.name}</h1>
        <p className="muted">Vous êtes connecté(e) avec {user.email}. Le tableau de bord arrive à l'étape 9.</p>
        <Button variant="ghost" icon={LogOut} onClick={onLogout} style={{ justifySelf: 'start' }}>
          Se déconnecter
        </Button>
      </div>
    </main>
  );
}