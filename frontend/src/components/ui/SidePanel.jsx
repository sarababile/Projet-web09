import { X } from 'lucide-react';
import { useEffect } from 'react';

/** Panneau qui glisse depuis la droite (formulaires d'ajout et de modification). */
export default function SidePanel({ kicker, title, onClose, children, footer }) {
  // Fermeture avec la touche Échap + blocage du défilement de la page
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="panel" role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <div>
            {kicker && <p className="panel-kicker">{kicker}</p>}
            <h2 className="serif" style={{ fontSize: 30, marginTop: 6 }}>{title}</h2>
          </div>
          <button type="button" className="btn btn-soft btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="panel-body">{children}</div>
        {footer && <div className="panel-footer">{footer}</div>}
      </aside>
    </div>
  );
}