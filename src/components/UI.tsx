import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator, Animated, ImageBackground, Pressable, ScrollView, StyleSheet,
  Text, View, type TextProps, type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../app/hooks';
import type {AppTheme} from '../theme/theme';
import type {LayoutBackground} from '../domain/models';
import {AppIcon} from './Icon';
import {useT} from '../localization/i18n';

export function AppText({children, size = 'body', weight = 'regular', color, style, ...rest}: TextProps & {
  size?: keyof AppTheme['font']; weight?: 'regular' | 'medium' | 'semibold' | 'bold'; color?: string;
}) {
  const theme = useTheme();
  const weights = {regular: '400', medium: '500', semibold: '600', bold: '700'} as const;
  return <Text allowFontScaling {...rest} style={[{fontSize: theme.font[size], fontWeight: weights[weight], color: color ?? theme.textPrimary, includeFontPadding: false}, style]}>{children}</Text>;
}
export function PrimaryButton({label, onPress, loading, disabled, icon, outlined = false, style}: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean; icon?: string; outlined?: boolean; style?: ViewStyle;
}) {
  const theme = useTheme();
  return <Pressable
    accessibilityRole="button" accessibilityLabel={label} disabled={disabled || loading} onPress={onPress}
    style={({pressed}) => ({
      minHeight: 52, borderRadius: theme.radius.md, backgroundColor: outlined ? theme.surface : theme.primary,
      borderColor: theme.primary, borderWidth: outlined ? 1 : 0, paddingHorizontal: theme.space.xl,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.space.sm,
      opacity: disabled ? 0.48 : pressed ? 0.84 : 1, ...style,
    })}>
    {loading ? <ActivityIndicator color={outlined ? theme.primary : theme.onPrimary} /> : <>
      {icon && <AppIcon name={icon} color={outlined ? theme.primary : theme.onPrimary} size={19} />}
      <AppText weight="semibold" color={outlined ? theme.primary : theme.onPrimary}>{label}</AppText>
    </>}
  </Pressable>;
}
export function Surface({children, style}: {children: React.ReactNode; style?: ViewStyle}) {
  const theme = useTheme();
  return <View style={[{backgroundColor: theme.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth}, style]}>{children}</View>;
}
export function BackHeader({title, subtitle, onBack}: {title: string; subtitle?: string; onBack: () => void}) {
  const theme = useTheme(); const t = useT();
  return <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md, gap: theme.space.md}}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('goBack')} hitSlop={8} onPress={onBack} style={{width: 48, height: 48, borderRadius: 24, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border}}>
      <AppIcon name="back" color={theme.textPrimary} />
    </Pressable>
    <View style={{flex: 1}}><AppText size="title" weight="bold">{title}</AppText>{!!subtitle && <AppText size="caption" color={theme.textSecondary} style={{marginTop: 3}}>{subtitle}</AppText>}</View>
  </View>;
}
export function EmptyState({icon, title, message, actionLabel, onAction}: {icon: string; title: string; message: string; actionLabel?: string; onAction?: () => void}) {
  const theme = useTheme();
  return <View style={{paddingVertical: theme.space.xxl * 2, paddingHorizontal: theme.space.xl, alignItems: 'center', justifyContent: 'center', gap: theme.space.md}}>
    <View style={{height: 76, width: 76, borderRadius: 38, backgroundColor: theme.muted, justifyContent: 'center', alignItems: 'center'}}><AppIcon name={icon} size={33} color={theme.primary} /></View>
    <AppText weight="bold" size="title" style={{textAlign: 'center'}}>{title}</AppText>
    <AppText style={{textAlign: 'center', lineHeight: 23}} color={theme.textSecondary}>{message}</AppText>
    {!!actionLabel && !!onAction && <PrimaryButton outlined style={{marginTop: theme.space.sm}} label={actionLabel} onPress={onAction} />}
  </View>;
}
export function ErrorNotice({message, onRetry}: {message: string; onRetry?: () => void}) {
  const theme = useTheme();
  return <View accessibilityRole="alert" style={{backgroundColor: theme.muted, borderRadius: theme.radius.md, margin: theme.space.md, padding: theme.space.md, borderLeftWidth: 3, borderLeftColor: theme.warning, flexDirection: 'row', gap: theme.space.md, alignItems: 'center'}}>
    <View style={{flex: 1}}><AppText size="label" color={theme.textPrimary}>{message}</AppText></View>
    {!!onRetry && <Pressable accessibilityRole="button" onPress={onRetry} style={{minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center'}}><AppIcon name="refresh" color={theme.primary} /></Pressable>}
  </View>;
}
export function Shimmer({height, width = '100%', borderRadius, style}: {height: number; width?: number | `${number}%`; borderRadius?: number; style?: ViewStyle}) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, {toValue: 0.9, duration: 700, useNativeDriver: true}),
      Animated.timing(opacity, {toValue: 0.4, duration: 700, useNativeDriver: true}),
    ])); animation.start(); return () => animation.stop();
  }, [opacity]);
  return <Animated.View style={[{height, width, borderRadius: borderRadius ?? theme.radius.md, backgroundColor: theme.border, opacity}, style]} />;
}
export function HomeSkeleton() {
  const theme = useTheme();
  return <ScrollView contentContainerStyle={{gap: theme.space.lg, padding: theme.space.lg}}>
    <Shimmer height={215} borderRadius={theme.radius.xl} />
    <Shimmer width="65%" height={22} />
    <View style={{flexDirection: 'row', gap: theme.space.sm}}>{[1, 2, 3].map(n => <Shimmer key={n} height={54} width="30%" />)}</View>
    <Shimmer width="55%" height={22} />
    <View style={{flexDirection: 'row', gap: theme.space.md}}><Shimmer height={145} width="48%" /><Shimmer height={145} width="48%" /></View>
  </ScrollView>;
}
export function BackgroundBand({background, children}: {background: LayoutBackground; children: React.ReactNode}) {
  const theme = useTheme();
  if (background.kind === 'gradient') {
    const pieces = background.value.split('|').filter(Boolean);
    const colors = pieces.length > 1 ? pieces : [theme.background, theme.muted];
    return <LinearGradient colors={colors as [string, string, ...string[]]}>{children}</LinearGradient>;
  }
  if (background.kind === 'image') {
    return <ImageBackground source={{uri: background.value}} resizeMode="cover" style={{backgroundColor: theme.muted}} imageStyle={{opacity: 0.25}}>{children}</ImageBackground>;
  }
  return <View style={{backgroundColor: background.value}}>{children}</View>;
}
