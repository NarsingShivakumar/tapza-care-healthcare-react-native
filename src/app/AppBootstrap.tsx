import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch, useTheme} from './hooks';
import {CONFIG_KEY, DOSE_KEY, LANGUAGE_KEY} from './store';
import {safeParseLayoutConfig} from '../config/schema';
import {configHydrated, configReceived} from '../features/settings/configSlice';
import {dosesHydrated} from '../features/reminders/doseSlice';
import {languageChanged} from '../features/settings/settingsSlice';
import {hydrateMockServer} from '../mock/server';
import {useGetConfigQuery} from '../services/api';
import {AppNavigator} from '../navigation/AppNavigator';
import {UiTransitionProvider} from './UiTransitionProvider';
import {NotificationsCoordinator} from '../features/reminders/notifications/NotificationsCoordinator';
import {REMINDER_ENABLED_KEY} from '../features/reminders/notifications/notificationService';
import {notificationsEnabledChanged} from '../features/reminders/reminderPreferencesSlice';
import {AppText} from '../components/UI';
import {useT} from '../localization/i18n';

function ConfigSync() {
  const dispatch = useAppDispatch();
  const {data} = useGetConfigQuery();
  useEffect(() => {
    if (data) {
      dispatch(configReceived(data));
      void AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(data)).catch(() => undefined);
    }
  }, [data, dispatch]);
  return <AppNavigator />;
}
export function AppBootstrap() {
  const dispatch = useAppDispatch(); const theme = useTheme(); const t = useT();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      try {
        const [values] = await Promise.all([
          AsyncStorage.multiGet([CONFIG_KEY, DOSE_KEY, LANGUAGE_KEY, REMINDER_ENABLED_KEY]),
          hydrateMockServer(),
        ]);
        const map = Object.fromEntries(values);
        try {
          const cached = map[CONFIG_KEY] ? safeParseLayoutConfig(JSON.parse(map[CONFIG_KEY])) : null;
          if (cached) dispatch(configHydrated(cached));
        } catch { /* Corrupted cache is discarded. Bundled layout remains usable. */ }
        try {
          if (map[DOSE_KEY]) {
            const doses: unknown = JSON.parse(map[DOSE_KEY]);
            if (doses && typeof doses === 'object' && !Array.isArray(doses)) {
              const validated = Object.fromEntries(Object.entries(doses).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));
              dispatch(dosesHydrated(validated));
            }
          }
        } catch { /* Keep fresh reminder state. */ }
        if (map[REMINDER_ENABLED_KEY] === 'true') dispatch(notificationsEnabledChanged(true));
        if (map[LANGUAGE_KEY] === 'en' || map[LANGUAGE_KEY] === 'hi' || map[LANGUAGE_KEY] === 'te') dispatch(languageChanged(map[LANGUAGE_KEY]));
      } catch { /* Storage failures should never block launching the app. */ }
      finally {if (mounted) setHydrated(true);}
    }
    void hydrate();
    return () => {mounted = false;};
  }, [dispatch]);
  if (!hydrated) return <View style={{flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', gap: theme.space.lg}}><View style={{width: 70, height: 70, borderRadius: theme.radius.xl, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center'}}><AppText weight="bold" size="heading" color={theme.onPrimary}>t+</AppText></View><ActivityIndicator color={theme.primary} /><AppText color={theme.textSecondary}>{t('loadingApp')}</AppText></View>;
  return <UiTransitionProvider><NotificationsCoordinator /><ConfigSync /></UiTransitionProvider>;
}
