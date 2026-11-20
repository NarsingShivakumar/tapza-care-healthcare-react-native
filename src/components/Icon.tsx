import React from 'react';
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, Bell, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, FileText, FlaskConical, Gift,
  Heart, HeartPulse, Home, MapPin, Pill, RefreshCcw, Settings2, ShieldCheck,
  Sparkles, Stethoscope, Sun, Syringe, UserRound, Users, WifiOff,
} from 'lucide-react-native';

const icons = {
  activity: Activity, back: ArrowLeft, arrow: ArrowRight, badge: BadgeCheck,
  bell: Bell, calendar: CalendarDays, check: Check, chevronDown: ChevronDown,
  chevronLeft: ChevronLeft, chevronRight: ChevronRight, clock: Clock3,
  file: FileText, flask: FlaskConical, gift: Gift, heart: Heart,
  heartPulse: HeartPulse, home: Home, pin: MapPin, pill: Pill,
  refresh: RefreshCcw, settings: Settings2, shield: ShieldCheck,
  sparkles: Sparkles, stethoscope: Stethoscope, sun: Sun, syringe: Syringe,
  user: UserRound, users: Users, offline: WifiOff,
} as const;
export type IconName = keyof typeof icons;
export function AppIcon({name, size = 22, color, strokeWidth = 1.9}: {name: string; size?: number; color: string; strokeWidth?: number}) {
  const Component = (icons as Record<string, typeof CircleHelp>)[name] ?? CircleHelp;
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
}
