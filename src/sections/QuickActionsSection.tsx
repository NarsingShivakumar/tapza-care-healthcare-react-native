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
import {useLanguage} from '../localization/i18n';
import {SectionTitle} from './shared';
export const QuickActionsSection = React.memo(function QuickActionsSection({section}: {section: LayoutSection}) {
  const theme = useTheme(); const language = useLanguage(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const onAction = (id: string) => {
    if (id === 'book') navigation.navigate('Booking', {});
    else if (id === 'prescriptions') navigation.navigate('Tabs', {screen: 'prescriptions'});
    else if (id === 'reminders') navigation.navigate('Reminders');
    else navigation.navigate('Tabs', {screen: 'profile'});
  };
  return <View style={{padding: theme.space.lg, paddingVertical: theme.space.xl}}>
    <SectionTitle title={section.title} />
    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md}}>
      {section.items.filter(isRecord).map((item, index) => {
        const id = stringValue(item, 'id', `${index}`);
        return <Pressable key={id} onPress={() => onAction(id)} accessibilityRole="button" style={({pressed}) => ({width: '48%', minHeight: 112, flexGrow: 1, padding: theme.space.md, backgroundColor: theme.muted, borderRadius: theme.radius.lg, gap: theme.space.sm, opacity: pressed ? 0.8 : 1})}>
          <AppIcon name={stringValue(item, 'icon', 'heart')} color={theme.primary} size={25} />
          <AppText weight="semibold" size="label">{localizedValue(item, 'label', language)}</AppText>
          <AppText size="caption" color={theme.textSecondary}>{localizedValue(item, 'subtitle', language)}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
});
