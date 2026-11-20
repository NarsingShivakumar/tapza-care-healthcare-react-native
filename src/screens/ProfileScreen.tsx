import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, Surface} from '../components/UI';
import {languageChanged} from '../features/settings/settingsSlice';
import {LANGUAGE_OPTIONS} from '../localization/languages';
import type {RootRoutes} from '../navigation/types';
import {useT} from '../localization/i18n';
import {useUiTransition} from '../app/UiTransitionProvider';
export function ProfileScreen() {
  const theme = useTheme(); const t = useT(); const dispatch = useAppDispatch(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const language = useAppSelector(state => state.settings.language);
  const runTransition = useUiTransition();
  const changeLanguage = (next: typeof language) => {
    if (next === language) return;
    void runTransition('language', () => {
      dispatch(languageChanged(next));
    });
  };
  return <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: theme.background}}>
    <ScrollView contentContainerStyle={{padding: theme.space.lg, gap: theme.space.xl}}>
      <View><AppText size="heading" weight="bold">{t('you')}</AppText><AppText color={theme.textSecondary} style={{marginTop: theme.space.xs}}>{t('profileSubtitle')}</AppText></View>
      <Surface style={{flexDirection: 'row', alignItems: 'center', gap: theme.space.md}}><View style={{width: 58, height: 58, borderRadius: 29, backgroundColor: theme.muted, justifyContent: 'center', alignItems: 'center'}}><AppIcon name="user" color={theme.primary} size={26} /></View><View style={{flex: 1, gap: 4}}><AppText weight="bold" size="title">{t('member')}</AppText><AppText size="caption" color={theme.textSecondary}>{t('demoProfile', {location: t('city')})}</AppText></View></Surface>
      <View style={{gap: theme.space.md}}><AppText weight="bold" size="title">{t('language')}</AppText><AppText color={theme.textSecondary} size="caption">{t('chooseLanguageHelp')}</AppText><View style={{flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm}}>{LANGUAGE_OPTIONS.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{checked: language === item.id}} onPress={() => changeLanguage(item.id)} style={{minHeight: 49, borderWidth: 1.5, borderColor: language === item.id ? theme.primary : theme.border, backgroundColor: language === item.id ? theme.muted : theme.surface, borderRadius: theme.radius.pill, paddingHorizontal: theme.space.lg, alignItems: 'center', justifyContent: 'center'}}><AppText color={language === item.id ? theme.primary : theme.textPrimary} weight="semibold">{item.label}</AppText></Pressable>)}</View></View>
      <Surface style={{gap: theme.space.md}}><View style={{flexDirection: 'row', gap: theme.space.md, alignItems: 'center'}}><AppIcon name="users" color={theme.primary} /><View style={{flex: 1}}><AppText weight="bold">{t('familyCare')}</AppText><AppText color={theme.textSecondary} size="caption">{t('familyComingSoon')}</AppText></View></View></Surface>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Admin')} style={{minHeight: 72, flexDirection: 'row', alignItems: 'center', padding: theme.space.lg, gap: theme.space.md, borderRadius: theme.radius.lg, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1}}><AppIcon name="settings" color={theme.primary} /><View style={{flex: 1}}><AppText weight="bold">{t('admin')}</AppText><AppText color={theme.textSecondary} size="caption">{t('demoSettingsSubtitle')}</AppText></View><AppIcon name="chevronRight" color={theme.textSecondary} /></Pressable>
      <AppText size="caption" style={{textAlign: 'center'}} color={theme.textSecondary}>{t('prototype')}</AppText>
    </ScrollView>
  </SafeAreaView>;
}
