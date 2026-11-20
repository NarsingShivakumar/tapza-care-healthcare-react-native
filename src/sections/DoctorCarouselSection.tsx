import React from 'react';
import {Image, Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, ErrorNotice, Shimmer} from '../components/UI';
import {useGetDoctorsQuery} from '../services/api';
import type {LayoutSection} from '../domain/models';
import type {RootRoutes} from '../navigation/types';
import {SectionTitle} from './shared';
import {useLanguage, useT} from '../localization/i18n';
import {availabilityLabel} from '../localization/availability';
export const DoctorCarouselSection = React.memo(function DoctorCarouselSection({section}: {section: LayoutSection}) {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const {data, isLoading, error, refetch} = useGetDoctorsQuery();
  const ids = section.items.filter((item): item is string => typeof item === 'string');
  const filtered = data?.filter(doctor => ids.length === 0 || ids.includes(doctor.id)) ?? [];
  return <View style={{paddingVertical: theme.space.xl}}>
    <View style={{paddingHorizontal: theme.space.lg}}><SectionTitle title={section.title} subtitle={t('localDoctorsSubtitle')} /></View>
    {isLoading ? <View style={{flexDirection: 'row', gap: theme.space.md, paddingHorizontal: theme.space.lg}}><Shimmer height={180} width={247} /><Shimmer height={180} width={100} /></View> : null}
    {!!error && <ErrorNotice message={t('doctorsLoadErrorShort')} onRetry={refetch} />}
    {!isLoading && filtered.length === 0 && !error ? <AppText style={{paddingHorizontal: theme.space.lg}} color={theme.textSecondary}>{t('doctorsEmptyHome')}</AppText> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: theme.space.lg, gap: theme.space.md}}>
      {filtered.map(doctor => <Pressable key={doctor.id} onPress={() => navigation.navigate('Booking', {doctorId: doctor.id})} accessibilityRole="button" style={({pressed}) => ({width: 266, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.lg, backgroundColor: theme.surface, padding: theme.space.lg, opacity: pressed ? 0.8 : 1})}>
        <View style={{flexDirection: 'row', gap: theme.space.md}}>
          <View style={{width: 66, height: 66, borderRadius: theme.radius.lg, overflow: 'hidden', backgroundColor: theme.muted, justifyContent: 'center', alignItems: 'center'}}>
            <AppIcon name="user" color={theme.primary} size={32} />
            <Image source={{uri: doctor.photoUrl}} style={{position: 'absolute', width: 66, height: 66}} />
          </View>
          <View style={{flex: 1, gap: theme.space.xs}}><AppText weight="bold" size="label" numberOfLines={2}>{doctor.nameI18n?.[language] ?? doctor.name}</AppText><AppText size="caption" color={theme.textSecondary}>{doctor.specialtyI18n?.[language] ?? doctor.specialty}</AppText><AppText size="caption" color={theme.primary}>{t('yearsExperience', {count: doctor.experienceYears ?? 0})}</AppText></View>
        </View>
        <View style={{marginTop: theme.space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}><View style={{gap: 4}}><AppText size="caption" color={theme.textSecondary}>{t('nextAvailable')}</AppText><AppText size="caption" weight="semibold">{availabilityLabel(doctor.nextAvailableAt, language, t)}</AppText></View><View style={{backgroundColor: theme.primary, borderRadius: theme.radius.pill, minHeight: 44, minWidth: 68, alignItems: 'center', justifyContent: 'center'}}><AppText size="caption" color={theme.onPrimary} weight="bold">{t('book')}</AppText></View></View>
      </Pressable>)}
    </ScrollView>
  </View>;
});
