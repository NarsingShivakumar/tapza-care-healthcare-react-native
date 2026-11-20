import {dateKey, formattedDate, formattedTime} from '../utils/date';
import type {Language} from '../features/settings/settingsSlice';
import {translate, type TranslationKey, type TranslationParams} from './translations';

export function availabilityLabel(iso: string | undefined, language: Language,
  t: (key: TranslationKey, params?: TranslationParams) => string = (key, params) => translate(language, key, params)) {
  if (!iso) return t('checkAvailability');
  const day = dateKey(new Date(iso));
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const date = day === dateKey(now) ? t('today') : day === dateKey(tomorrow) ? t('tomorrow') : formattedDate(iso, language);
  return `${date} · ${formattedTime(iso, language)}`;
}
