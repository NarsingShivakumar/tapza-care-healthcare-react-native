import React from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {useAppDispatch, useAppSelector, useTheme} from '../app/hooks';
import {doseKey, saveDose} from '../features/reminders/doseSlice';
import type {ScheduledDose} from '../features/reminders/schedule';
import {TIMINGS} from '../features/reminders/schedule';
import type {Timing} from '../domain/models';
import {AppIcon} from './Icon';
import {AppText} from './UI';
import {dateKey} from '../utils/date';
import {useLanguage, useT} from '../localization/i18n';

const periodIcons: Record<Timing, string> = {morning: 'sun', afternoon: 'activity', night: 'sparkles'};
export function DoseSchedule({groups}: {groups: Record<Timing, ScheduledDose[]>}) {
  const theme = useTheme(); const t = useT();
  return <View style={{gap: theme.space.xl}}>{TIMINGS.map(timing => {
    const doses = groups[timing];
    if (!doses.length) return null;
    return <View key={timing} style={{gap: theme.space.md}}>
      <View style={{flexDirection: 'row', gap: theme.space.sm, alignItems: 'center'}}>
        <AppIcon name={periodIcons[timing]} color={theme.primary} />
        <AppText size="title" weight="bold">{t(timing)}</AppText>
        <AppText color={theme.textSecondary} size="caption">· {t('doseCount', {count: doses.length})}</AppText>
      </View>
      {doses.map(dose => <DoseRow key={`${dose.prescriptionId}:${dose.medicine.id}:${timing}`} dose={dose} />)}
    </View>;
  })}</View>;
}

const DoseRow = React.memo(function DoseRow({dose}: {dose: ScheduledDose}) {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const dispatch = useAppDispatch();
  const key = doseKey(dose.prescriptionId, dose.medicine.id, dose.timing, dateKey(new Date()));
  const taken = useAppSelector(state => !!state.doses.taken[key]);
  const status = useAppSelector(state => state.doses.saveStatus[key]);
  const isSaving = status === 'saving';
  const isSaved = status === 'saved' || (taken && !status);
  const medicineName = dose.medicine.nameI18n?.[language] ?? dose.medicine.name;
  const doseText = dose.medicine.doseI18n?.[language] ?? dose.medicine.dose;

  const handlePress = () => {
    if (!isSaving) void dispatch(saveDose({key, taken: !taken}));
  };

  return <Pressable onPress={handlePress} disabled={isSaving} accessibilityRole="checkbox"
    accessibilityState={{checked: taken, disabled: isSaving}}
    accessibilityLabel={t('doseTakenAccessibility', {medicine: medicineName, timing: t(dose.timing), status: isSaving ? t('savingDose') : isSaved ? t('savedDose') : taken ? t('taken') : t('markTaken')})}
    style={({pressed}) => ({minHeight: 93, borderWidth: 1, borderColor: status === 'error' ? theme.danger : taken ? theme.success : theme.border, backgroundColor: taken ? theme.muted : theme.surface, padding: theme.space.lg, borderRadius: theme.radius.lg, flexDirection: 'row', alignItems: 'center', gap: theme.space.md, opacity: pressed ? 0.85 : 1})}>
    <View style={{height: 45, width: 45, borderRadius: theme.radius.md, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center'}}>
      <AppIcon name="pill" color={theme.primary} size={22} />
    </View>
    <View style={{flex: 1, gap: theme.space.xs}}>
      <AppText weight="semibold" size="label">{medicineName}</AppText>
      <AppText size="caption" color={theme.textSecondary}>{doseText} · {t('daysCount', {count: dose.medicine.days})}</AppText>
      {isSaving && <View style={{flexDirection: 'row', gap: theme.space.xs, alignItems: 'center'}}><ActivityIndicator color={theme.primary} size="small" /><AppText size="caption" color={theme.primary}>{t('savingDose')}</AppText></View>}
      {isSaved && <View style={{flexDirection: 'row', gap: theme.space.xs, alignItems: 'center'}}><AppIcon name="badge" color={theme.success} size={15} /><AppText size="caption" color={theme.success} weight="semibold">{t('savedDose')}</AppText></View>}
      {status === 'error' && <AppText accessibilityRole="alert" size="caption" color={theme.danger}>{t('saveDoseFailed')}</AppText>}
    </View>
    <View style={{alignItems: 'center', gap: theme.space.xs, maxWidth: 95}}>
      <View style={{width: 30, height: 30, borderWidth: 1.7, borderColor: taken ? theme.success : theme.border, borderRadius: 15, backgroundColor: taken ? theme.success : theme.surface, justifyContent: 'center', alignItems: 'center'}}>
        {taken && <AppIcon name="check" color={theme.onPrimary} size={18} />}
      </View>
      <AppText size="caption" color={taken ? theme.success : theme.textSecondary} style={{textAlign: 'center'}}>{taken ? t('taken') : t('markTaken')}</AppText>
    </View>
  </Pressable>;
});
