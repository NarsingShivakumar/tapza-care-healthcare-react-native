import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText} from '../components/UI';
import type {LayoutSection} from '../domain/models';
import type {RootRoutes} from '../navigation/types';
import {isRecord, stringValue, localizedValue} from './itemGuards';
import {useLanguage} from '../localization/i18n';
import {SectionTitle} from './shared';
export const CategorySection = React.memo(function CategorySection({section}: {section: LayoutSection}) {
  const theme = useTheme(); const language = useLanguage(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  return <View style={{paddingVertical: theme.space.xl}}>
    <View style={{paddingHorizontal: theme.space.lg}}><SectionTitle title={section.title} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: theme.space.lg, gap: theme.space.sm}}>
      {section.items.filter(isRecord).map((item, index) => {
        const label = localizedValue(item, 'label', language);
        if (!label) return null;
        return <Pressable key={stringValue(item, 'id', `${index}`)} onPress={() => navigation.navigate('Booking', {serviceId: stringValue(item, 'id'), serviceName: label})} accessibilityRole="button" style={({pressed}) => ({minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: theme.space.sm, borderRadius: theme.radius.pill, backgroundColor: theme.surface, paddingHorizontal: theme.space.md, borderWidth: 1, borderColor: theme.border, opacity: pressed ? 0.7 : 1})}>
          <View style={{width: 33, height: 33, borderRadius: 17, backgroundColor: theme.muted, justifyContent: 'center', alignItems: 'center'}}><AppIcon name={stringValue(item, 'icon', 'heart')} color={theme.primary} size={18} /></View>
          <AppText size="label" weight="semibold">{label}</AppText>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
});
