import React from 'react';
import {Animated, Image, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText} from '../components/UI';
import type {RootRoutes} from '../navigation/types';
import type {LayoutSection} from '../domain/models';
import {isRecord, localizedValue} from './itemGuards';
import {useLanguage, useT} from '../localization/i18n';

export const HeroSection = React.memo(function HeroSection({section, parallax}: {section: LayoutSection; parallax: Animated.AnimatedInterpolation<string | number>}) {
  const theme = useTheme(); const language = useLanguage(); const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const item = section.items.find(isRecord);
  if (!item) return null;
  const title = localizedValue(item, 'greeting', language, t('healthSupport'));
  const subtitle = localizedValue(item, 'subtitle', language);
  const eyebrow = localizedValue(item, 'eyebrow', language, 'Tapza Care');
  const cta = localizedValue(item, 'cta', language, t('bookNow'));
  return <View style={{minHeight: 267, paddingHorizontal: theme.space.xl, paddingVertical: theme.space.xxl, overflow: 'hidden'}}>
    <Animated.View pointerEvents="none" style={{position: 'absolute', right: -56, top: -15, transform: [{translateY: parallax}]}}>
      <View style={{width: 218, height: 218, borderRadius: 110, borderWidth: 34, borderColor: theme.onPrimary, opacity: 0.35}} />
      <View style={{position: 'absolute', top: 65, left: 70, width: 73, height: 73, borderRadius: 37, backgroundColor: theme.onPrimary, opacity: 0.72}} />
      {!!theme.festival?.bannerImageUrl && <Image source={{uri: theme.festival.bannerImageUrl}} resizeMode="cover" style={{position: 'absolute', top: 12, left: 5, width: 205, height: 205, borderRadius: 110, opacity: 0.33}} />}
    </Animated.View>
    <View style={{alignSelf: 'flex-start', backgroundColor: theme.surface, paddingHorizontal: theme.space.md, paddingVertical: theme.space.sm, borderRadius: theme.radius.pill, flexDirection: 'row', alignItems: 'center', gap: theme.space.xs}}>
      <AppIcon name="sparkles" size={15} color={theme.primary} />
      <AppText size="caption" weight="bold" color={theme.primary}>{eyebrow}</AppText>
    </View>
    <AppText size="hero" weight="bold" style={{maxWidth: '76%', lineHeight: theme.font.hero * 1.18, marginTop: theme.space.lg}}>{title}</AppText>
    <AppText color={theme.textSecondary} size="label" style={{maxWidth: '79%', lineHeight: 21, marginTop: theme.space.sm}}>{subtitle}</AppText>
    <Pressable onPress={() => navigation.navigate('Booking', {})} accessibilityRole="button" accessibilityLabel={cta} style={{minHeight: 46, alignSelf: 'flex-start', marginTop: theme.space.xl, borderRadius: theme.radius.pill, backgroundColor: theme.primary, paddingHorizontal: theme.space.lg, flexDirection: 'row', gap: theme.space.sm, justifyContent: 'center', alignItems: 'center'}}>
      <AppText size="label" weight="semibold" color={theme.onPrimary}>{cta}</AppText>
      <AppIcon name="arrow" color={theme.onPrimary} size={17} />
    </Pressable>
  </View>;
});
