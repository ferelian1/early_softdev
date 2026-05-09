import type { Metadata } from 'next';
import { ScanLine } from '@/components/admin/ScanLine';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function VoidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen font-mono"
      style={{
        backgroundColor: '#10150F',
        color: '#8c9e82',
        fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
      }}
    >
      {/* Film grain overlay */}
      <div className="noise-bg" />
      {/* Animated scan-line */}
      <ScanLine />
      {children}
    </div>
  );
}
