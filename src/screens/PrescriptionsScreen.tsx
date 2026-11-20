import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, EmptyState, ErrorNotice, Shimmer, Surface} from '../components/UI';
import type {RootRoutes} from '../navigation/types';
import {useGetPrescriptionsQuery} from '../services/api';
import {formattedDate} from '../utils/date';
import {useLanguage, useT} from '../localization/i18n';
export function PrescriptionsScreen() {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const {data, isLoading, error, refetch} = useGetPrescriptionsQuery();
  return <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: theme.background}}>
    <ScrollView contentContainerStyle={{padding: theme.space.lg, gap: theme.space.lg, paddingBottom: theme.space.xxl}}>
      <View style={{gap: theme.space.xs, marginBottom: theme.space.sm}}><AppText size="heading" weight="bold">{t('myHealth')}</AppText><AppText color={theme.textSecondary}>{t('recordsSubtitle')}</AppText></View>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Reminders')} style={{padding: theme.space.lg, borderRadius: theme.radius.lg, flexDirection: 'row', alignItems: 'center', gap: theme.space.md, backgroundColor: theme.primary, minHeight: 94}}>
        <View style={{height: 46, width: 46, backgroundColor: theme.secondary, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center'}}><AppIcon name="bell" color={theme.onPrimary} size={23} /></View>
        <View style={{flex: 1, gap: 4}}><AppText color={theme.onPrimary} weight="bold">{t('medicineReminders')}</AppText><AppText color={theme.onPrimary} size="caption">{t('remindersSubtitle')}</AppText></View><AppIcon name="chevronRight" color={theme.onPrimary} />
      </Pressable>
      <AppText weight="bold" size="title">{t('yourPrescriptions')}</AppText>
      {isLoading && [0, 1].map(i => <Shimmer key={i} height={135} />)}
      {!!error && <ErrorNotice message={t('prescriptionsError')} onRetry={refetch} />}
      {!isLoading && !error && !data?.length && <EmptyState icon="file" title={t('noPrescriptions')} message={t('noPrescriptionsHelp')} />}
      {data?.map(item => <Pressable accessibilityRole="button" onPress={() => navigation.navigate('PrescriptionDetail', {prescriptionId: item.id})} key={item.id} style={({pressed}) => ({opacity: pressed ? 0.8 : 1})}>
        <Surface style={{gap: theme.space.md}}>
          <View style={{flexDirection: 'row', gap: theme.space.md, alignItems: 'center'}}><View style={{height: 54, width: 54, borderRadius: theme.radius.md, backgroundColor: theme.muted, justifyContent: 'center', alignItems: 'center'}}><AppIcon name="file" size={26} color={theme.primary} /></View><View style={{flex: 1, gap: 4}}><AppText size="label" weight="bold">{item.doctorNameI18n?.[language] ?? item.doctorName}</AppText><AppText size="caption" color={theme.textSecondary} numberOfLines={2}>{item.clinicNameI18n?.[language] ?? item.clinicName}</AppText></View><AppIcon name="chevronRight" color={theme.textSecondary} /></View>
          <View style={{height: 1, backgroundColor: theme.border}} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}><AppText size="caption" color={theme.textSecondary}>{formattedDate(item.issuedAt, language)} · {item.id}</AppText><AppText size="caption" weight="semibold" color={theme.primary}>{t('medicineCount', {count: item.medicines.length})}</AppText></View>
        </Surface>
      </Pressable>)}
    </ScrollView>
  </SafeAreaView>;
}
