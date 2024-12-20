export function unreachable(message: string): never {
  throw new Error(`不可到达: ${message}`);
}
