import type {ThemeOverrides, ThemePalette} from '../domain/models';

const defaults: ThemeOverrides = {
  onPrimary: '#FFFFFF', border: '#DCE6E3', muted: '#EFF4F1',
  success: '#087F62', danger: '#C24141', warning: '#B57423', overlay: '#102D2D88',
  space: {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32},
  font: {caption: 12, body: 15, label: 14, title: 19, heading: 24, hero: 32},
  radius: {sm: 8, md: 12, lg: 18, xl: 24, pill: 100},
};
export interface AppTheme extends Omit<ThemePalette, 'tokens'>, ThemeOverrides {}
export function buildTheme(input: ThemePalette): AppTheme {
  return {
    ...input,
    onPrimary: input.tokens?.onPrimary ?? defaults.onPrimary,
    border: input.tokens?.border ?? defaults.border,
    muted: input.tokens?.muted ?? defaults.muted,
    success: input.tokens?.success ?? defaults.success,
    danger: input.tokens?.danger ?? defaults.danger,
    warning: input.tokens?.warning ?? defaults.warning,
    overlay: input.tokens?.overlay ?? defaults.overlay,
    space: {...defaults.space, ...input.tokens?.space},
    font: {...defaults.font, ...input.tokens?.font},
    radius: {...defaults.radius, ...input.tokens?.radius},
  };
}
