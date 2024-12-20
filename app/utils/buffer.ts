export function bufferWatchEvents<T extends unknown[]>(timeInMs: number, cb: (events: T[]) => unknown) {
  let timeoutId: number | undefined;
  let events: T[] = [];

  // Track the previous batch's processing so we can wait for it
  let processing: Promise<unknown> = Promise.resolve();

  const scheduleBufferTick = () => {
    timeoutId = self.setTimeout(async () => {
      // We wait until the previous batch is fully processed to handle events in order
      await processing;

      if (events.length > 0) {
        processing = Promise.resolve(cb(events));
      }

      timeoutId = undefined;
      events = [];
    }, timeInMs);
  };

  return (...args: T) => {
    events.push(args);

    if (!timeoutId) {
      scheduleBufferTick();
    }
  };
}
