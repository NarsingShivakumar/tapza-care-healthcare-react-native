import type {Language} from '../../../features/settings/settingsSlice';
import type {Prescription, Timing} from '../../../domain/models';
import {dateKey} from '../../../utils/date';
import {doseKey} from '../doseId';
import {translate} from '../../../localization/translations';

export const NOTIFICATION_PREFIX = 'tapza-care:dose:';
export const DEFAULT_REMINDER_TIMES: Record<Timing, {hour: number; minute: number}> = {
  morning: {hour: 8, minute: 0},
  afternoon: {hour: 13, minute: 0},
  night: {hour: 20, minute: 0},
};
/** Android allows 50 active timestamp triggers. Reserve some for tests/other features. */
export const MAX_PENDING_DOSE_NOTIFICATIONS = 45;

export type PlannedReminder = {
  id: string;
  doseId: string;
  at: number;
  title: string;
  body: string;
};

export function plannedReminderId(key: string): string {
  return `${NOTIFICATION_PREFIX}${encodeURIComponent(key)}`;
}

/** Builds one local, non-repeating notification per prescribed dose and date.
 * Never schedules an expired course, an already taken dose, or a past alarm.
 * Local Date constructors preserve wall-clock hour across DST changes.
 */
export function buildReminderPlan(
  prescriptions: readonly Prescription[], taken: Readonly<Record<string, boolean>>,
  language: Language, now: Date = new Date(),
): PlannedReminder[] {
  const candidates: PlannedReminder[] = [];
  for (const prescription of prescriptions) {
    const issued = new Date(prescription.issuedAt);
    if (!Number.isFinite(issued.getTime())) continue;
    const courseStart = new Date(issued.getFullYear(), issued.getMonth(), issued.getDate());
    for (const medicine of prescription.medicines) {
      const days = Number.isFinite(medicine.days) ? Math.min(Math.max(0, Math.floor(medicine.days)), 366) : 0;
      for (let offset = 0; offset < days; offset += 1) {
        const localDay = new Date(courseStart);
        localDay.setDate(courseStart.getDate() + offset);
        for (const timing of medicine.timing) {
          const time = DEFAULT_REMINDER_TIMES[timing];
          if (!time) continue;
          const at = new Date(localDay.getFullYear(), localDay.getMonth(), localDay.getDate(), time.hour, time.minute).getTime();
          if (at <= now.getTime() + 10_000) continue;
          const doseId = doseKey(prescription.id, medicine.id, timing, dateKey(localDay));
          if (taken[doseId]) continue;
          // A generic lock-screen message avoids exposing sensitive medicine names.
          candidates.push({
            id: plannedReminderId(doseId), doseId, at,
            title: translate(language, 'notificationTitle'),
            body: translate(language, 'notificationBody', {timing: translate(language, timing)}),
          });
        }
      }
    }
  }
  // Duplicate IDs should never result in multiple alarms, even with malformed API data.
  const seen = new Set<string>();
  return candidates.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id))
    .filter(item => {if (seen.has(item.id)) return false; seen.add(item.id); return true;})
    .slice(0, MAX_PENDING_DOSE_NOTIFICATIONS);
}
