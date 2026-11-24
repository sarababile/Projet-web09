/**
 * Bouton réutilisable (forme pilule).
 * variant : primary | light | ghost | soft | danger — size : sm | md | lg
 * icon : composant d'icône Lucide (ex : Plus) — loading : affiche un spinner
 */
 export default function Button({
    variant = 'primary', size = 'md', icon: Icon, loading = false,
    block = false, className = '', children, type = 'button', ...props
  }) {
    const classes = [
      'btn', `btn-${variant}`,
      size !== 'md' && `btn-${size}`,
      block && 'btn-block',
      !children && 'btn-icon',
      className,
    ].filter(Boolean).join(' ');
  
    return (
      <button type={type} className={classes} disabled={loading || props.disabled} {...props}>
        {loading ? <span className="spinner" /> : Icon && <Icon size={18} strokeWidth={2.2} aria-hidden="true" />}
        {children}
      </button>
    );
  }