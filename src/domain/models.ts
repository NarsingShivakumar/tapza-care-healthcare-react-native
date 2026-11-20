import type {Language} from '../features/settings/settingsSlice';
export type LocalizedText = string | {en: string; hi?: string; te?: string};
export type LocalizedFields = Partial<Record<Language, string>>;
export type Timing = 'morning' | 'afternoon' | 'night';
export type TabScreen = 'home' | 'bookings' | 'prescriptions' | 'profile';
export type LayoutBackground = {kind: 'color' | 'gradient' | 'image'; value: string};
export type ThemePalette = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  festival?: {name: LocalizedText; greeting: LocalizedText; bannerImageUrl: string};
  tokens?: Partial<ThemeOverrides>;
};
export interface ThemeOverrides {
  onPrimary: string;
  border: string;
  muted: string;
  success: string;
  danger: string;
  warning: string;
  overlay: string;
  space: {xs: number; sm: number; md: number; lg: number; xl: number; xxl: number};
  font: {caption: number; body: number; label: number; title: number; heading: number; hero: number};
  radius: {sm: number; md: number; lg: number; xl: number; pill: number};
}
export interface LayoutSection {
  id: string;
  type: string;
  background: LayoutBackground;
  title?: LocalizedText;
  items: unknown[];
}
export interface LayoutConfig {
  version: number;
  theme: ThemePalette;
  tabs: {id: string; label: LocalizedText; icon: string; screen: TabScreen}[];
  sections: LayoutSection[];
}
export interface Doctor {
  id: string;
  name: string;
  nameI18n?: LocalizedFields;
  specialty: string;
  specialtyI18n?: LocalizedFields;
  nextAvailableAt?: string;
  photoUrl: string;
  feeInr: number;
  languages: string[];
  nextAvailableLabel?: string;
  experienceYears?: number;
}
export interface Slot {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
}
export interface Booking {
  id: string;
  doctorId: string;
  slotId: string;
  startsAt: string;
  status: 'confirmed';
  createdAt: string;
}
export interface Medicine {
  id: string;
  name: string;
  nameI18n?: LocalizedFields;
  dose: string;
  doseI18n?: LocalizedFields;
  days: number;
  timing: Timing[];
}
export interface Prescription {
  id: string;
  issuedAt: string;
  doctorName: string;
  doctorNameI18n?: LocalizedFields;
  clinicName: string;
  clinicNameI18n?: LocalizedFields;
  medicines: Medicine[];
}
export type BookingRequest = {doctorId: string; slotId: string};
export type ApiError = {status: number | 'NETWORK_ERROR' | 'PARSE_ERROR'; message: string};
export type MockSettings = {
  scene: 'normal' | 'festival';
  latencyMs: number;
  failConfig: boolean;
  failBooking: boolean;
  emptyDoctors: boolean;
  emptySlots: boolean;
  emptyPrescriptions: boolean;
};
