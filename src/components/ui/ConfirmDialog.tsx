import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  danger?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Onayla',
  danger,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} open={open} onOpenChange={onOpenChange}>
      <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>{description}</p>
      <div className="actions" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={() => onOpenChange(false)}>Vazgeç</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
