'use client';

import { useState, useRef } from 'react';

interface TerminalInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'textarea';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const BLOCK_CHAR = '█';

export function TerminalInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  disabled = false,
}: TerminalInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const displayValue =
    type === 'password' ? BLOCK_CHAR.repeat(value.length) : value;

  const baseInputStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid rgba(140, 158, 130, 0.3)',
    color: '#8c9e82',
    fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    width: '100%',
    outline: 'none',
    caretColor: '#8c9e82',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box' as const,
    ...(isFocused && {
      borderColor: 'rgba(140, 158, 130, 0.7)',
      boxShadow: '0 0 8px rgba(140, 158, 130, 0.2)',
    }),
    ...(error && {
      borderColor: 'rgba(255, 80, 80, 0.6)',
    }),
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
          fontSize: '0.75rem',
          color: '#8c9e82',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.375rem',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {'> '}{label}
      </label>

      {/* Input wrapper with blinking cursor overlay */}
      <div style={{ position: 'relative' }}>
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            rows={4}
            style={{
              ...baseInputStyle,
              resize: 'vertical',
            }}
          />
        ) : (
          <>
            {/* Hidden real input for actual value capture */}
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type === 'password' ? 'password' : 'text'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder={type === 'password' ? undefined : placeholder}
              autoComplete={type === 'password' ? 'current-password' : 'off'}
              style={{
                ...baseInputStyle,
                // For password: hide the real input visually, show masked overlay
                ...(type === 'password' && {
                  color: 'transparent',
                  caretColor: 'transparent',
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                }),
              }}
            />
            {/* Password mask overlay */}
            {type === 'password' && (
              <div
                aria-hidden="true"
                style={{
                  ...baseInputStyle,
                  pointerEvents: 'none',
                  position: 'relative',
                  zIndex: 0,
                  letterSpacing: '0.15em',
                  minHeight: '2.25rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span>{displayValue}</span>
                {isFocused && (
                  <span
                    style={{
                      display: 'inline-block',
                      animation: 'blink 1s step-end infinite',
                      marginLeft: value.length > 0 ? '1px' : '0',
                    }}
                  >
                    {BLOCK_CHAR}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          style={{
            fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
            fontSize: '0.75rem',
            color: 'rgba(255, 80, 80, 0.9)',
            marginTop: '0.25rem',
          }}
        >
          {'> '}{error}
        </p>
      )}

      {/* Blink keyframe — injected once */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
