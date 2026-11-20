import normal from '../data/normal.json';
import festival from '../data/festival.json';
import {en} from '../localization/en';
import {hi} from '../localization/hi';
import {te} from '../localization/te';
import {localizeText, translate} from '../localization/translations';

const languages = ['en', 'hi', 'te'] as const;

describe('full-app localization', () => {
  it('has identical keys in the three app-owned resource files', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(te).sort()).toEqual(Object.keys(en).sort());
  });

  it('switches UI labels and interpolates numbers', () => {
    expect(translate('hi', 'chooseDoctor')).toBe('डॉक्टर चुनें');
    expect(translate('te', 'chooseDoctor')).toBe('వైద్యుడిని ఎంచుకోండి');
    expect(translate('te', 'dosesTakenToday', {done: 2, total: 4})).toContain('2');
    expect(translate('en', 'medicineCount', {count: 3})).toBe('3 medicines');
  });

  it('localizes every display field shipped in both remote configs', () => {
    for (const config of [normal, festival]) {
      const fields: unknown[] = [...config.tabs.map(tab => tab.label)];
      if ('festival' in config.theme && config.theme.festival) fields.push(config.theme.festival.name, config.theme.festival.greeting);
      for (const section of config.sections) {
        if (section.title) fields.push(section.title);
        for (const item of section.items) {
          if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
          for (const key of ['eyebrow', 'greeting', 'subtitle', 'cta', 'label', 'name', 'badge', 'message'] as const) {
            if (key in item) fields.push(item[key as keyof typeof item]);
          }
        }
      }
      for (const value of fields) {
        expect(value).toHaveProperty('en');
        for (const language of languages) expect(localizeText(value as {en: string; hi: string; te: string}, language).length).toBeGreaterThan(0);
      }
    }
  });

  it('falls back to English for older server responses or missing translations', () => {
    expect(localizeText({en: 'Doctor consultation'}, 'hi')).toBe('Doctor consultation');
    expect(localizeText('Existing server label', 'te')).toBe('Existing server label');
  });
});
