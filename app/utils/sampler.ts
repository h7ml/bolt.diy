/**
 * 创建一个函数，该函数以规则时间间隔对调用进行采样并捕获尾随调用。
 * - 丢弃在采样间隔之间发生的调用
 * - 如果可用，则每个采样间隔取一个调用
 * - 如果在间隔内没有调用，则捕获最后一次调用
 *
 * @param fn 要采样的函数
 * @param sampleInterval 采样调用的频率（毫秒）
 * @returns 采样后的函数
 */
export function createSampler<T extends (...args: any[]) => any>(fn: T, sampleInterval: number): T {
  let lastArgs: Parameters<T> | null = null;
  let lastTime = 0;
  let timeout: NodeJS.Timeout | null = null;

  // 创建一个与输入函数具有相同类型的函数
  const sampled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;

    // 如果在采样间隔内，仅存储参数
    if (now - lastTime < sampleInterval) {
      // 如果尚未设置尾随调用，则设置
      if (!timeout) {
        timeout = setTimeout(
          () => {
            timeout = null;
            lastTime = Date.now();

            if (lastArgs) {
              fn.apply(this, lastArgs);
              lastArgs = null;
            }
          },
          sampleInterval - (now - lastTime),
        );
      }

      return;
    }

    // 如果在间隔外，立即执行
    lastTime = now;
    fn.apply(this, args);
    lastArgs = null;
  } as T;

  return sampled;
}
