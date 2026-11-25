import Button from './Button';

/** Fenêtre de confirmation avant une action irréversible (suppression). */
export default function ConfirmDialog({ title, message, confirmLabel = 'Supprimer', loading, onConfirm, onCancel }) {
  return (
    <div className="overlay overlay-center" onMouseDown={onCancel}>
      <div className="dialog fade-up" role="alertdialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="serif" style={{ fontSize: 26 }}>{title}</h2>
        <p className="muted" style={{ lineHeight: 1.55 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button variant="ghost" block onClick={onCancel}>Annuler</Button>
          <Button variant="danger" block loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}