import {z} from 'zod';
import type {LayoutConfig} from '../domain/models';

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const hex = z.string().regex(HEX_PATTERN, 'Expected a six-digit hex colour');
const localizedTextSchema = z.union([z.string().min(1), z.object({en: z.string().min(1), hi: z.string().min(1).optional(), te: z.string().min(1).optional()})]);
const backgroundSchema = z.object({kind: z.enum(['color', 'gradient', 'image']), value: z.string().min(1)}).superRefine(({kind, value}, ctx) => {
  if (kind === 'color' && !HEX_PATTERN.test(value)) ctx.addIssue({code: 'custom', message: 'Invalid solid background colour'});
  if (kind === 'gradient' && (value.split('|').length < 2 || !value.split('|').every(part => HEX_PATTERN.test(part)))) ctx.addIssue({code: 'custom', message: 'Expected two or more hex gradient stops'});
  if (kind === 'image' && !/^https:\/\//.test(value)) ctx.addIssue({code: 'custom', message: 'Image backgrounds must use HTTPS'});
});
const font = z.object({caption: z.number().positive(), body: z.number().positive(), label: z.number().positive(), title: z.number().positive(), heading: z.number().positive(), hero: z.number().positive()});
const space = z.object({xs: z.number().nonnegative(), sm: z.number().nonnegative(), md: z.number().nonnegative(), lg: z.number().nonnegative(), xl: z.number().nonnegative(), xxl: z.number().nonnegative()});
const radius = z.object({sm: z.number().nonnegative(), md: z.number().nonnegative(), lg: z.number().nonnegative(), xl: z.number().nonnegative(), pill: z.number().nonnegative()});
const tokens = z.object({onPrimary: hex, border: hex, muted: hex, success: hex, danger: hex, warning: hex, overlay: z.string(), space, font, radius}).partial();
const theme = z.object({
  primary: hex, secondary: hex, background: hex, surface: hex,
  textPrimary: hex, textSecondary: hex, accent: hex,
  festival: z.object({name: localizedTextSchema, greeting: localizedTextSchema, bannerImageUrl: z.string()}).optional(),
  tokens: tokens.optional(),
});
export const layoutConfigSchema = z.object({
  version: z.number().int().nonnegative(),
  theme,
  tabs: z.array(z.object({id: z.string().min(1), label: localizedTextSchema, icon: z.string().min(1), screen: z.enum(['home', 'bookings', 'prescriptions', 'profile'])})).min(1),
  sections: z.array(z.object({
    id: z.string().min(1), type: z.string().min(1),
    background: backgroundSchema,
    title: localizedTextSchema.optional(), items: z.array(z.unknown()),
  })),
}).superRefine((data, ctx) => {
  for (const [label, values] of [
    ['tab IDs', data.tabs.map(tab => tab.id)],
    ['tab screens', data.tabs.map(tab => tab.screen)],
    ['section IDs', data.sections.map(section => section.id)],
  ] as const) {
    if (new Set(values).size !== values.length) ctx.addIssue({code: 'custom', message: `Duplicate ${label}`});
  }
});

/** Strict boundary: no unvalidated remote configuration reaches the UI. */
export function parseLayoutConfig(raw: unknown): LayoutConfig {
  return layoutConfigSchema.parse(raw) as LayoutConfig;
}
export function safeParseLayoutConfig(raw: unknown): LayoutConfig | null {
  const result = layoutConfigSchema.safeParse(raw);
  return result.success ? (result.data as LayoutConfig) : null;
}
