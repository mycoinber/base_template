import { joinURL } from 'ufo';
import { resolveMediaPath } from '@core/utils/mediaPath';

type ProviderOptions = {
  baseURL?: string;
  modifiers?: Record<string, string | number | undefined>;
};

const stripMediaPrefix = (value: string) => value.replace(/^\/+/, '').replace(/^media\/?/, '');

export const getImage = (src: string, { modifiers = {}, baseURL = '/media' }: ProviderOptions = {}) => {
  const normalized = resolveMediaPath(src);
  if (!normalized) {
    return { url: '' };
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return { url: normalized };
  }

  if (!normalized.startsWith('/media/')) {
    return { url: normalized };
  }

  const path = stripMediaPrefix(normalized);
  const url = joinURL(baseURL, path);

  const params = new URLSearchParams();
  if (modifiers.width) params.set('w', String(modifiers.width));
  if (modifiers.height) params.set('h', String(modifiers.height));
  if (modifiers.quality) params.set('q', String(modifiers.quality));
  if (modifiers.format) params.set('f', String(modifiers.format));

  return { url: params.toString() ? `${url}?${params.toString()}` : url };
};

export const supportsAlias = true;
