import React, {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import {useGetPrescriptionsQuery} from '../../../services/api';
import {notificationsAuthorized, syncDoseNotifications} from './notificationService';
import {buildReminderPlan} from './reminderPlan';
import {notificationsStatusChanged} from '../reminderPreferencesSlice';

/** Runs once above navigation so reminders still reconcile when a screen unmounts.
 * Refills the bounded trigger queue on foreground and when a dose is durably saved.
 */
export function NotificationsCoordinator() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector(state => state.reminderPreferences.enabled);
  const language = useAppSelector(state => state.settings.language);
  const taken = useAppSelector(state => state.doses.taken);
  const persistedRevision = useAppSelector(state => state.doses.persistedRevision);
  const {data: prescriptions, isError} = useGetPrescriptionsQuery();
  const [foregroundRevision, setForegroundRevision] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') setForegroundRevision(value => value + 1);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // A loading/failed API must not delete already scheduled reminders.
    // Disabling notifications is an explicit exception: clear them immediately.
    if (enabled && !prescriptions) {
      if (isError) dispatch(notificationsStatusChanged({status: 'error'}));
      return;
    }
    let active = true;
    dispatch(notificationsStatusChanged({status: enabled ? 'working' : 'off'}));
    void (async () => {
      try {
        if (enabled && !(await notificationsAuthorized())) {
          await syncDoseNotifications([], false, language);
          if (active) dispatch(notificationsStatusChanged({status: 'blocked', count: 0}));
          return;
        }
        const plan = enabled ? buildReminderPlan(prescriptions ?? [], taken, language) : [];
        const count = await syncDoseNotifications(plan, enabled, language);
        if (active) dispatch(notificationsStatusChanged({status: enabled ? 'ready' : 'off', count}));
      } catch {
        if (active) dispatch(notificationsStatusChanged({status: 'error', count: 0}));
      }
    })();
    return () => {active = false;};
    // Only durable dose changes trigger sync; optimistic checkmarks do not cancel alarms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, enabled, language, prescriptions, isError, persistedRevision, foregroundRevision]);

  return null;
}
