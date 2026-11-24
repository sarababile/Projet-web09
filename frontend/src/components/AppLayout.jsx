import { BarChart3, FlaskConical, LayoutGrid, LogOut, Map, ShoppingBasket, Sprout } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './ui/Logo';

const liens = [
  { to: '/', label: 'Tableau de bord', icon: LayoutGrid, end: true },
  { to: '/parcelles', label: 'Parcelles', icon: Map },
  { to: '/cultures', label: 'Cultures', icon: Sprout },
  { to: '/intrants', label: 'Intrants', icon: FlaskConical },
  { to: '/recoltes', label: 'Récoltes', icon: ShoppingBasket },
  { to: '/rendements', label: 'Rendements', icon: BarChart3 },
];

/** Initiales d'un nom : « Sara Babile » → « SB » */
const initiales = (nom = '') =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('');

/** Structure des pages connectées : barre latérale + contenu de la page (Outlet). */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo size={40} />
          <span className="serif">AgriGestion</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {liens.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{initiales(user?.name)}</div>
          <div className="sidebar-user-text">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" className="sidebar-logout" onClick={onLogout} aria-label="Se déconnecter">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}