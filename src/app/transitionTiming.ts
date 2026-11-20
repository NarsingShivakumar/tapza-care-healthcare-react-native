/** Allow the overlay to commit and reach the native render thread before updating global UI state. */
export function waitForPaint(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function applyAfterPaint<T>(operation: () => T | Promise<T>, paint: () => Promise<void> = waitForPaint): Promise<T> {
  await paint();
  return operation();
}
