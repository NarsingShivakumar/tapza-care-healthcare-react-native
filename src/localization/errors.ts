import type {TranslationKey} from './i18n';

export function apiErrorKey(error: unknown): TranslationKey {
  if (!error || typeof error !== 'object') return 'generalError';
  const obj = error as {status?: number | string; data?: unknown};
  const code = obj.status ?? (obj.data && typeof obj.data === 'object' ? (obj.data as {status?: number | string}).status : undefined);
  if (code === 409) return 'slotTakenError';
  if (code === 400) return 'invalidRequestError';
  if (code === 404) return 'noResultError';
  if (code === 503) return 'bookingFailureError';
  if (code === 'NETWORK_ERROR') return 'networkError';
  return 'generalError';
}
