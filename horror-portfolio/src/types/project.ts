import type { LucideIcon } from "lucide-react"

export interface ProjectAPI {
  id: string;
  title: string;
  tech_stack: string[];
  description: string;
  containment_status: 'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string
  name: string
  description: string
  icon: LucideIcon
  tags: string[]
}

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/**
 * Validates an unknown candidate and returns a typed Project if all constraints pass.
 * Throws a descriptive Error if any constraint is violated.
 */
export function validateProject(candidate: unknown): Project {
  if (typeof candidate !== "object" || candidate === null) {
    throw new Error("Project must be a non-null object")
  }

  const obj = candidate as Record<string, unknown>

  // Validate id: non-empty kebab-case string
  if (typeof obj.id !== "string" || obj.id.length === 0) {
    throw new Error("Project.id must be a non-empty string")
  }
  if (!KEBAB_CASE_REGEX.test(obj.id)) {
    throw new Error(
      `Project.id must be kebab-case (got "${obj.id}"). Expected format: lowercase letters, digits, and hyphens (e.g. "my-project-1")`
    )
  }

  // Validate name: non-empty string
  if (typeof obj.name !== "string" || obj.name.length === 0) {
    throw new Error("Project.name must be a non-empty string")
  }

  // Validate description: non-empty string, max 120 chars
  if (typeof obj.description !== "string" || obj.description.length === 0) {
    throw new Error("Project.description must be a non-empty string")
  }
  if (obj.description.length > 120) {
    throw new Error(
      `Project.description must be at most 120 characters (got ${obj.description.length})`
    )
  }

  // Validate icon: must be a React component.
  // Lucide icons in v0.400+ are forwardRef objects ({ render: Function }),
  // but plain function components are also valid.
  const isPlainComponent = typeof obj.icon === "function"
  const isForwardRefComponent =
    typeof obj.icon === "object" &&
    obj.icon !== null &&
    typeof (obj.icon as Record<string, unknown>).render === "function"
  if (!isPlainComponent && !isForwardRefComponent) {
    throw new Error(
      "Project.icon must be a valid Lucide icon component (a function or forwardRef object)"
    )
  }

  // Validate tags: non-empty array of non-empty strings
  if (!Array.isArray(obj.tags) || obj.tags.length === 0) {
    throw new Error("Project.tags must be a non-empty array")
  }
  for (let i = 0; i < obj.tags.length; i++) {
    if (typeof obj.tags[i] !== "string" || (obj.tags[i] as string).length === 0) {
      throw new Error(`Project.tags[${i}] must be a non-empty string`)
    }
  }

  return obj as unknown as Project
}
