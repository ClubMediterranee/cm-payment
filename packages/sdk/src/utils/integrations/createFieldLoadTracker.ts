export const createFieldLoadTracker = (totalFields: number, onAllLoaded: () => void) => {
  let loadedCount = 0;

  return () => {
    loadedCount++;
    if (loadedCount === totalFields) {
      onAllLoaded();
    }
  };
};
