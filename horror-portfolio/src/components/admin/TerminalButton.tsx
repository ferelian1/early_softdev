'use client';

import { ButtonHTMLAttributes } from 'react';

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger';
  children: React.ReactNode;
}

export function TerminalButton({
  variant = 'primary',
  children,
  disabled,
  style,
  ...props
}: TerminalButtonProps) {
  const borderColor =
    variant === 'danger'
      ? 'rgba(255, 80, 80, 0.6)'
      : 'rgba(140, 158, 130, 0.5)';
  const hoverGlow =
    variant === 'danger'
      ? '0 0 8px rgba(255, 80, 80, 0.4)'
      : '0 0 8px rgba(140, 158, 130, 0.4)';
  const textColor = variant === 'danger' ? 'rgba(255, 80, 80, 0.9)' : '#8c9e82';

  return (
    <button
      disabled={disabled}
      style={{
        background: 'transparent',
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '0.5rem 1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = hoverGlow;
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            variant === 'danger'
              ? 'rgba(255, 80, 80, 0.9)'
              : 'rgba(140, 158, 130, 0.9)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLButtonElement).style.borderColor = borderColor;
      }}
      {...props}
    >
      {children}
    </button>
  );
}
