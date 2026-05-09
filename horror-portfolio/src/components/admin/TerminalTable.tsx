interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TerminalTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  errorText?: string;
}

const cellStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid rgba(140, 158, 130, 0.1)',
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
  fontSize: '0.8rem',
  color: '#8c9e82',
  textAlign: 'left',
  verticalAlign: 'middle',
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '0.7rem',
  color: 'rgba(140, 158, 130, 0.6)',
  borderBottom: '1px solid rgba(140, 158, 130, 0.3)',
  paddingBottom: '0.75rem',
};

export function TerminalTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  loadingText = 'LOADING...',
  emptyText = 'NO RECORDS FOUND',
  errorText,
}: TerminalTableProps<T>) {
  if (isLoading) {
    return (
      <p style={{ ...cellStyle, padding: '1rem 0' }}>
        {'> '}{loadingText}
      </p>
    );
  }

  if (errorText) {
    return (
      <p style={{ ...cellStyle, padding: '1rem 0', color: 'rgba(255, 80, 80, 0.9)' }}>
        {'> '}{errorText}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p style={{ ...cellStyle, padding: '1rem 0', color: 'rgba(140, 158, 130, 0.5)' }}>
        {'> '}{emptyText}
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={headerCellStyle}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background =
                  'rgba(140, 158, 130, 0.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background =
                  'transparent';
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={cellStyle}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
