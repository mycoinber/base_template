export const resolveMediaPath = (raw?: string | null) => {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/siteid/')) return raw;
  if (raw.startsWith('/media/')) return raw;
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `/media${normalized}`;
};

export const mediaProvider = (src?: string | null) => {
  if (!src) return undefined;
  if (typeof src === 'string' && (src.startsWith('/siteid/') || src.startsWith('/media/'))) {
    return 'none';
  }
  return undefined;
};
