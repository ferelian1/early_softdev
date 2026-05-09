'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { TerminalInput } from './TerminalInput';
import { TerminalButton } from './TerminalButton';
import { StatusMessage } from './StatusMessage';
import type { SocialLinkAPI } from '@/types/socialLink';

export interface CreateSocialLinkPayload {
  label: string;
  href: string;
  icon: SocialLinkAPI['icon'];
  handle: string;
  description?: string;
  order?: number;
}

const SOCIAL_ICONS: SocialLinkAPI['icon'][] = [
  'Github', 'Instagram', 'Twitter', 'Globe', 'Gamepad2', 'Mail', 'Linkedin', 'Youtube',
];

interface SocialLinkFormProps {
  mode: 'summon' | 'transmute';
  initialData?: SocialLinkAPI;
  onSubmit: (data: CreateSocialLinkPayload) => Promise<void>;
  onAbort: () => void;
  isSubmitting?: boolean;
  serverError?: string;
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

export function SocialLinkForm({
  mode,
  initialData,
  onSubmit,
  onAbort,
  isSubmitting = false,
  serverError,
}: SocialLinkFormProps) {
  const [label, setLabel] = useState(initialData?.label ?? '');
  const [href, setHref] = useState(initialData?.href ?? '');
  const [icon, setIcon] = useState<SocialLinkAPI['icon']>(initialData?.icon ?? 'Github');
  const [handle, setHandle] = useState(initialData?.handle ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!label.trim()) errors.label = 'LABEL IS REQUIRED';
    if (!handle.trim()) errors.handle = 'HANDLE IS REQUIRED';
    if (!href.trim()) {
      errors.href = 'HREF IS REQUIRED';
    } else if (!/^(https?:\/\/|mailto:)/.test(href)) {
      errors.href = 'HREF MUST START WITH https://, http://, OR mailto:';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    await onSubmit({
      label: label.trim(),
      href: href.trim(),
      icon,
      handle: handle.trim(),
      description: description.trim() || undefined,
    });
  }

  const isTransmute = mode === 'transmute';
  const submitLabel = isTransmute ? 'EXECUTE TRANSMUTATION' : 'EXECUTE SUMMONING';
  const headerLabel = isTransmute ? '> TRANSMUTE SIGNAL CHANNEL' : '> SUMMON NEW SIGNAL CHANNEL';

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
        <motion.div variants={itemVariants}>
          <TerminalInput
            label="LABEL"
            value={label}
            onChange={setLabel}
            type="text"
            disabled={isSubmitting}
            error={validationErrors.label}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TerminalInput
            label="HREF (https:// or mailto:)"
            value={href}
            onChange={setHref}
            type="text"
            disabled={isSubmitting}
            error={validationErrors.href}
          />
        </motion.div>

        {/* ICON dropdown */}
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
            {'> ICON'}
          </label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value as SocialLinkAPI['icon'])}
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
            {SOCIAL_ICONS.map((ic) => (
              <option key={ic} value={ic} style={{ background: '#10150F' }}>
                {ic}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={itemVariants}>
          <TerminalInput
            label="HANDLE"
            value={handle}
            onChange={setHandle}
            type="text"
            disabled={isSubmitting}
            error={validationErrors.handle}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TerminalInput
            label="DESCRIPTION (OPTIONAL)"
            value={description}
            onChange={setDescription}
            type="text"
            disabled={isSubmitting}
          />
        </motion.div>

        {serverError && (
          <motion.div variants={itemVariants}>
            <StatusMessage message={serverError} variant="error" />
          </motion.div>
        )}

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
