import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Pressable, View, type ViewToken} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {AppText, BackgroundBand, ErrorNotice, HomeSkeleton} from '../components/UI';
import type {LayoutSection} from '../domain/models';
import type {RootRoutes} from '../navigation/types';
import {useGetConfigQuery} from '../services/api';
import {isSupportedSection, RenderSection} from '../sections/registry';
import {useT} from '../localization/i18n';

const RevealBand = React.memo(function RevealBand({section, isVisible, parallax}: {
  section: LayoutSection; isVisible: boolean; parallax: Animated.AnimatedInterpolation<string | number>;
}) {
  const motion = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  useEffect(() => {
    if (isVisible) Animated.timing(motion, {toValue: 1, duration: 420, useNativeDriver: true}).start();
  }, [isVisible, motion]);
  if (!isSupportedSection(section.type)) return null;
  return <Animated.View style={{opacity: motion, transform: [{translateY: motion.interpolate({inputRange: [0, 1], outputRange: [24, 0]})}]}}>
    <BackgroundBand background={section.background}><RenderSection section={section} parallax={parallax} /></BackgroundBand>
  </Animated.View>;
});

export function HomeScreen() {
  const theme = useTheme(); const t = useT(); const navigation = useNavigation<NativeStackNavigationProp<RootRoutes>>();
  const config = useAppSelector(state => state.layout.current);
  const source = useAppSelector(state => state.layout.source);
  const {isLoading, isError, refetch} = useGetConfigQuery();
  const scrollY = useRef(new Animated.Value(0)).current;
  const parallax = useMemo(() => scrollY.interpolate({inputRange: [0, 220], outputRange: [0, -48], extrapolate: 'clamp'}), [scrollY]);
  const shrink = useMemo(() => scrollY.interpolate({inputRange: [0, 85], outputRange: [1, 0.83], extrapolate: 'clamp'}), [scrollY]);
  const titleOpacity = useMemo(() => scrollY.interpolate({inputRange: [0, 75], outputRange: [1, 0], extrapolate: 'clamp'}), [scrollY]);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const sections = useMemo(() => config.sections.filter(s => isSupportedSection(s.type)), [config]);
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 12, minimumViewTime: 70}).current;
  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    setVisible(prev => {
      const next = new Set(prev);
      viewableItems.forEach(item => { if (item.item?.id) next.add(item.item.id); });
      return next.size === prev.size ? prev : next;
    });
  }).current;
  useEffect(() => {setVisible(new Set(sections.slice(0, 2).map(item => item.id)));}, [sections]);
  const renderItem = useCallback(({item}: {item: LayoutSection}) => <RevealBand section={item} isVisible={visible.has(item.id)} parallax={parallax} />, [visible, parallax]);
  return <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: theme.background}}>
    <View style={{height: 83, paddingHorizontal: theme.space.lg, backgroundColor: theme.surface, justifyContent: 'center', borderBottomColor: theme.border, borderBottomWidth: 1, zIndex: 2}}>
      <Animated.View style={{transform: [{scale: shrink}], transformOrigin: 'left center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', gap: theme.space.md, alignItems: 'center'}}>
          <View style={{height: 46, width: 46, borderRadius: theme.radius.md, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center'}}><AppIcon name="heartPulse" color={theme.onPrimary} size={26} /></View>
          <View>
            <AppText weight="bold" size="title">tapza <AppText size="label" weight="medium" color={theme.secondary}>care</AppText></AppText>
            <Animated.View style={{opacity: titleOpacity, flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2}}><AppIcon name="pin" color={theme.textSecondary} size={12} /><AppText size="caption" color={theme.textSecondary}>{t('location')}</AppText></Animated.View>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('admin')} onPress={() => navigation.navigate('Admin')} style={{height: 48, width: 48, borderRadius: theme.radius.pill, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.muted}}><AppIcon name="settings" color={theme.primary} size={22} /></Pressable>
      </Animated.View>
    </View>
    {isError ? <ErrorNotice message={source === 'bundled' ? t('layoutOffline') : t('layoutCached')} onRetry={refetch} /> : null}
    {isLoading && source === 'bundled' ? <HomeSkeleton /> : <Animated.FlatList
      data={sections} keyExtractor={item => item.id} renderItem={renderItem}
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}
      scrollEventThrottle={16} removeClippedSubviews={false} windowSize={7}
      initialNumToRender={3} maxToRenderPerBatch={3}
      viewabilityConfig={viewabilityConfig} onViewableItemsChanged={onViewableItemsChanged}
      ListFooterComponent={<View style={{height: theme.space.xl}} />}
    />}
  </SafeAreaView>;
}
