'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalTable } from '@/components/admin/TerminalTable';
import { TerminalButton } from '@/components/admin/TerminalButton';
import { TerminalDialog } from '@/components/admin/TerminalDialog';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { SocialLinkForm, type CreateSocialLinkPayload } from '@/components/admin/SocialLinkForm';
import {
  adminGetSocialLinks,
  adminCreateSocialLink,
  adminUpdateSocialLink,
  adminDeleteSocialLink,
} from '@/lib/adminApi';
import type { SocialLinkAPI } from '@/types/socialLink';

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
};

type PanelMode = 'list' | 'summon' | 'transmute';

export default function SocialLinksPage() {
  const router = useRouter();
  const [socialLinks, setSocialLinks] = useState<SocialLinkAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('list');
  const [editingLink, setEditingLink] = useState<SocialLinkAPI | null>(null);
  const [banishTarget, setBanishTarget] = useState<SocialLinkAPI | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBanishing, setIsBanishing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [banishError, setBanishError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSocialLinks = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await adminGetSocialLinks();
      setSocialLinks(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'UNKNOWN ERROR';
      if (msg.includes('401') || msg.includes('403')) {
        router.push('/void/login');
      } else {
        setFetchError('SIGNAL INTERFERENCE — UNABLE TO RETRIEVE CHANNELS');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { loadSocialLinks(); }, [loadSocialLinks]);

  async function handleSummon(data: CreateSocialLinkPayload) {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await adminCreateSocialLink({ ...data, description: data.description ?? '', order: data.order ?? 0 });
      await loadSocialLinks();
      setPanelMode('list');
      setSuccessMessage('CHANNEL SUMMONED SUCCESSFULLY');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'SUMMONING FAILED');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTransmute(data: CreateSocialLinkPayload) {
    if (!editingLink) return;
    setIsSubmitting(true);
    setServerError(null);
    try {
      await adminUpdateSocialLink(editingLink.id, data);
      await loadSocialLinks();
      setPanelMode('list');
      setEditingLink(null);
      setSuccessMessage('CHANNEL TRANSMUTED SUCCESSFULLY');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'TRANSMUTATION FAILED');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBanish() {
    if (!banishTarget) return;
    setIsBanishing(true);
    setBanishError(null);
    try {
      await adminDeleteSocialLink(banishTarget.id);
      await loadSocialLinks();
      setBanishTarget(null);
      setSuccessMessage('CHANNEL BANISHED TO THE VOID');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setBanishError(err instanceof Error ? err.message : 'BANISHMENT FAILED');
    } finally {
      setIsBanishing(false);
    }
  }

  const columns = [
    { key: 'label', header: 'LABEL' },
    { key: 'handle', header: 'HANDLE' },
    { key: 'href', header: 'HREF' },
    { key: 'icon', header: 'ICON' },
    {
      key: 'actions',
      header: 'ACTIONS',
      render: (row: SocialLinkAPI) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <TerminalButton variant="primary" onClick={() => { setEditingLink(row); setServerError(null); setPanelMode('transmute'); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
            TRANSMUTE
          </TerminalButton>
          <TerminalButton variant="danger" onClick={() => { setBanishTarget(row); setBanishError(null); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
            BANISH
          </TerminalButton>
        </div>
      ),
    },
  ];

  return (
    <div style={{ ...MONO, padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(140, 158, 130, 0.2)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <Link href="/void/dashboard" style={{ ...MONO, fontSize: '0.65rem', color: 'rgba(140, 158, 130, 0.5)', textDecoration: 'none' }}>
            {'← CONTAINMENT ZONE'}
          </Link>
          <h1 style={{ ...MONO, fontSize: '0.9rem', color: '#8c9e82', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0.25rem 0 0' }}>
            {'> SIGNAL CHANNELS [SOCIAL LINKS]'}
          </h1>
        </div>
        {panelMode === 'list' && (
          <TerminalButton variant="primary" onClick={() => { setServerError(null); setPanelMode('summon'); }}>
            SUMMON NEW RECORD
          </TerminalButton>
        )}
      </div>

      {successMessage && <StatusMessage message={successMessage} variant="success" />}

      {panelMode === 'summon' && (
        <SocialLinkForm mode="summon" onSubmit={handleSummon} onAbort={() => { setPanelMode('list'); setServerError(null); }} isSubmitting={isSubmitting} serverError={serverError ?? undefined} />
      )}
      {panelMode === 'transmute' && editingLink && (
        <SocialLinkForm mode="transmute" initialData={editingLink} onSubmit={handleTransmute} onAbort={() => { setPanelMode('list'); setEditingLink(null); setServerError(null); }} isSubmitting={isSubmitting} serverError={serverError ?? undefined} />
      )}

      {panelMode === 'list' && (
        <TerminalTable columns={columns as Parameters<typeof TerminalTable>[0]['columns']} data={socialLinks as unknown as Record<string, unknown>[]} isLoading={isLoading} loadingText="SCANNING SIGNAL DATABASE..." emptyText="NO SIGNAL CHANNELS DETECTED" errorText={fetchError ?? undefined} />
      )}

      {banishTarget && (
        <TerminalDialog entityName={banishTarget.label} onConfirm={handleBanish} onCancel={() => { setBanishTarget(null); setBanishError(null); }} isConfirming={isBanishing} error={banishError ?? undefined} />
      )}
    </div>
  );
}
