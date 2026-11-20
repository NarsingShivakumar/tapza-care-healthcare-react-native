import {applyAfterPaint} from '../app/transitionTiming';

describe('visual transition sequencing', () => {
  it('does not start a language/theme mutation until the overlay has painted', async () => {
    const controls: {releasePaint?: () => void} = {};
    const paint = () => new Promise<void>(resolve => {controls.releasePaint = resolve;});
    const update = jest.fn(() => Promise.resolve('applied'));
    const result = applyAfterPaint(update, paint);

    expect(update).not.toHaveBeenCalled();
    controls.releasePaint?.();
    await expect(result).resolves.toBe('applied');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('propagates failures so the screen can roll back its previous selection', async () => {
    await expect(applyAfterPaint(() => {throw new Error('config failed');}, async () => undefined))
      .rejects.toThrow('config failed');
  });
});
