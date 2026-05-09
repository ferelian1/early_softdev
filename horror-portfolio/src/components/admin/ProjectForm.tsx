'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { TerminalInput } from './TerminalInput';
import { TerminalButton } from './TerminalButton';
import { StatusMessage } from './StatusMessage';
import type { ProjectAPI } from '@/types/project';

export interface CreateProjectPayload {
  title: string;
  tech_stack: string[];
  description: string;
  containment_status: 'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED';
}

interface ProjectFormProps {
  mode: 'summon' | 'transmute';
  initialData?: ProjectAPI;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
  onAbort: () => void;
  isSubmitting?: boolean;
  serverError?: string;
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

export function ProjectForm({
  mode,
  initialData,
  onSubmit,
  onAbort,
  isSubmitting = false,
  serverError,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [techStack, setTechStack] = useState(
    initialData?.tech_stack?.join(', ') ?? '',
  );
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [containmentStatus, setContainmentStatus] = useState<
    'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED'
  >(initialData?.containment_status ?? 'ACTIVE');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'TITLE IS REQUIRED';
    if (!description.trim()) errors.description = 'DESCRIPTION IS REQUIRED';
    if (description.length > 120) errors.description = 'DESCRIPTION EXCEEDS 120 CHARACTERS';
    const tags = techStack.split(',').map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) errors.tech_stack = 'AT LEAST ONE TECH STACK ENTRY IS REQUIRED';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    const tags = techStack.split(',').map((t) => t.trim()).filter(Boolean);
    await onSubmit({
      title: title.trim(),
      tech_stack: tags,
      description: description.trim(),
      containment_status: containmentStatus,
    });
  }

  const isTransmute = mode === 'transmute';
  const submitLabel = isTransmute ? 'EXECUTE TRANSMUTATION' : 'EXECUTE SUMMONING';
  const headerLabel = isTransmute ? '> TRANSMUTE ANOMALY RECORD' : '> SUMMON NEW ANOMALY RECORD';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        border: '1px solid rgba(140, 158, 130, 0.3)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        backgroundColor: 'rgba(16, 21, 15, 0.8)',
      }}
    >
      {/* Header */}
      <motion.p
        variants={itemVariants}
        style={{
          ...MONO,
          fontSize: '0.8rem',
          color: '#8c9e82',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(140, 158, 130, 0.2)',
          paddingBottom: '0.75rem',
        }}
      >
        {headerLabel}
      </motion.p>

      <form onSubmit={handleSubmit}>
        {/* TITLE */}
        <motion.div variants={itemVariants}>
          <TerminalInput
            label="TITLE"
            value={title}
            onChange={setTitle}
            type="text"
            disabled={isSubmitting}
            error={validationErrors.title}
          />
        </motion.div>

        {/* TECH_STACK */}
        <motion.div variants={itemVariants}>
          <TerminalInput
            label="TECH_STACK (SEPARATE WITH COMMAS)"
            value={techStack}
            onChange={setTechStack}
            type="text"
            disabled={isSubmitting}
            error={validationErrors.tech_stack}
          />
        </motion.div>

        {/* DESCRIPTION */}
        <motion.div variants={itemVariants}>
          <TerminalInput
            label={`DESCRIPTION (${description.length}/120 CHARS)`}
            value={description}
            onChange={setDescription}
            type="textarea"
            disabled={isSubmitting}
            error={validationErrors.description}
          />
        </motion.div>

        {/* CONTAINMENT_STATUS */}
        <motion.div variants={itemVariants} style={{ marginBottom: '1rem' }}>
          <label
            style={{
              ...MONO,
              display: 'block',
              fontSize: '0.75rem',
              color: '#8c9e82',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.375rem',
            }}
          >
            {'> CONTAINMENT_STATUS'}
          </label>
          <select
            value={containmentStatus}
            onChange={(e) =>
              setContainmentStatus(e.target.value as 'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED')
            }
            disabled={isSubmitting}
            style={{
              ...MONO,
              background: 'transparent',
              border: '1px solid rgba(140, 158, 130, 0.3)',
              color: '#8c9e82',
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
              width: '100%',
              outline: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="ACTIVE" style={{ background: '#10150F' }}>ACTIVE</option>
            <option value="ARCHIVED" style={{ background: '#10150F' }}>ARCHIVED</option>
            <option value="CLASSIFIED" style={{ background: '#10150F' }}>CLASSIFIED</option>
          </select>
        </motion.div>

        {/* Server error */}
        {serverError && (
          <motion.div variants={itemVariants}>
            <StatusMessage message={serverError} variant="error" />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}
        >
          <TerminalButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'PROCESSING...' : submitLabel}
          </TerminalButton>
          <TerminalButton
            type="button"
            variant="danger"
            onClick={onAbort}
            disabled={isSubmitting}
          >
            ABORT RITUAL
          </TerminalButton>
        </motion.div>
      </form>
    </motion.div>
  );
}
