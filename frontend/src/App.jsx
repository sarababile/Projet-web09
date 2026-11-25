import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { GuestRoute, PrivateRoute } from './components/RouteGuards';
import Cultures from './pages/Cultures';
import Dashboard from './pages/Dashboard';
import Intrants from './pages/Intrants';
import Login from './pages/Login';
import Parcelles from './pages/Parcelles';
import Recoltes from './pages/Recoltes';
import Register from './pages/Register';
import Rendements from './pages/Rendements';

export default function App() {
  return (
    <Routes>
      {/* Pages accessibles sans être connecté */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Pages réservées aux utilisateurs connectés, dans la structure avec barre latérale */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/parcelles" element={<Parcelles />} />
          <Route path="/cultures" element={<Cultures />} />
          <Route path="/intrants" element={<Intrants />} />
          <Route path="/recoltes" element={<Recoltes />} />
          <Route path="/rendements" element={<Rendements />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}