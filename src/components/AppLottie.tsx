import React, {memo} from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import LottieView from 'lottie-react-native';
import {getLottieSource, type LottieFileName} from './lottieRegistry';

export type AppLottieProps = {
  /** Filename without .json from src/components/lottieRegistry.ts */
  fileName: LottieFileName;
  /** Width and height in dp; defaults to 140. */
  size?: number;
  /** Override the animation's playback duration (ms). Takes priority over speed. */
  durationMs?: number;
  /** Start automatically when mounted (default true). */
  autoPlay?: boolean;
  /** Repeat until unmounted (default false). Completion only fires with loop=false. */
  loop?: boolean;
  /** Playback speed, ignored when durationMs is set. */
  speed?: number;
  /** Contain, cover, or center the animation. */
  resizeMode?: 'contain' | 'cover' | 'center';
  /** Replays when this value changes, useful for retry or repeat controls. */
  replayKey?: string | number;
  /** Called once when a non-looping playback completes normally. */
  onFinish?: () => void;
  /** Called if Lottie reports a playback or composition error. */
  onError?: (error: string) => void;
  /** Optional outer container styling. */
  style?: StyleProp<ViewStyle>;
  /** Spoken label for accessibility services. */
  accessibilityLabel?: string;
  /** Hide decorative animations from accessibility services (default true). */
  decorative?: boolean;
};

/**
 * Pure presentation: it never changes a booking or decides business success.
 * Pass only animation names registered in src/components/lottieRegistry.ts.
 */
export const AppLottie = memo(function AppLottie({
  fileName,
  size = 140,
  durationMs,
  autoPlay = true,
  loop = false,
  speed = 1,
  resizeMode = 'contain',
  replayKey,
  onFinish,
  onError,
  style,
  accessibilityLabel,
  decorative = true,
}: AppLottieProps) {
  const handleFinish = (isCancelled: boolean) => {
    if (!isCancelled) onFinish?.();
  };

  return (
    <View
      style={[styles.container, {width: size, height: size}, style]}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}>
      <LottieView
        key={`${fileName}-${replayKey ?? 'initial'}-${autoPlay}`}
        source={getLottieSource(fileName)}
        style={styles.animation}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        duration={durationMs}
        resizeMode={resizeMode}
        onAnimationFinish={handleFinish}
        onAnimationFailure={onError}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {alignItems: 'center', justifyContent: 'center'},
  animation: {width: '100%', height: '100%'},
});
