import normal from '../data/normal.json';
import festival from '../data/festival.json';
import {parseLayoutConfig, safeParseLayoutConfig} from '../config/schema';

describe('remote layout contract', () => {
  it('accepts both shipped configurations', () => {
    expect(parseLayoutConfig(normal).version).toBe(1);
    expect(parseLayoutConfig(festival).theme.festival?.name).toEqual({en: 'Diwali Care Days', hi: 'दिवाली केयर डेज़', te: 'దీపావళి కేర్ డేస్'});
  });
  it('rejects malformed theme values instead of breaking the renderer', () => {
    const broken = {...normal, theme: {...normal.theme, primary: 'red'}};
    expect(safeParseLayoutConfig(broken)).toBeNull();
  });
  it('rejects malformed gradient backgrounds', () => {
    const broken = {...normal, sections: [{...normal.sections[0], background: {kind: 'gradient', value: 'invalid|#FFFFFF'}}]};
    expect(safeParseLayoutConfig(broken)).toBeNull();
  });
  it('rejects duplicate section IDs', () => {
    const repeated = {...normal, sections: [normal.sections[0], normal.sections[0]]};
    expect(safeParseLayoutConfig(repeated)).toBeNull();
  });
  it('accepts future/unknown sections so they can be safely skipped', () => {
    expect(parseLayoutConfig(festival).sections.some(item => item.type.startsWith('future_'))).toBe(true);
  });
});
