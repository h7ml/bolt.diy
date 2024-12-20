export interface ITerminal {
  readonly cols?: number; // 列数，可选
  readonly rows?: number; // 行数，可选

  reset: () => void; // 重置终端
  write: (data: string) => void; // 写入数据
  onData: (cb: (data: string) => void) => void; // 注册数据回调
  input: (data: string) => void; // 输入数据
}
