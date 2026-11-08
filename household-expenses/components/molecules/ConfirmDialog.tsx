import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface Props {
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Delete',
  busy = false,
  error = '',
  onCancel,
  onConfirm,
}: Props) {
  const [confirmation, setConfirmation] = useState('');

  return (
    <div className="modal-backdrop">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2 id="confirm-dialog-title">{title}</h2>

        <p>{description}</p>

        <Input
          label="Confirmation"
          placeholder="Type DELETE to confirm"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          autoFocus
        />

        {error && <p className="inline-error">{error}</p>}

        <div className="dialog-actions">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={busy || confirmation !== '12345'}
            onClick={() => void onConfirm()}
          >
            {busy ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}