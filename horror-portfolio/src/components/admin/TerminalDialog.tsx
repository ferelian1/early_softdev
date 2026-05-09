'use client';

import { TerminalButton } from './TerminalButton';
import { StatusMessage } from './StatusMessage';

interface TerminalDialogProps {
  entityName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isConfirming?: boolean;
  error?: string;
}

export function TerminalDialog({
  entityName,
  onConfirm,
  onCancel,
  isConfirming = false,
  error,
}: TerminalDialogProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(16, 21, 15, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(140, 158, 130, 0.4)',
          backgroundColor: '#10150F',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
        }}
      >
        {/* Header */}
        <p
          style={{
            color: 'rgba(255, 80, 80, 0.9)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.8rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 80, 80, 0.2)',
            paddingBottom: '0.75rem',
          }}
        >
          {'> BANISHMENT PROTOCOL INITIATED'}
        </p>

        {/* Target entity */}
        <p
          style={{
            color: '#8c9e82',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}
        >
          TARGET: <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{entityName}</span>
        </p>

        {/* Warning */}
        <p
          style={{
            color: 'rgba(140, 158, 130, 0.7)',
            fontSize: '0.75rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {'> THIS ENTITY WILL BE BANISHED TO THE VOID PERMANENTLY. THIS ACTION CANNOT BE UNDONE.'}
        </p>

        {/* Error */}
        {error && <StatusMessage message={error} variant="error" />}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <TerminalButton
            variant="danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'BANISHING...' : 'CONFIRM BANISHMENT'}
          </TerminalButton>
          <TerminalButton
            variant="primary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            CANCEL
          </TerminalButton>
        </div>
      </div>
    </div>
  );
}
