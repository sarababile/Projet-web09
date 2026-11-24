import { Lock, Mail, Plus, Sprout, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Field from './components/ui/Field';
import Logo from './components/ui/Logo';

const couleurs = ['--forest', '--pine', '--emerald', '--moss', '--botanical', '--fern', '--sage', '--olive', '--linden', '--pistachio', '--gold'];

export default function App() {
  const [email, setEmail] = useState('demo@ferme.ma');
  const [password, setPassword] = useState('');

  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 40px', display: 'grid', gap: 24 }}>
      <header className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Logo size={56} />
        <div>
          <h1>AgriGestion</h1>
          <p className="muted">Design system — guide de style</p>
        </div>
      </header>

      <section className="card fade-up">
        <h2 style={{ marginBottom: 16 }}>Palette</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {couleurs.map((c) => (
            <div key={c} style={{ textAlign: 'center' }}>
              <div style={{ width: 88, height: 64, borderRadius: 16, background: `var(${c})`, border: '1px solid var(--line)' }} />
              <code style={{ fontSize: 12 }}>{c}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="card fade-up">
        <h2 style={{ marginBottom: 16 }}>Boutons</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button icon={Plus}>Nouvelle récolte</Button>
          <Button variant="light">Voir les rendements</Button>
          <Button variant="ghost" icon={Sprout}>Compte de démonstration</Button>
          <Button variant="soft">Modifier</Button>
          <Button variant="danger" icon={Trash2}>Supprimer</Button>
          <Button loading>Chargement</Button>
          <Button variant="soft" icon={Trash2} aria-label="Supprimer" />
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <section className="card fade-up" style={{ flex: '1 1 380px', display: 'grid', gap: 18 }}>
          <h2>Champs</h2>
          <Field label="Email" name="email" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Mot de passe" name="password" type="password" icon={Lock} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field label="Localisation" name="lieu" required placeholder="Commune, douar…" value="" onChange={() => {}} error="La localisation est obligatoire." />
        </section>

        <section className="card card-dark fade-up" style={{ flex: '1 1 380px', display: 'grid', gap: 14, alignContent: 'start' }}>
          <p className="muted" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Production totale · 12 derniers mois</p>
          <p className="serif" style={{ fontSize: '4.5rem', lineHeight: 1, color: 'var(--gold)' }}>183,1 t</p>
          <p style={{ color: 'var(--linden)' }}>183 100 kg récoltés sur 18,1 ha cultivés</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <Badge tone="green">En croissance</Badge>
            <Badge tone="rose">En floraison</Badge>
            <Badge tone="amber">Prête à récolter</Badge>
            <Badge tone="blue">Récoltée</Badge>
            <Badge tone="gray">Planifiée</Badge>
          </div>
        </section>
      </div>
    </main>
  );
}