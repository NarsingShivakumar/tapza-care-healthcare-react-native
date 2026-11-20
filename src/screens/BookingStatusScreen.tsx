import React from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, EmptyState, PrimaryButton} from '../components/UI';
import {AppLottie} from '../components/AppLottie';
import type {RootRoutes} from '../navigation/types';
import {formattedDate, formattedTime} from '../utils/date';
import {doctors} from '../data/clinic';
import {useLanguage, useT, type TranslationKey} from '../localization/i18n';

export function BookingStatusScreen({navigation, route}: NativeStackScreenProps<RootRoutes, 'BookingStatus'>) {
  const theme = useTheme(); const t = useT(); const language = useLanguage();
  const booking = useAppSelector(state => state.bookingProgress.entries[route.params.requestId]);
  const pending = booking?.status === 'pending', failed = booking?.status === 'failed';
  if (!booking) return <SafeAreaView edges={['top', 'bottom']} style={{flex: 1, backgroundColor: theme.background}}><EmptyState icon="calendar" title={t('bookingNotFound')} message={t('bookingNotFoundHelp')} actionLabel={t('myBookings')} onAction={() => navigation.navigate('Tabs', {screen: 'bookings'})} /></SafeAreaView>;
  return <SafeAreaView edges={['top', 'bottom']} style={{flex: 1, backgroundColor: theme.background, padding: theme.space.xl}}>
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.space.lg}}>
      <AppLottie
        fileName={pending ? 'loading' : failed ? 'error' : 'success'}
        size={152}
        durationMs={pending ? 1100 : 1650}
        loop={pending}
        style={{backgroundColor: theme.muted, borderRadius: theme.radius.pill}}
      />
      <AppText size="heading" weight="bold" style={{textAlign: 'center'}}>{pending ? t('securingSlot') : failed ? t('bookingFailedTitle') : t('bookingSuccessTitle')}</AppText>
      <AppText color={theme.textSecondary} style={{textAlign: 'center', lineHeight: 24}}>{pending ? t('bookingPendingHelp') : failed ? t((booking?.error || 'bookingFailedHelp') as TranslationKey) : t('bookingSuccessHelp')}</AppText>
      {!!booking && <View style={{alignSelf: 'stretch', padding: theme.space.xl, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: theme.radius.xl, gap: theme.space.md}}>
        <View style={{flexDirection: 'row', gap: theme.space.sm, alignItems: 'center'}}><AppIcon name="stethoscope" color={theme.primary} /><AppText weight="semibold">{doctors.find(doctor => doctor.id === booking.doctorId)?.nameI18n?.[language] ?? booking.doctorName}</AppText></View>
        <View style={{flexDirection: 'row', gap: theme.space.sm, alignItems: 'center'}}><AppIcon name="calendar" color={theme.primary} /><AppText>{formattedDate(booking.startsAt, language)} · {formattedTime(booking.startsAt, language)}</AppText></View>
        <View style={{flexDirection: 'row', gap: theme.space.sm, alignItems: 'center'}}><AppIcon name="pin" color={theme.primary} /><AppText>{t('clinicAddress')}</AppText></View>
        {!!booking.bookingId && <AppText size="caption" color={theme.textSecondary}>{t('bookingReference', {id: booking.bookingId})}</AppText>}
      </View>}
    </View>
    <View style={{gap: theme.space.md}}>
      {failed && <PrimaryButton label={t('chooseAnotherSlot')} onPress={() => navigation.replace('Booking', {doctorId: booking?.doctorId})} />}
      <PrimaryButton label={failed ? t('backHome') : t('seeBookings')} outlined onPress={() => navigation.navigate('Tabs', {screen: failed ? 'home' : 'bookings'})} />
    </View>
  </SafeAreaView>;
}
