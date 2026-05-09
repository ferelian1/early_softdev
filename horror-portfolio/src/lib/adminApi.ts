import type { ProjectAPI } from '@/types/project';
import type { SocialLinkAPI } from '@/types/socialLink';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ─── Helper ───────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  // In browser: read cztoken from document.cookie
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)cztoken=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
  return { 'Content-Type': 'application/json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function adminLogin(password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return handleResponse<{ access_token: string }>(res);
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function adminGetProjects(): Promise<ProjectAPI[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return handleResponse<ProjectAPI[]>(res);
}

export async function adminCreateProject(
  data: Omit<ProjectAPI, 'id' | 'created_at' | 'updated_at'>,
): Promise<ProjectAPI> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ProjectAPI>(res);
}

export async function adminUpdateProject(
  id: string,
  data: Partial<Omit<ProjectAPI, 'id' | 'created_at' | 'updated_at'>>,
): Promise<ProjectAPI> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ProjectAPI>(res);
}

export async function adminDeleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(res);
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export async function adminGetSocialLinks(): Promise<SocialLinkAPI[]> {
  const res = await fetch(`${API_BASE}/social-links`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return handleResponse<SocialLinkAPI[]>(res);
}

export async function adminCreateSocialLink(
  data: Omit<SocialLinkAPI, 'id' | 'created_at' | 'updated_at'>,
): Promise<SocialLinkAPI> {
  const res = await fetch(`${API_BASE}/social-links`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SocialLinkAPI>(res);
}

export async function adminUpdateSocialLink(
  id: string,
  data: Partial<Omit<SocialLinkAPI, 'id' | 'created_at' | 'updated_at'>>,
): Promise<SocialLinkAPI> {
  const res = await fetch(`${API_BASE}/social-links/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SocialLinkAPI>(res);
}

export async function adminDeleteSocialLink(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/social-links/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(res);
}
