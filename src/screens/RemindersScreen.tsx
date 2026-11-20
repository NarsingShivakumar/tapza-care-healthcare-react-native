import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector, useTheme } from '../app/hooks';
import { AppIcon } from '../components/Icon';
import { DoseSchedule } from '../components/DoseSchedule';
import { AppText, BackHeader, EmptyState, ErrorNotice, PrimaryButton, Shimmer, Surface } from '../components/UI';
import { groupDoses } from '../features/reminders/schedule';
import { doseKey } from '../features/reminders/doseSlice';
import { notificationsEnabledChanged } from '../features/reminders/reminderPreferencesSlice';
import {
  openSystemNotificationSettings, REMINDER_ENABLED_KEY,
  requestNotificationsPermission, scheduleTestNotification,
} from '../features/reminders/notifications/notificationService';
import type { RootRoutes } from '../navigation/types';
import { useGetPrescriptionsQuery } from '../services/api';
import { dateKey, formattedDate } from '../utils/date';
import { useLanguage, useT } from '../localization/i18n';

export function RemindersScreen({ navigation }: NativeStackScreenProps<RootRoutes, 'Reminders'>) {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useGetPrescriptionsQuery();
  const taken = useAppSelector(state => state.doses.taken);
  const { enabled, status, scheduledCount } = useAppSelector(state => state.reminderPreferences);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState<'permission' | 'failed' | 'test' | null>(null);
  const groups = groupDoses(data ?? [], true);
  const doses = Object.values(groups).flat();
  const today = dateKey(new Date());
  const completed = doses.filter(dose => taken[doseKey(dose.prescriptionId, dose.medicine.id, dose.timing, today)]).length;

  const changeNotifications = async () => {
    if (working) return;
    setWorking(true); setFeedback(null);
    try {
      if (!enabled && !(await requestNotificationsPermission())) {
        setFeedback('permission');
        return;
      }
      await AsyncStorage.setItem(REMINDER_ENABLED_KEY, String(!enabled));
      dispatch(notificationsEnabledChanged(!enabled));
    } catch {
      setFeedback('failed');
    } finally { setWorking(false); }
  };

  const sendTest = async () => {
    if (working) return;
    setWorking(true); setFeedback(null);
    try { await scheduleTestNotification(language); setFeedback('test'); }
    catch (error) { setFeedback(error instanceof Error && error.message === 'PERMISSION_DENIED' ? 'permission' : 'failed'); }
    finally { setWorking(false); }
  };

  const blocked = status === 'blocked' || feedback === 'permission';
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
    <BackHeader title={t('medicineReminders')} subtitle={formattedDate(new Date().toISOString(), language)} onBack={navigation.goBack} />
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.xl, paddingBottom: theme.space.xxl }}>
      <Surface style={{ backgroundColor: theme.muted, flexDirection: 'row', alignItems: 'center', gap: theme.space.lg }}>
        <View style={{ height: 73, width: 73, borderRadius: 37, borderWidth: 6, borderColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}><AppText weight="bold" size="title" color={theme.primary}>{doses.length ? Math.round(completed / doses.length * 100) : 0}%</AppText></View>
        <View style={{ flex: 1, gap: theme.space.xs }}><AppText size="title" weight="bold">{t('stayOnTrack')}</AppText><AppText color={theme.textSecondary}>{t('dosesTakenToday', { done: completed, total: doses.length })}</AppText></View>
      </Surface>

      <Surface style={{ gap: theme.space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
          <View style={{ width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="bell" color={theme.primary} size={25} /></View>
          <View style={{ flex: 1, gap: theme.space.xs }}>
            <AppText size="label" weight="bold">{t('notificationsHeading')}</AppText>
            <AppText size="caption" color={theme.textSecondary}>{t('notificationScheduleTimes')}</AppText>
          </View>
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: enabled, disabled: working }}
            accessibilityLabel={t('notificationsHeading')} onPress={() => void changeNotifications()} disabled={working}
            style={{ minWidth: 68, minHeight: 44, backgroundColor: enabled ? theme.success : theme.muted, borderWidth: 1, borderColor: enabled ? theme.success : theme.border, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.space.sm }}>
            <AppText weight="bold" size="caption" color={enabled ? theme.onPrimary : theme.textPrimary}>{working ? t('notificationWorking') : enabled ? t('notificationOn') : t('notificationOff')}</AppText>
          </Pressable>
        </View>
        {enabled && <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}>
          <AppIcon name="badge" color={status === 'ready' ? theme.success : theme.textSecondary} size={17} />
          <AppText size="caption" color={theme.textSecondary} style={{ flex: 1 }}>{status === 'working' ? t('notificationWorking') : status === 'ready' ? t('notificationsScheduledCount', { count: scheduledCount }) : status === 'blocked' ? t('notificationPermissionRequired') : t('notificationScheduleFailed')}</AppText>
        </View>}
        <AppText color={theme.textSecondary} size="caption">{t('notificationsHelp')}</AppText>
        {blocked && <View style={{ gap: theme.space.sm }}><AppText color={theme.danger} size="caption">{t('notificationPermissionRequired')}</AppText><PrimaryButton outlined label={t('openNotificationSettings')} onPress={() => void openSystemNotificationSettings()} /></View>}
        {(feedback === 'failed' || status === 'error') && <AppText accessibilityRole="alert" size="caption" color={theme.danger}>{t('notificationScheduleFailed')}</AppText>}
        {feedback === 'test' && <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}><AppIcon name="check" color={theme.success} size={16} /><AppText size="caption" color={theme.success}>{t('testReminderScheduled')}</AppText></View>}
        {enabled && status === 'ready' && <PrimaryButton outlined disabled={working} label={t('sendTestReminder')} onPress={() => void sendTest()} icon="bell" />}
      </Surface>

      {isLoading && [1, 2].map(i => <Shimmer key={i} height={92} />)}
      {!!error && <ErrorNotice message={t('planError')} onRetry={refetch} />}
      {!isLoading && !error && !doses.length && <EmptyState icon="bell" title={t('allCaughtUp')} message={t('noActiveDoses')} />}
      <DoseSchedule groups={groups} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}><AppIcon name="shield" color={theme.success} /><AppText color={theme.textSecondary} size="caption" style={{ flex: 1 }}>{t('localCheckmarks')}</AppText></View>
    </ScrollView>
  </SafeAreaView>;
}
