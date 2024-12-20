export function isMobile() {
  // 我们使用 sm: 作为移动设备的断点。目前设置为 640px
  return globalThis.innerWidth < 640;
}
