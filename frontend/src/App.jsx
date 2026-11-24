import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { GuestRoute, PrivateRoute } from './components/RouteGuards';
import EnConstruction from './pages/EnConstruction';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

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
          <Route path="/" element={<Home />} />
          <Route path="/parcelles" element={<EnConstruction titre="Parcelles" />} />
          <Route path="/cultures" element={<EnConstruction titre="Cultures" />} />
          <Route path="/intrants" element={<EnConstruction titre="Intrants" />} />
          <Route path="/recoltes" element={<EnConstruction titre="Récoltes" />} />
          <Route path="/rendements" element={<EnConstruction titre="Rendements" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}