'use client';

import { useState, FormEvent } from 'react';
import { TerminalInput } from '@/components/admin/TerminalInput';
import { TerminalButton } from '@/components/admin/TerminalButton';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { adminLogin } from '@/lib/adminApi';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { access_token } = await adminLogin(password);
      // Set cookie then do a full page navigation so the middleware
      // sees the cookie on the very next request (avoids race condition
      // with client-side router.push which may fire before the cookie
      // is visible to the edge middleware).
      document.cookie = `cztoken=${encodeURIComponent(access_token)}; path=/; SameSite=Strict`;
      window.location.href = '/void/dashboard';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UNKNOWN ERROR';
      if (message.includes('429') || message.includes('LOCKDOWN')) {
        setError('CONTAINMENT BREACH DETECTED — LOCKDOWN INITIATED');
      } else {
        setError('ACCESS DENIED — SEAL REJECTED');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
              fontSize: '0.65rem',
              color: 'rgba(140, 158, 130, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: '0.5rem',
            }}
          >
            {'> SYSTEM: CONTAINMENT ZONE v1.0'}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
              fontSize: '1rem',
              color: '#8c9e82',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              margin: 0,
            }}
          >
            {'> ENTER THE BINDING SEAL'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <TerminalInput
            label="BINDING SEAL"
            value={password}
            onChange={setPassword}
            type="password"
            disabled={isSubmitting}
          />

          {error && <StatusMessage message={error} variant="error" />}

          <div style={{ marginTop: '1.5rem' }}>
            <TerminalButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !password}
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'VERIFYING SEAL...' : 'SUBMIT SEAL'}
            </TerminalButton>
          </div>
        </form>

        {/* Footer */}
        <p
          style={{
            fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
            fontSize: '0.6rem',
            color: 'rgba(140, 158, 130, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginTop: '3rem',
            textAlign: 'center',
          }}
        >
          {'UNAUTHORIZED ACCESS IS FORBIDDEN'}
        </p>
      </div>
    </div>
  );
}
