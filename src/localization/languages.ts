import type {Language} from '../features/settings/settingsSlice';

// Autonyms intentionally stay in their own writing systems regardless of selection.
export const LANGUAGE_OPTIONS: ReadonlyArray<{id: Language; label: string}> = [
  {id: 'en', label: 'English'},
  {id: 'hi', label: 'हिन्दी'},
  {id: 'te', label: 'తెలుగు'},
];
