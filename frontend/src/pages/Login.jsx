import { Lock, Mail, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const connect = async (email, password) => {
    setLoading(true);
    setErrors({});
    setMessage('');
    try {
      await login(email, password, remember);
      navigate('/');
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) setErrors(fe);
      else setMessage(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    connect(form.email, form.password);
  };

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} style={{ display: 'contents' }}>
        <div>
          <h1 className="auth-heading">Connexion</h1>
          <p className="auth-sub">Heureux de vous revoir. Entrez vos identifiants.</p>
        </div>

        {message && <div className="alert alert-error" role="alert">{message}</div>}

        <Field label="Email" name="email" type="email" icon={Mail} autoComplete="email"
          value={form.email} onChange={onChange} error={errors.email} required />
        <Field label="Mot de passe" name="password" type="password" icon={Lock} autoComplete="current-password"
          value={form.password} onChange={onChange} error={errors.password} required />

        <label className="checkbox">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Se souvenir de moi
        </label>

        <Button type="submit" size="lg" block loading={loading} disabled={!form.email || !form.password}>
          Se connecter
        </Button>

        <div className="auth-divider">ou</div>

        <Button variant="ghost" size="lg" block icon={Sprout} disabled={loading}
          onClick={() => connect('demo@ferme.ma', 'password')}>
          Essayer le compte de démonstration
        </Button>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </form>
    </AuthLayout>
  );
}