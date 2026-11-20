import {useCallback} from 'react';
import {useAppSelector} from '../app/hooks';
import type {Language} from '../features/settings/settingsSlice';
import type {LocalizedText} from '../domain/models';
import {translate, localizeText, type TranslationKey, type TranslationParams} from './translations';

export {translate, localizeText};
export type {TranslationKey, TranslationParams};
export function useLanguage(): Language { return useAppSelector(state => state.settings.language); }
export function useT() {
  const language = useLanguage();
  return useCallback((key: TranslationKey, params?: TranslationParams) => translate(language, key, params), [language]);
}
export function useLocalizedText() {
  const language = useLanguage();
  return useCallback((value: LocalizedText | null | undefined) => localizeText(value, language), [language]);
}
