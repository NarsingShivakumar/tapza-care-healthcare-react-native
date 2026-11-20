import type {Language} from '../features/settings/settingsSlice';
import type {LocalizedText} from '../domain/models';
import {en} from './en';
import {hi} from './hi';
import {te} from './te';

export type TranslationKey = keyof typeof en;
export type TranslationParams = Record<string, string | number>;

// TypeScript enforces complete coverage in English, Hindi and Telugu.
const dictionaries: Record<Language, Record<TranslationKey, string>> = {en, hi, te};
export function translate(language: Language, key: TranslationKey, params?: TranslationParams): string {
  const template = dictionaries[language][key] || en[key];
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => String(params?.[name] ?? match));
}

/** Plain strings from older APIs remain valid, while new content can provide all three languages. */
export function localizeText(value: LocalizedText | null | undefined, language: Language): string {
  if (typeof value === 'string') return value;
  return value?.[language] || value?.en || '';
}
