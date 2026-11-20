import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../app/hooks';
import {AppText} from '../components/UI';
import type {LocalizedText} from '../domain/models';
import {useLocalizedText} from '../localization/i18n';
export function SectionTitle({title, subtitle}: {title?: LocalizedText; subtitle?: string}) {
  const theme = useTheme(); const localize = useLocalizedText();
  if (!title) return null;
  return <View style={{marginBottom: theme.space.lg, gap: theme.space.xs}}>
    <AppText size="title" weight="bold">{localize(title)}</AppText>
    {!!subtitle && <AppText color={theme.textSecondary} size="caption">{subtitle}</AppText>}
  </View>;
}
