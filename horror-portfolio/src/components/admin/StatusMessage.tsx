interface StatusMessageProps {
  message: string;
  variant?: 'success' | 'error' | 'loading' | 'info';
}

const VARIANT_COLORS: Record<string, string> = {
  success: '#8c9e82',
  error: 'rgba(255, 80, 80, 0.9)',
  loading: 'rgba(140, 158, 130, 0.6)',
  info: 'rgba(140, 158, 130, 0.8)',
};

export function StatusMessage({ message, variant = 'info' }: StatusMessageProps) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
        fontSize: '0.8rem',
        color: VARIANT_COLORS[variant] ?? VARIANT_COLORS.info,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: '0.5rem 0',
      }}
    >
      {'> '}{message}
    </p>
  );
}
