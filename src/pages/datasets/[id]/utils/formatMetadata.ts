import { formatRelativeTime } from './formatRelativeTime';

export function formatDatasetMetadata(
  company: string,
  country: string,
  rows: number,
  columns: number,
  uploadedAt: string | null
): string {
  const parts = [
    company,
    country,
    `${rows} Rows`,
    `${columns} Cols`,
  ];

  if (uploadedAt) {
    parts.push(`Uploaded ${formatRelativeTime(uploadedAt)}`);
  }

  return parts.join(' • ');
}

export function formatRowsColumns(rows: number, columns: number): string {
  return `${rows} rows • ${columns} columns`;
}
