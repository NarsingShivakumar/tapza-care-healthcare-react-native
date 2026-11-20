import React, {useMemo, useState} from 'react';
import {Image, Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, BackHeader, EmptyState, ErrorNotice, PrimaryButton, Shimmer, Surface} from '../components/UI';
import {SlotBottomSheet} from '../components/SlotBottomSheet';
import {bookingConfirmed, bookingRejected, bookingStarted} from '../features/bookings/bookingSlice';
import type {RootRoutes} from '../navigation/types';
import {useCreateBookingMutation, useGetDoctorsQuery, useGetSlotsQuery} from '../services/api';
import type {Slot} from '../domain/models';
import {formattedDate, money, weekDates} from '../utils/date';
import {apiErrorKey} from '../localization/errors';
import {isRecord, localizedValue, stringValue} from '../sections/itemGuards';
import {useLanguage, useT} from '../localization/i18n';

export function BookingScreen({route, navigation}: NativeStackScreenProps<RootRoutes, 'Booking'>) {
  const theme = useTheme(); const dispatch = useAppDispatch(); const t = useT(); const language = useLanguage();
  const {data: doctors, isLoading: loadingDoctors, isError: doctorsError, refetch: reloadDoctors} = useGetDoctorsQuery();
  const dates = useMemo(() => weekDates(7, language), [language]);
  const [doctorId, setDoctorId] = useState(route.params.doctorId);
  const [date, setDate] = useState(dates[0]?.date ?? '');
  const [open, setOpen] = useState(false);
  const sections = useAppSelector(state => state.layout.current.sections);
  const selectedService = sections.flatMap(section => section.items).find(item => isRecord(item) && stringValue(item, 'id') === route.params.serviceId);
  const serviceName = isRecord(selectedService) ? localizedValue(selectedService, 'name', language, localizedValue(selectedService, 'label', language)) : route.params.serviceName;
  const doctor = doctors?.find(item => item.id === doctorId);
  const {data: slots, isLoading: slotsLoading, isFetching: fetchingSlots, error: slotsError, refetch: reloadSlots} = useGetSlotsQuery({doctorId: doctorId ?? '', date}, {skip: !doctorId || !date});
  const [createBooking] = useCreateBookingMutation();
  function confirm(slot: Slot) {
    if (!doctor) return;
    const requestId = `request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch(bookingStarted({requestId, doctorId: doctor.id, doctorName: doctor.name, slotId: slot.id, startsAt: slot.startsAt}));
    setOpen(false);
    navigation.replace('BookingStatus', {requestId});
    // Optimistic navigation: the success experience appears before the mock responds.
    void createBooking({doctorId: doctor.id, slotId: slot.id}).unwrap()
      .then(booking => dispatch(bookingConfirmed({requestId, booking})))
      .catch(error => dispatch(bookingRejected({requestId, error: apiErrorKey(error)})));
  }
  return <SafeAreaView edges={['top', 'bottom']} style={{flex: 1, backgroundColor: theme.background}}>
    <BackHeader title={t('bookVisit')} subtitle={t('bookVisitSubtitle')} onBack={navigation.goBack} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: theme.space.lg, paddingBottom: theme.space.xxl * 2, gap: theme.space.xl}}>
      {!!serviceName && <Surface style={{backgroundColor: theme.muted, gap: theme.space.xs}}><AppText size="caption" color={theme.primary} weight="bold">{t('youAreBooking')}</AppText><AppText size="title" weight="bold">{serviceName}</AppText><AppText color={theme.textSecondary} size="caption">{t('bookingServiceHelp')}</AppText></Surface>}
      <View><AppText size="title" weight="bold">01 · {t('chooseDoctor')}</AppText><AppText style={{marginTop: theme.space.xs}} color={theme.textSecondary}>{t('clinicDoctors')}</AppText></View>
      {loadingDoctors ? [1, 2].map(i => <Shimmer key={i} height={106} />) : null}
      {!!doctorsError && <ErrorNotice message={t('doctorsLoadError')} onRetry={reloadDoctors} />}
      {!loadingDoctors && !doctorsError && doctors?.length === 0 && <EmptyState icon="stethoscope" title={t('noDoctors')} message={t('doctorsEmptyHelp')} />}
      {doctors?.map(item => {
        const active = doctorId === item.id;
        return <Pressable key={item.id} onPress={() => setDoctorId(item.id)} accessibilityRole="radio" accessibilityState={{checked: active}} style={({pressed}) => ({minHeight: 106, flexDirection: 'row', alignItems: 'center', gap: theme.space.md, padding: theme.space.md, borderRadius: theme.radius.lg, borderWidth: active ? 2 : 1, borderColor: active ? theme.primary : theme.border, backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1})}>
          <View style={{width: 66, height: 66, backgroundColor: theme.muted, borderRadius: theme.radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}><AppIcon name="user" size={25} color={theme.primary} /><Image source={{uri: item.photoUrl}} style={{position: 'absolute', width: 66, height: 66}} /></View>
          <View style={{flex: 1, gap: theme.space.xs}}><AppText weight="bold" size="label">{item.nameI18n?.[language] ?? item.name}</AppText><AppText size="caption" color={theme.textSecondary}>{item.specialtyI18n?.[language] ?? item.specialty} · {t('yearsShort', {count: item.experienceYears ?? 0})}</AppText><AppText color={theme.primary} weight="bold" size="label">{money(item.feeInr, language)}</AppText></View>
          <View style={{height: 26, width: 26, borderRadius: 13, borderWidth: 2, borderColor: active ? theme.primary : theme.border, alignItems: 'center', justifyContent: 'center'}}>{active && <View style={{height: 13, width: 13, borderRadius: 7, backgroundColor: theme.primary}} />}</View>
        </Pressable>;
      })}
      <View><AppText size="title" weight="bold">02 · {t('chooseDate')}</AppText><AppText color={theme.textSecondary} style={{marginTop: theme.space.xs}}>{t('next7Days')}</AppText></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: theme.space.sm}}>
        {dates.map(item => {
          const active = item.date === date;
          return <Pressable key={item.date} onPress={() => setDate(item.date)} accessibilityRole="button" accessibilityState={{selected: active}} style={{width: 66, minHeight: 82, borderRadius: theme.radius.md, paddingVertical: theme.space.sm, backgroundColor: active ? theme.primary : theme.surface, borderColor: active ? theme.primary : theme.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: theme.space.xs}}>
            <AppText size="caption" color={active ? theme.onPrimary : theme.textSecondary}>{item.weekday}</AppText><AppText weight="bold" size="title" color={active ? theme.onPrimary : theme.textPrimary}>{item.day}</AppText><AppText size="caption" color={active ? theme.onPrimary : theme.textSecondary}>{item.month}</AppText>
          </Pressable>;
        })}
      </ScrollView>
      <Surface style={{gap: theme.space.md, flexDirection: 'row', alignItems: 'center'}}><AppIcon name="shield" color={theme.success} size={23} /><View style={{flex: 1}}><AppText weight="semibold" size="label">{t('bookingReservation')}</AppText><AppText size="caption" color={theme.textSecondary}>{t('noPayment')}</AppText></View></Surface>
      <PrimaryButton label={t('pickTime')} icon="clock" disabled={!doctorId || doctors?.length === 0} onPress={() => setOpen(true)} />
    </ScrollView>
    <SlotBottomSheet visible={open} dateLabel={formattedDate(`${date}T12:00:00+05:30`, language)} slots={slots} loading={slotsLoading || fetchingSlots} error={slotsError ? t(apiErrorKey(slotsError)) : undefined} onRetry={reloadSlots} onDismiss={() => setOpen(false)} onConfirm={confirm} />
  </SafeAreaView>;
}
