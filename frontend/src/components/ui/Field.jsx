import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

/**
 * Champ de formulaire : input, liste déroulante (options) ou zone de texte (textarea).
 * icon : icône Lucide à gauche — error : message d'erreur affiché sous le champ
 * options : [{ value, label }]
 */
export default function Field({
  label, name, value, onChange, icon: Icon, error, options, textarea,
  type = 'text', required, ...props
}) {
  const [visible, setVisible] = useState(false);
  const hasValue = value !== '' && value !== null && value !== undefined;
  const common = { id: name, name, value: value ?? '', onChange, required, 'aria-invalid': !!error, ...props };

  let control;
  if (options) {
    control = (
      <select {...common}>
        <option value="">— Choisir —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (textarea) {
    control = <textarea {...common} />;
  } else {
    control = <input type={type === 'password' && visible ? 'text' : type} {...common} />;
  }

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={name}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      <div className={`input ${hasValue ? 'has-value' : ''} ${error ? 'has-error' : ''}`}>
        {Icon && <Icon size={20} strokeWidth={hasValue ? 2.2 : 1.9} aria-hidden="true" />}
        {control}
        {type === 'password' && (
          <button type="button" className="input-toggle" onClick={() => setVisible(!visible)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
            {visible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}