export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

export const getInitials = (fullName: string): string =>
  fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

export const hashColor = (str: string, palette: string[]): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};
