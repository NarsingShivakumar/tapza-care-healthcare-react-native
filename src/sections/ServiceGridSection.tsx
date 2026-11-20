import React from 'react';
import {Image, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText} from '../components/UI';
import type {RootRoutes} from '../navigation/types';
import type {LayoutSection} from '../domain/models';
import {money} from '../utils/date';
import {isRecord, numberValue, stringValue, localizedValue} from './itemGuards';
import {useLanguage, useT} from '../localization/i18n';
import {SectionTitle} from './shared';
export const ServiceGridSection = React.memo(function ServiceGridSection({section}: {section: LayoutSection}) {
  const theme = useTheme(); const language = useLanguage(); const t = useT(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  return <View style={{padding: theme.space.lg, paddingVertical: theme.space.xl}}>
    <SectionTitle title={section.title} subtitle={t('servicesSubtitle')} />
    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md}}>
      {section.items.filter(isRecord).map((item, index) => {
        const name = localizedValue(item, 'name', language); if (!name) return null;
        const badge = localizedValue(item, 'badge', language);
        return <Pressable key={stringValue(item, 'id', `${index}`)} onPress={() => navigation.navigate('Booking', {serviceId: stringValue(item, 'id'), serviceName: name})} accessibilityRole="button" style={({pressed}) => ({width: '47%', flexGrow: 1, minHeight: 216, padding: theme.space.md, borderRadius: theme.radius.lg, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, opacity: pressed ? 0.78 : 1})}>
          <View style={{height: 94, backgroundColor: theme.muted, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            <AppIcon name={stringValue(item, 'icon', 'heart')} size={30} color={theme.primary} />
            {!!stringValue(item, 'imageUrl') && <Image source={{uri: stringValue(item, 'imageUrl')}} resizeMode="cover" style={{position: 'absolute', width: '100%', height: '100%'}} />}
            {!!badge && <View style={{position: 'absolute', top: theme.space.sm, right: theme.space.sm, backgroundColor: theme.surface, borderRadius: theme.radius.pill, paddingHorizontal: theme.space.sm, paddingVertical: theme.space.xs, maxWidth: '82%'}}><AppText size="caption" weight="bold" color={theme.primary} numberOfLines={1}>{badge}</AppText></View>}
          </View>
          <AppText weight="semibold" size="label" style={{marginTop: theme.space.md, minHeight: 37}} numberOfLines={2}>{name}</AppText>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.space.sm}}><AppText weight="bold" color={theme.primary}>{money(numberValue(item, 'priceInr'), language)}</AppText><AppIcon name="arrow" size={18} color={theme.primary} /></View>
        </Pressable>;
      })}
    </View>
  </View>;
});
