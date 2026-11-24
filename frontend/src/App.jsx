import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, PrivateRoute } from './components/RouteGuards';
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

      {/* Pages réservées aux utilisateurs connectés */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}