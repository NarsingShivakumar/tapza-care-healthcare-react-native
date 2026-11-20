import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import notifyKit, { AuthorizationStatus, AndroidImportance, TriggerType } from 'react-native-notify-kit';
import type { Language } from '../../settings/settingsSlice';
import type { PlannedReminder } from './reminderPlan';
import { NOTIFICATION_PREFIX } from './reminderPlan';
import { translate } from '../../../localization/translations';

export const REMINDER_ENABLED_KEY = '@tapza/notifications-enabled/v1';
const LOCALE_KEY = '@tapza/notifications-locale/v1';
const CHANNEL_ID = 'tapza-care-medicines-v2';
const TEST_NOTIFICATION_ID = 'tapza-care:test-reminder';

let operations: Promise<unknown> = Promise.resolve();
function serialized<T>(task: () => Promise<T>): Promise<T> {
  const next = operations.then(task, task);
  operations = next.catch(() => undefined);
  return next;
}

export async function notificationsAuthorized(): Promise<boolean> {
  const settings = await notifyKit.getNotificationSettings();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED || settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
}

/** Called ONLY from the user's explicit Enable reminders tap.
 * NotifyKit opens the Android 13+ POST_NOTIFICATIONS system dialog (iOS too).
 * On a previous denial the OS may not show the dialog again; settings remains available.
 */
export async function requestNotificationsPermission(): Promise<boolean> {
  if (await notificationsAuthorized()) return true;
  const settings = await notifyKit.requestPermission();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED || settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
}

export async function openSystemNotificationSettings(): Promise<void> {
  await notifyKit.openNotificationSettings();
}

async function ensureChannel(language: Language) {
  if (Platform.OS !== 'android') return;
  await notifyKit.createChannel({
    id: CHANNEL_ID, name: translate(language, 'notificationsHeading'),
    importance: AndroidImportance.HIGH,
  });
}

async function scheduleOne(item: PlannedReminder): Promise<void> {
  await notifyKit.createTriggerNotification({
    id: item.id, title: item.title, body: item.body,
    android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
    ios: { sound: 'default' },
  }, { type: TriggerType.TIMESTAMP, timestamp: item.at });
}

/** Reconcile only app-owned dose triggers, leaving every other app notification alone.
 * Runs off the rendering path and is serialized to prevent rapid state changes racing.
 */
export function syncDoseNotifications(plan: PlannedReminder[], enabled: boolean, language: Language): Promise<number> {
  return serialized(async () => {
    const currentIds = await notifyKit.getTriggerNotificationIds();
    const doseIds = currentIds.filter(id => id.startsWith(NOTIFICATION_PREFIX));
    const allowed = enabled && await notificationsAuthorized();
    if (!allowed) {
      for (const id of doseIds) await notifyKit.cancelTriggerNotification(id);
      if (!enabled) await notifyKit.cancelTriggerNotification(TEST_NOTIFICATION_ID);
      return 0;
    }
    await ensureChannel(language);
    const lastLocale = await AsyncStorage.getItem(LOCALE_KEY);
    const forceRefresh = lastLocale !== language;
    const wanted = new Set(plan.map(item => item.id));
    for (const id of doseIds) {
      if (!wanted.has(id) || forceRefresh) await notifyKit.cancelTriggerNotification(id);
    }
    const existing = forceRefresh ? new Set<string>() : new Set(doseIds);
    for (const item of plan) {
      if (!existing.has(item.id)) await scheduleOne(item);
    }
    await AsyncStorage.setItem(LOCALE_KEY, language);
    return plan.length;
  });
}

/** Test delivery after 15 seconds without waiting until the next medicine window. */
export function scheduleTestNotification(language: Language): Promise<void> {
  return serialized(async () => {
    if (!(await notificationsAuthorized())) throw new Error('PERMISSION_DENIED');
    await ensureChannel(language);
    await notifyKit.createTriggerNotification({
      id: TEST_NOTIFICATION_ID,
      title: translate(language, 'notificationTitle'),
      body: translate(language, 'testNotificationBody'),
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      ios: { sound: 'default' },
    }, { type: TriggerType.TIMESTAMP, timestamp: Date.now() + 15_000 });
  });
}
