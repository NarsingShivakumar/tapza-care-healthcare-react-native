import React from 'react';
import {ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {DoseSchedule} from '../components/DoseSchedule';
import {AppText, BackHeader, EmptyState, Shimmer, Surface} from '../components/UI';
import {groupDoses} from '../features/reminders/schedule';
import type {RootRoutes} from '../navigation/types';
import {useGetPrescriptionsQuery} from '../services/api';
import {formattedDate} from '../utils/date';
import {useLanguage, useT} from '../localization/i18n';
export function PrescriptionDetailScreen({route, navigation}: NativeStackScreenProps<RootRoutes, 'PrescriptionDetail'>) {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const {data, isLoading, refetch} = useGetPrescriptionsQuery();
  const prescription = data?.find(item => item.id === route.params.prescriptionId);
  const groups = prescription ? groupDoses([prescription], true) : {morning: [], afternoon: [], night: []};
  return <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: theme.background}}>
    <BackHeader title={t('prescriptionDetails')} subtitle={route.params.prescriptionId} onBack={navigation.goBack} />
    <ScrollView contentContainerStyle={{padding: theme.space.lg, gap: theme.space.xl, paddingBottom: theme.space.xxl}}>
      {isLoading ? <Shimmer height={150} /> : !prescription ? <EmptyState icon="file" title={t('prescriptionNotFound')} message={t('prescriptionNotFoundHelp')} actionLabel={t('refresh')} onAction={refetch} /> : <>
        <Surface style={{gap: theme.space.lg}}><View style={{flexDirection: 'row', alignItems: 'center', gap: theme.space.md}}><View style={{height: 55, width: 55, borderRadius: theme.radius.md, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center'}}><AppIcon name="file" color={theme.primary} size={29} /></View><View style={{flex: 1, gap: 4}}><AppText size="title" weight="bold">{prescription.doctorNameI18n?.[language] ?? prescription.doctorName}</AppText><AppText color={theme.textSecondary} size="caption">{prescription.clinicNameI18n?.[language] ?? prescription.clinicName}</AppText></View></View><View style={{height: 1, backgroundColor: theme.border}} /><View style={{flexDirection: 'row', justifyContent: 'space-between'}}><AppText size="caption" color={theme.textSecondary}>{t('issuedDate', {date: formattedDate(prescription.issuedAt, language)})}</AppText><AppText size="caption" color={theme.primary} weight="semibold">{prescription.id}</AppText></View></Surface>
        <View style={{gap: theme.space.xs}}><AppText size="heading" weight="bold">{t('yourMedicineSchedule')}</AppText><AppText color={theme.textSecondary}>{t('doseScheduleHelp')}</AppText></View>
        <DoseSchedule groups={groups} />
        {Object.values(groups).every(doses => doses.length === 0) && <EmptyState icon="badge" title={t('courseComplete')} message={t('courseCompleteHelp')} />}
        <Surface style={{backgroundColor: theme.muted, flexDirection: 'row', gap: theme.space.md, alignItems: 'center'}}><AppIcon name="shield" color={theme.primary} /><View style={{flex: 1}}><AppText size="label" weight="semibold">{t('followDirections')}</AppText><AppText size="caption" color={theme.textSecondary}>{t('contactClinic')}</AppText></View></Surface>
      </>}
    </ScrollView>
  </SafeAreaView>;
}
