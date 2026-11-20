import React, {useState} from 'react';
import {Pressable, ScrollView, Switch, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, BackHeader, ErrorNotice, PrimaryButton, Surface} from '../components/UI';
import type {MockSettings} from '../domain/models';
import {getMockSettings, persistMockSettings, updateMockSettings} from '../mock/server';
import type {RootRoutes} from '../navigation/types';
import {api} from '../services/api';
import {configReceived} from '../features/settings/configSlice';
import {useUiTransition} from '../app/UiTransitionProvider';
import {useT, type TranslationKey} from '../localization/i18n';
export function AdminScreen({navigation}: NativeStackScreenProps<RootRoutes, 'Admin'>) {
  const theme = useTheme(); const dispatch = useAppDispatch(); const t = useT();
  const [settings, setSettings] = useState(getMockSettings);
  const [themeError, setThemeError] = useState(false);
  const runTransition = useUiTransition();
  const {current, source} = useAppSelector(state => state.layout);

  // Demo flags only refresh the endpoint they affect; latency and booking failure
  // settings are applied by the mock on the next request, with no refetch needed.
  function update(next: Partial<MockSettings>) {
    setSettings(updateMockSettings(next));
    void persistMockSettings().catch(() => undefined);
    const affected: ('Config' | 'Doctors' | 'Slots' | 'Prescriptions')[] = [];
    if ('failConfig' in next) affected.push('Config');
    if ('emptyDoctors' in next) affected.push('Doctors');
    if ('emptySlots' in next) affected.push('Slots');
    if ('emptyPrescriptions' in next) affected.push('Prescriptions');
    if (affected.length) dispatch(api.util.invalidateTags(affected));
  }

  async function changeScene(scene: MockSettings['scene']) {
    if (settings.scene === scene) return;
    setThemeError(false);
    const previousScene = settings.scene;
    try {
      await runTransition('theme', async () => {
        setSettings(updateMockSettings({scene}));
        try {
          // Refetch exactly /config, respecting the demo latency / failure settings.
          const fresh = await dispatch(api.endpoints.getConfig.initiate(undefined, {forceRefetch: true})).unwrap();
          dispatch(configReceived(fresh));
          void persistMockSettings().catch(() => undefined);
        } catch (error) {
          // Keep the previous appearance and selection if the mocked endpoint fails.
          setSettings(updateMockSettings({scene: previousScene}));
          throw error;
        }
      });
    } catch {
      setThemeError(true);
    }
  }
  const flags: {key: keyof Pick<MockSettings, 'failConfig' | 'failBooking' | 'emptyDoctors' | 'emptySlots' | 'emptyPrescriptions'>; title: TranslationKey; subtitle: TranslationKey}[] = [
    {key: 'failConfig', title: 'failConfig', subtitle: 'failConfigHelp'},
    {key: 'failBooking', title: 'failBooking', subtitle: 'failBookingHelp'},
    {key: 'emptyDoctors', title: 'emptyDoctors', subtitle: 'emptyDoctorsHelp'},
    {key: 'emptySlots', title: 'emptySlots', subtitle: 'emptySlotsHelp'},
    {key: 'emptyPrescriptions', title: 'emptyPrescriptions', subtitle: 'emptyPrescriptionsHelp'},
  ];
  return <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: theme.background}}>
    <BackHeader title={t('admin')} subtitle={t('adminSubtitle')} onBack={navigation.goBack} />
    <ScrollView contentContainerStyle={{padding: theme.space.lg, paddingBottom: theme.space.xxl, gap: theme.space.xl}}>
      <Surface style={{gap: theme.space.sm, backgroundColor: theme.muted}}><AppText size="label" weight="bold">{t('layoutStatus')}</AppText><AppText color={theme.primary} size="title" weight="bold">{t('layoutVersion', {version: current.version, source: t(source === 'bundled' ? 'configSourceBundled' : source === 'cached' ? 'configSourceCache' : 'configSourceRemote')})}</AppText><AppText color={theme.textSecondary} size="caption">{t('layoutExplainer')}</AppText></Surface>
      <View style={{gap: theme.space.md}}><AppText size="title" weight="bold">{t('themeScenario')}</AppText><View style={{flexDirection: 'row', gap: theme.space.sm}}>{(['normal', 'festival'] as const).map(scene => <Pressable key={scene} accessibilityRole="radio" accessibilityState={{checked: settings.scene === scene}} onPress={() => {void changeScene(scene);}} style={{flex: 1, minHeight: 68, padding: theme.space.md, flexDirection: 'row', gap: theme.space.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: settings.scene === scene ? theme.primary : theme.border, backgroundColor: settings.scene === scene ? theme.muted : theme.surface, borderRadius: theme.radius.lg}}><AppIcon name={scene === 'normal' ? 'heart' : 'sun'} color={theme.primary} /><AppText weight="semibold">{scene === 'normal' ? t('everyday') : t('diwali')}</AppText></Pressable>)}</View><AppText color={theme.textSecondary} size="caption">{t('themeHelp')}</AppText></View>
      {themeError ? <ErrorNotice message={t('themeChangeError')} /> : null}
      <View style={{gap: theme.space.md}}><AppText size="title" weight="bold">{t('latency')}</AppText><View style={{flexDirection: 'row', gap: theme.space.sm}}>{[0, 700, 2500].map(ms => <Pressable key={ms} accessibilityRole="radio" accessibilityState={{checked: settings.latencyMs === ms}} onPress={() => update({latencyMs: ms})} style={{flex: 1, minHeight: 49, borderRadius: theme.radius.md, borderColor: settings.latencyMs === ms ? theme.primary : theme.border, borderWidth: 1, backgroundColor: settings.latencyMs === ms ? theme.muted : theme.surface, alignItems: 'center', justifyContent: 'center'}}><AppText weight="semibold" color={settings.latencyMs === ms ? theme.primary : theme.textPrimary}>{ms ? `${ms / 1000}s` : t('instant')}</AppText></Pressable>)}</View></View>
      <View style={{gap: theme.space.md}}><AppText size="title" weight="bold">{t('failuresHeading')}</AppText><Surface>{flags.map((flag, i) => <View key={flag.key} style={{minHeight: 78, paddingVertical: theme.space.md, flexDirection: 'row', alignItems: 'center', gap: theme.space.md, borderBottomWidth: i === flags.length - 1 ? 0 : 1, borderBottomColor: theme.border}}><View style={{flex: 1, gap: theme.space.xs}}><AppText weight="semibold" size="label">{t(flag.title)}</AppText><AppText size="caption" color={theme.textSecondary}>{t(flag.subtitle)}</AppText></View><Switch value={settings[flag.key]} onValueChange={value => update({[flag.key]: value})} trackColor={{false: theme.border, true: theme.secondary}} thumbColor={theme.onPrimary} accessibilityLabel={t(flag.title)} /></View>)}</Surface></View>
      <PrimaryButton label={t('refreshLayout')} onPress={() => {dispatch(api.util.invalidateTags(['Config', 'Doctors', 'Slots', 'Prescriptions', 'Bookings'])); navigation.navigate('Tabs', {screen: 'home'});}} icon="refresh" />
      <AppText color={theme.textSecondary} size="caption">{t('adminFailureTip')}</AppText>
    </ScrollView>
  </SafeAreaView>;
}
