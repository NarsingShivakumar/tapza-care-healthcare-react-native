import type {Language} from '../features/settings/settingsSlice';

const locales: Record<Language, string> = {en: 'en-IN', hi: 'hi-IN', te: 'te-IN'};
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
export function weekDates(count = 7, language: Language = 'en'): {date: string; weekday: string; day: number; month: string}[] {
  return Array.from({length: count}, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() + i);
    return {date: dateKey(day), weekday: day.toLocaleDateString(locales[language], {weekday: 'short'}), day: day.getDate(), month: day.toLocaleDateString(locales[language], {month: 'short'})};
  });
}
export function formattedTime(iso: string, language: Language = 'en') {
  return new Date(iso).toLocaleTimeString(locales[language], {hour: 'numeric', minute: '2-digit', hour12: true});
}
export function formattedDate(iso: string, language: Language = 'en') {
  return new Date(iso).toLocaleDateString(locales[language], {day: 'numeric', month: 'short', year: 'numeric'});
}
export function money(inr: number, language: Language = 'en') { return `₹${inr.toLocaleString(locales[language])}`; }
export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  if (error && typeof error === 'object' && 'data' in error) return errorMessage(error.data);
  return 'Something went wrong. Please try again.';
}
