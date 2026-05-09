import type { ProjectAPI } from '@/types/project';
import type { SocialLinkAPI } from '@/types/socialLink';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const TIMEOUT_MS = 3000;

// ─── Fallback data (identical to current hardcoded data) ─────────────────────

export const FALLBACK_PROJECTS: ProjectAPI[] = [
  {
    id: 'silent-gateway',
    title: 'THE SILENT GATEWAY',
    tech_stack: ['Node.js', 'gRPC', 'Redis', 'Kubernetes'],
    description:
      'A high-throughput gRPC gateway routing requests across distributed microservices with zero-downtime deploys.',
    containment_status: 'ACTIVE',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'infernal-pipeline',
    title: 'INFERNAL PIPELINE',
    tech_stack: ['Kafka', 'Go', 'PostgreSQL', 'Docker'],
    description:
      'An event-driven data pipeline consuming millions of Kafka messages per hour with exactly-once semantics.',
    containment_status: 'ACTIVE',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'void-observer',
    title: 'VOID OBSERVER',
    tech_stack: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Rust'],
    description:
      'A real-time observability platform aggregating traces, metrics, and logs into a unified dark dashboard.',
    containment_status: 'ACTIVE',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
];

export const FALLBACK_SOCIAL_LINKS: SocialLinkAPI[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/ferelian',
    icon: 'Github',
    handle: '@ferelian',
    description: 'Open source & personal projects',
    order: 0,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'itchio',
    label: 'Itch.io',
    href: 'https://ferelian.itch.io',
    icon: 'Gamepad2',
    handle: 'ferelian.itch.io',
    description: 'Game releases & experiments',
    order: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/ferelian',
    icon: 'Instagram',
    handle: '@ferelian',
    description: 'Visual work & behind the scenes',
    order: 2,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'twitter',
    label: 'Twitter',
    href: 'https://twitter.com/ferelian',
    icon: 'Twitter',
    handle: '@ferelian',
    description: 'Thoughts & updates',
    order: 3,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'website',
    label: 'Website',
    href: 'https://ferelian.dev',
    icon: 'Globe',
    handle: 'ferelian.dev',
    description: 'Full portfolio & writing',
    order: 4,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:hello@ferelian.dev',
    icon: 'Mail',
    handle: 'hello@ferelian.dev',
    description: 'Get in touch',
    order: 5,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
];

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<ProjectAPI[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${API_BASE}/projects`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ProjectAPI[];
    // Only show ACTIVE projects on the public portfolio
    return data.filter((p) => p.containment_status === 'ACTIVE');
  } catch {
    console.warn('[api] fetchProjects failed, using fallback');
    return FALLBACK_PROJECTS;
  }
}

export async function fetchSocialLinks(): Promise<SocialLinkAPI[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${API_BASE}/social-links`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SocialLinkAPI[];
  } catch {
    console.warn('[api] fetchSocialLinks failed, using fallback');
    return FALLBACK_SOCIAL_LINKS;
  }
}
