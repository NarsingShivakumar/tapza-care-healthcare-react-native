import {getLottieSource, lottieAssets} from '../components/lottieRegistry';

describe('bundled Lottie animation registry', () => {
  it.each(['success', 'loading', 'error'] as const)('provides a valid JSON composition for %s', fileName => {
    const animation = getLottieSource(fileName);
    expect(animation).toBe(lottieAssets[fileName]);
    expect(animation.v).toMatch(/^5\./);
    expect(animation.w).toBeGreaterThan(0);
    expect(animation.h).toBeGreaterThan(0);
    expect(animation.fr).toBeGreaterThan(0);
    expect(animation.op).toBeGreaterThan(animation.ip);
    expect(animation.layers.length).toBeGreaterThan(0);
  });

  it('does not rely on computed require paths', () => {
    expect(Object.keys(lottieAssets)).toEqual(['success', 'loading', 'error']);
  });
});
