import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, EmptyState, ErrorNotice, PrimaryButton, Shimmer, Surface} from '../components/UI';
import type {RootRoutes} from '../navigation/types';
import {useGetBookingsQuery} from '../services/api';
import {doctors} from '../data/clinic';
import {formattedDate, formattedTime} from '../utils/date';
import {useT, useLanguage} from '../localization/i18n';
export function BookingsScreen() {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const {data, isLoading, error, refetch} = useGetBookingsQuery();
  const progressEntries = useAppSelector(state => state.bookingProgress.entries);
  const progress = Object.values(progressEntries);
  const local = progress.filter(item => item.status !== 'confirmed' || !data?.some(booking => booking.id === item.bookingId));
  const items = [
    ...local.map(item => ({key: item.requestId, doctorName: doctors.find(doctor => doctor.id === item.doctorId)?.nameI18n?.[language] ?? item.doctorName, startsAt: item.startsAt, status: item.status, requestId: item.requestId})),
    ...(data ?? []).map(item => ({key: item.id, doctorName: doctors.find(doctor => doctor.id === item.doctorId)?.nameI18n?.[language] ?? doctors.find(doctor => doctor.id === item.doctorId)?.name ?? t('clinicAddress'), startsAt: item.startsAt, status: 'confirmed' as const, requestId: undefined})),
  ];
  return <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: theme.background}}>
    <ScrollView contentContainerStyle={{padding: theme.space.lg, gap: theme.space.lg, paddingBottom: theme.space.xxl}}>
      <View style={{gap: theme.space.xs, marginBottom: theme.space.sm}}><AppText size="heading" weight="bold">{t('yourVisits')}</AppText><AppText color={theme.textSecondary}>{t('bookingHistorySubtitle')}</AppText></View>
      <PrimaryButton label={t('bookNewAppointment')} onPress={() => navigation.navigate('Booking', {})} icon="calendar" />
      {isLoading && [0, 1].map(i => <Shimmer key={i} height={135} />)}
      {!!error && <ErrorNotice message={t('bookingHistoryError')} onRetry={refetch} />}
      {!isLoading && !error && !items.length && <EmptyState icon="calendar" title={t('noBookings')} message={t('bookingHistoryEmptyHelp')} actionLabel={t('bookNow')} onAction={() => navigation.navigate('Booking', {})} />}
      {items.map(item => <Pressable key={item.key} disabled={!item.requestId} onPress={() => {if (item.requestId) navigation.navigate('BookingStatus', {requestId: item.requestId});}} accessibilityRole="button" style={({pressed}) => ({opacity: pressed ? 0.8 : 1})}>
        <Surface style={{gap: theme.space.md}}>
          <View style={{flexDirection: 'row', gap: theme.space.md, alignItems: 'center'}}><View style={{height: 52, width: 52, backgroundColor: theme.muted, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center'}}><AppIcon name="calendar" color={theme.primary} size={24} /></View><View style={{flex: 1, gap: 4}}><AppText weight="bold">{item.doctorName}</AppText><AppText color={theme.textSecondary} size="caption">{formattedDate(item.startsAt, language)} · {formattedTime(item.startsAt, language)}</AppText></View></View>
          <View style={{height: 1, backgroundColor: theme.border}} />
          <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.space.sm}}><AppIcon name={item.status === 'confirmed' ? 'badge' : item.status === 'pending' ? 'clock' : 'offline'} color={item.status === 'failed' ? theme.danger : theme.success} size={19} /><AppText size="caption" weight="semibold" color={item.status === 'failed' ? theme.danger : theme.success}>{item.status === 'pending' ? t('confirming') : item.status === 'failed' ? t('couldNotConfirm') : t('confirmed')}</AppText></View>
        </Surface>
      </Pressable>)}
    </ScrollView>
  </SafeAreaView>;
}
