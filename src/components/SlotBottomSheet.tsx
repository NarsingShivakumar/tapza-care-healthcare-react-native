import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Modal, PanResponder, Pressable, View} from 'react-native';
import {useTheme} from '../app/hooks';
import {AppText, EmptyState, ErrorNotice, PrimaryButton, Shimmer} from './UI';
import type {Slot} from '../domain/models';
import {formattedTime} from '../utils/date';
import {useLanguage, useT} from '../localization/i18n';

export function SlotBottomSheet({visible, dateLabel, slots, loading, error, onRetry, onDismiss, onConfirm}: {
  visible: boolean; dateLabel: string; slots?: Slot[]; loading: boolean;
  error?: string; onRetry: () => void; onDismiss: () => void; onConfirm: (slot: Slot) => void;
}) {
  const theme = useTheme(); const t = useT(); const language = useLanguage(); const [slotId, setSlotId] = useState<string>();
  const slide = useRef(new Animated.Value(500)).current;
  const dismiss = useRef(onDismiss); dismiss.current = onDismiss;
  useEffect(() => {
    if (visible) {setSlotId(undefined); slide.setValue(500); Animated.spring(slide, {toValue: 0, tension: 54, friction: 10, useNativeDriver: true}).start();}
  }, [visible, slide]);
  const drag = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
    onPanResponderMove: (_, gesture) => {if (gesture.dy > 0) slide.setValue(gesture.dy);},
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 110 || gesture.vy > 1.5) dismiss.current();
      else Animated.spring(slide, {toValue: 0, useNativeDriver: true}).start();
    },
  }), [slide]);
  const selected = slots?.find(slot => slot.id === slotId && slot.available);
  return <Modal animationType="none" visible={visible} transparent statusBarTranslucent onRequestClose={onDismiss}>
    <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: theme.overlay}}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('closeTimePicker')} style={{flex: 1}} onPress={onDismiss} />
      <Animated.View style={{backgroundColor: theme.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, paddingBottom: theme.space.xxl, transform: [{translateY: slide}]}}>
        <View {...drag.panHandlers} style={{minHeight: 46, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{width: 48, height: 5, borderRadius: 3, backgroundColor: theme.border}} />
        </View>
        <View style={{paddingHorizontal: theme.space.xl, paddingBottom: theme.space.lg}}><AppText size="heading" weight="bold">{t('pickTime')}</AppText><AppText color={theme.textSecondary} style={{marginTop: theme.space.xs}}>{dateLabel} · {t('slotsDuration')}</AppText></View>
        {loading ? <View style={{padding: theme.space.xl, gap: theme.space.md, flexDirection: 'row', flexWrap: 'wrap'}}>{[1, 2, 3, 4, 5, 6].map(item => <Shimmer key={item} height={54} width="30%" />)}</View> : null}
        {!!error && <ErrorNotice message={error} onRetry={onRetry} />}
        {!loading && !error && !slots?.length && <EmptyState icon="calendar" title={t('noSlotsTitle')} message={t('noSlots')} />}
        {!loading && !error && !!slots?.length && <View style={{paddingHorizontal: theme.space.xl, flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md}}>
          {slots.map(slot => {
            const active = slot.id === slotId; return <Pressable key={slot.id} accessibilityRole="button" accessibilityState={{selected: active, disabled: !slot.available}} disabled={!slot.available} onPress={() => setSlotId(slot.id)} style={{minWidth: '30%', minHeight: 53, flexGrow: 1, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.muted : theme.surface, opacity: slot.available ? 1 : 0.45}}>
              <AppText size="label" weight={active ? 'bold' : 'medium'} color={active ? theme.primary : theme.textPrimary}>{formattedTime(slot.startsAt, language)}</AppText>
              {!slot.available && <AppText size="caption" color={theme.textSecondary}>{t('unavailable')}</AppText>}
            </Pressable>;
          })}
        </View>}
        <View style={{paddingHorizontal: theme.space.xl, paddingTop: theme.space.xl}}><PrimaryButton label={t('confirmBooking')} disabled={!selected} onPress={() => {if (selected) onConfirm(selected);}} /></View>
      </Animated.View>
    </View>
  </Modal>;
}
