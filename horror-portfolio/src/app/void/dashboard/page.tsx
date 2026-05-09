'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalButton } from '@/components/admin/TerminalButton';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { adminGetProjects, adminGetSocialLinks } from '@/lib/adminApi';
import type { ProjectAPI } from '@/types/project';
import type { SocialLinkAPI } from '@/types/socialLink';

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
};

function formatTimestamp(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min} UTC`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectAPI[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessTime] = useState(() => formatTimestamp(new Date()));

  useEffect(() => {
    async function loadStats() {
      try {
        const [p, s] = await Promise.all([
          adminGetProjects(),
          adminGetSocialLinks(),
        ]);
        setProjects(p);
        setSocialLinks(s);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'UNKNOWN ERROR';
        if (msg.includes('401') || msg.includes('403')) {
          router.push('/void/login');
        } else {
          setError('UNABLE TO RETRIEVE CONTAINMENT DATA');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [router]);

  function terminateSession() {
    document.cookie = 'cztoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    router.push('/void/login');
  }

  const statusBreakdown = {
    ACTIVE: projects.filter((p) => p.containment_status === 'ACTIVE').length,
    ARCHIVED: projects.filter((p) => p.containment_status === 'ARCHIVED').length,
    CLASSIFIED: projects.filter((p) => p.containment_status === 'CLASSIFIED').length,
  };

  return (
    <div style={{ ...MONO, padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(140, 158, 130, 0.2)',
          paddingBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <h1 style={{ ...MONO, fontSize: '0.9rem', color: '#8c9e82', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>
            {'> THE CONTAINMENT ZONE'}
          </h1>
          <p style={{ ...MONO, fontSize: '0.65rem', color: 'rgba(140, 158, 130, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            {`LAST ACCESS: ${accessTime}`}
          </p>
        </div>
        <TerminalButton variant="danger" onClick={terminateSession}>
          TERMINATE SESSION
        </TerminalButton>
      </div>

      {/* Stats */}
      {isLoading ? (
        <StatusMessage message="SCANNING CONTAINMENT DATABASE..." variant="loading" />
      ) : error ? (
        <StatusMessage message={error} variant="error" />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ border: '1px solid rgba(140, 158, 130, 0.2)', padding: '1rem' }}>
              <p style={{ ...MONO, fontSize: '0.65rem', color: 'rgba(140, 158, 130, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>
                TOTAL ANOMALIES
              </p>
              <p style={{ ...MONO, fontSize: '2rem', color: '#8c9e82', margin: 0, lineHeight: 1 }}>
                {projects.length}
              </p>
            </div>
            <div style={{ border: '1px solid rgba(140, 158, 130, 0.2)', padding: '1rem' }}>
              <p style={{ ...MONO, fontSize: '0.65rem', color: 'rgba(140, 158, 130, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>
                SIGNAL CHANNELS
              </p>
              <p style={{ ...MONO, fontSize: '2rem', color: '#8c9e82', margin: 0, lineHeight: 1 }}>
                {socialLinks.length}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ ...MONO, fontSize: '0.65rem', color: 'rgba(140, 158, 130, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              STATUS BREAKDOWN:
            </p>
            <p style={{ ...MONO, fontSize: '0.8rem', color: '#8c9e82' }}>
              {`ACTIVE: ${statusBreakdown.ACTIVE}  |  ARCHIVED: ${statusBreakdown.ARCHIVED}  |  CLASSIFIED: ${statusBreakdown.CLASSIFIED}`}
            </p>
          </div>
        </>
      )}

      {/* Navigation Panels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link href="/void/dashboard/projects" style={{ textDecoration: 'none' }}>
          <div
            style={{ border: '1px solid rgba(140, 158, 130, 0.3)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(140, 158, 130, 0.7)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(140, 158, 130, 0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(140, 158, 130, 0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <p style={{ ...MONO, fontSize: '0.8rem', color: '#8c9e82', margin: 0, textTransform: 'uppercase' }}>{'> ANOMALY RECORDS [PROJECTS]'}</p>
            <span style={{ color: 'rgba(140, 158, 130, 0.5)', fontSize: '0.8rem' }}>→</span>
          </div>
        </Link>

        <Link href="/void/dashboard/social-links" style={{ textDecoration: 'none' }}>
          <div
            style={{ border: '1px solid rgba(140, 158, 130, 0.3)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(140, 158, 130, 0.7)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(140, 158, 130, 0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(140, 158, 130, 0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <p style={{ ...MONO, fontSize: '0.8rem', color: '#8c9e82', margin: 0, textTransform: 'uppercase' }}>{'> SIGNAL CHANNELS [SOCIAL LINKS]'}</p>
            <span style={{ color: 'rgba(140, 158, 130, 0.5)', fontSize: '0.8rem' }}>→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
