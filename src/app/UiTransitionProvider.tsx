import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, BackHandler, StyleSheet, View} from 'react-native';
import {useTheme} from './hooks';
import {AppLottie} from '../components/AppLottie';
import {AppText} from '../components/UI';
import {useT} from '../localization/i18n';
import {applyAfterPaint, waitForPaint} from './transitionTiming';

export type UiTransitionKind = 'language' | 'theme';
export type RunUiTransition = (kind: UiTransitionKind, operation: () => Promise<void> | void) => Promise<void>;

const UiTransitionContext = createContext<RunUiTransition | null>(null);
const MIN_VISIBLE_MS = 320;
const EXIT_MS = 120;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Lives above the navigator, so its overlay survives changes to language/theme and tab re-renders.
 * Wait two native frames before invoking any global Redux update. Lottie is driven natively.
 */
export function UiTransitionProvider({children}: {children: React.ReactNode}) {
  const theme = useTheme();
  const t = useT();
  const opacity = useRef(new Animated.Value(0)).current;
  const working = useRef(false);
  const [activeKind, setActiveKind] = useState<UiTransitionKind | null>(null);

  useEffect(() => {
    if (!activeKind) return;
    const animation = Animated.timing(opacity, {toValue: 1, duration: 125, useNativeDriver: true});
    animation.start();
    return () => animation.stop();
  }, [activeKind, opacity]);

  const runTransition = useCallback<RunUiTransition>(async (kind, operation) => {
    // Ignore double presses while an existing switch is in flight.
    if (working.current) return;
    working.current = true;
    const startedAt = Date.now();
    opacity.setValue(0);
    setActiveKind(kind);

    try {
      await applyAfterPaint(operation);
    } finally {
      // Keep the feedback visible just long enough to avoid flicker on fast devices.
      await sleep(Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt)));
      await waitForPaint();
      await new Promise<void>(resolve => {
        Animated.timing(opacity, {toValue: 0, duration: EXIT_MS, useNativeDriver: true})
          .start(() => resolve());
      });
      setActiveKind(null);
      working.current = false;
    }
  }, [opacity]);

  useEffect(() => {
    if (!activeKind) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => listener.remove();
  }, [activeKind]);

  const contextValue = useMemo(() => runTransition, [runTransition]);

  return (
    <UiTransitionContext.Provider value={contextValue}>
      <View style={styles.root}>
        {children}
        {activeKind && (
          <Animated.View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t(activeKind === 'language' ? 'switchingLanguage' : 'applyingTheme')}
            accessibilityLiveRegion="polite"
            style={[styles.overlay, {opacity, backgroundColor: theme.background}]}
          >
            <View style={[styles.panel, {backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radius.xl, padding: theme.space.xl}]}>
              <AppLottie fileName="loading" size={116} durationMs={950} loop decorative />
              <AppText size="title" weight="bold" style={styles.centered}>
                {t(activeKind === 'language' ? 'switchingLanguage' : 'applyingTheme')}
              </AppText>
              <AppText color={theme.textSecondary} size="label" style={styles.centered}>
                {t('transitionTip')}
              </AppText>
            </View>
          </Animated.View>
        )}
      </View>
    </UiTransitionContext.Provider>
  );
}

export function useUiTransition(): RunUiTransition {
  const value = useContext(UiTransitionContext);
  if (!value) throw new Error('useUiTransition must be used inside UiTransitionProvider');
  return value;
}

const styles = StyleSheet.create({
  root: {flex: 1},
  overlay: {...StyleSheet.absoluteFillObject, zIndex: 100, alignItems: 'center', justifyContent: 'center'},
  panel: {width: '82%', maxWidth: 350, borderWidth: 1, alignItems: 'center', gap: 12},
  centered: {textAlign: 'center'},
});
