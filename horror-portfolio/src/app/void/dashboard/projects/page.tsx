'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalTable } from '@/components/admin/TerminalTable';
import { TerminalButton } from '@/components/admin/TerminalButton';
import { TerminalDialog } from '@/components/admin/TerminalDialog';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { ProjectForm, type CreateProjectPayload } from '@/components/admin/ProjectForm';
import {
  adminGetProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
} from '@/lib/adminApi';
import type { ProjectAPI } from '@/types/project';

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
};

type PanelMode = 'list' | 'summon' | 'transmute';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('list');
  const [editingProject, setEditingProject] = useState<ProjectAPI | null>(null);
  const [banishTarget, setBanishTarget] = useState<ProjectAPI | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBanishing, setIsBanishing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [banishError, setBanishError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await adminGetProjects();
      setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'UNKNOWN ERROR';
      if (msg.includes('401') || msg.includes('403')) {
        router.push('/void/login');
      } else {
        setFetchError('CONTAINMENT BREACH — UNABLE TO RETRIEVE RECORDS');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  async function handleSummon(data: CreateProjectPayload) {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await adminCreateProject(data);
      await loadProjects();
      setPanelMode('list');
      setSuccessMessage('ENTITY SUMMONED SUCCESSFULLY');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'SUMMONING FAILED');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTransmute(data: CreateProjectPayload) {
    if (!editingProject) return;
    setIsSubmitting(true);
    setServerError(null);
    try {
      await adminUpdateProject(editingProject.id, data);
      await loadProjects();
      setPanelMode('list');
      setEditingProject(null);
      setSuccessMessage('ENTITY TRANSMUTED SUCCESSFULLY');
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
      await adminDeleteProject(banishTarget.id);
      await loadProjects();
      setBanishTarget(null);
      setSuccessMessage('ENTITY BANISHED TO THE VOID');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setBanishError(err instanceof Error ? err.message : 'BANISHMENT FAILED');
    } finally {
      setIsBanishing(false);
    }
  }

  const columns = [
    { key: 'title', header: 'TITLE' },
    { key: 'tech_stack', header: 'TECH_STACK', render: (row: ProjectAPI) => (row.tech_stack as string[]).join(', ') },
    { key: 'containment_status', header: 'STATUS' },
    {
      key: 'actions',
      header: 'ACTIONS',
      render: (row: ProjectAPI) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <TerminalButton variant="primary" onClick={() => { setEditingProject(row); setServerError(null); setPanelMode('transmute'); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
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
            {'> ANOMALY RECORDS [PROJECTS]'}
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
        <ProjectForm mode="summon" onSubmit={handleSummon} onAbort={() => { setPanelMode('list'); setServerError(null); }} isSubmitting={isSubmitting} serverError={serverError ?? undefined} />
      )}
      {panelMode === 'transmute' && editingProject && (
        <ProjectForm mode="transmute" initialData={editingProject} onSubmit={handleTransmute} onAbort={() => { setPanelMode('list'); setEditingProject(null); setServerError(null); }} isSubmitting={isSubmitting} serverError={serverError ?? undefined} />
      )}

      {panelMode === 'list' && (
        <TerminalTable columns={columns as Parameters<typeof TerminalTable>[0]['columns']} data={projects as Record<string, unknown>[]} isLoading={isLoading} loadingText="SCANNING ANOMALY DATABASE..." emptyText="NO ANOMALIES CONTAINED" errorText={fetchError ?? undefined} />
      )}

      {banishTarget && (
        <TerminalDialog entityName={banishTarget.title} onConfirm={handleBanish} onCancel={() => { setBanishTarget(null); setBanishError(null); }} isConfirming={isBanishing} error={banishError ?? undefined} />
      )}
    </div>
  );
}
