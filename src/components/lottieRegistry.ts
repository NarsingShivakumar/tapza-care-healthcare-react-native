/**
 * Metro needs statically analyzable paths for bundled Lottie JSON files.
 * Put the actual JSON in <project>/assets/lottie and register it below.
 */
export const lottieAssets = {
  success: require('../assets/lottie/Checkmark.json'),
  loading: require('../assets/lottie/loading.json'),
  error: require('../assets/lottie/error.json'),
} as const;

export type LottieFileName = keyof typeof lottieAssets;

export function getLottieSource(fileName: LottieFileName) {
  return lottieAssets[fileName];
}
