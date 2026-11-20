import type {Language} from '../features/settings/settingsSlice';
import {localizeText} from '../localization/translations';
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function stringValue(obj: Record<string, unknown>, key: string, fallback = ''): string {
  return typeof obj[key] === 'string' ? obj[key] as string : fallback;
}
export function numberValue(obj: Record<string, unknown>, key: string, fallback = 0): number {
  return typeof obj[key] === 'number' && Number.isFinite(obj[key]) ? obj[key] as number : fallback;
}

/** Safely reads localized CMS fields while keeping IDs, icons and URLs independent. */
export function localizedValue(obj: Record<string, unknown>, key: string, language: Language, fallback = ''): string {
  const raw = obj[key];
  if (typeof raw === 'string') return raw;
  if (isRecord(raw) && typeof raw.en === 'string') {
    return localizeText(raw as {en: string; hi?: string; te?: string}, language);
  }
  return fallback;
}
