import { Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setLoading(true);
    try {
      await register(form, true);
      navigate('/');
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) setErrors(fe);
      else setMessage(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const ready = form.name && form.email && form.password.length >= 8 && form.password_confirmation;

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} style={{ display: 'contents' }}>
        <div>
          <h1 className="auth-heading">Créer un compte</h1>
          <p className="auth-sub">Quelques secondes suffisent pour démarrer.</p>
        </div>

        {message && <div className="alert alert-error" role="alert">{message}</div>}

        <Field label="Nom complet" name="name" icon={User} autoComplete="name"
          value={form.name} onChange={onChange} error={errors.name} required />
        <Field label="Email" name="email" type="email" icon={Mail} autoComplete="email"
          value={form.email} onChange={onChange} error={errors.email} required />
        <Field label="Mot de passe (8 caractères min.)" name="password" type="password" icon={Lock}
          autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} required />
        <Field label="Confirmer le mot de passe" name="password_confirmation" type="password" icon={Lock}
          autoComplete="new-password" value={form.password_confirmation} onChange={onChange}
          error={errors.password_confirmation} required />

        <Button type="submit" size="lg" block loading={loading} disabled={!ready}>
          Créer mon compte
        </Button>

        <p className="auth-footer">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  );
}