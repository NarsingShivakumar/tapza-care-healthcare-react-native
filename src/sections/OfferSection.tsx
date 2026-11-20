import React from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText} from '../components/UI';
import type {RootRoutes} from '../navigation/types';
import type {LayoutSection} from '../domain/models';
import {isRecord, stringValue, localizedValue} from './itemGuards';
import {useLanguage, useLocalizedText} from '../localization/i18n';
export const OfferSection = React.memo(function OfferSection({section}: {section: LayoutSection}) {
  const theme = useTheme(); const language = useLanguage(); const localize = useLocalizedText(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const item = section.items.find(isRecord); if (!item) return null;
  return <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Booking', {})} style={{minHeight: 105, padding: theme.space.xl, flexDirection: 'row', alignItems: 'center', gap: theme.space.md}}>
    <View style={{height: 52, width: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.onPrimary}}><AppIcon name={stringValue(item, 'icon', 'gift')} color={theme.primary} size={25} /></View>
    <View style={{flex: 1, gap: theme.space.xs}}><AppText size="caption" weight="bold" color={theme.onPrimary}>{localize(section.title).toUpperCase()}</AppText><AppText weight="semibold" size="label" color={theme.onPrimary}>{localizedValue(item, 'message', language)}</AppText></View>
    <AppIcon name="chevronRight" color={theme.onPrimary} size={24} />
  </Pressable>;
});
