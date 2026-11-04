import { createFieldLoadTracker } from './createFieldLoadTracker';

describe('createFieldLoadTracker', () => {
  it('should call onAllLoaded only when all fields are loaded', () => {
    const onAllLoaded = vi.fn();
    const onFieldLoaded = createFieldLoadTracker(3, onAllLoaded);

    onFieldLoaded();
    expect(onAllLoaded).not.toHaveBeenCalled();

    onFieldLoaded();
    expect(onAllLoaded).not.toHaveBeenCalled();

    onFieldLoaded();
    expect(onAllLoaded).toHaveBeenCalledTimes(1);
  });

  it('should call onAllLoaded immediately when totalFields is 1', () => {
    const onAllLoaded = vi.fn();
    const onFieldLoaded = createFieldLoadTracker(1, onAllLoaded);

    onFieldLoaded();
    expect(onAllLoaded).toHaveBeenCalledTimes(1);
  });

  it('should not call onAllLoaded multiple times', () => {
    const onAllLoaded = vi.fn();
    const onFieldLoaded = createFieldLoadTracker(2, onAllLoaded);

    onFieldLoaded();
    onFieldLoaded();
    onFieldLoaded();
    onFieldLoaded();

    expect(onAllLoaded).toHaveBeenCalledTimes(1);
  });

  it('should handle zero fields edge case', () => {
    const onAllLoaded = vi.fn();
    createFieldLoadTracker(0, onAllLoaded);

    expect(onAllLoaded).not.toHaveBeenCalled();
  });
});
