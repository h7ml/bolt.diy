import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { ITerminal } from '~/types/terminal';
import { withResolvers } from './promises';
import { atom } from 'nanostores';

export async function newShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
  const args: string[] = [];

  // 我们生成一个 JSH 进程，并在进程尚未附加到可见终端时提供备用的列和行
  const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
    terminal: {
      cols: terminal.cols ?? 80,
      rows: terminal.rows ?? 15,
    },
  });

  const input = process.input.getWriter();
  const output = process.output;

  const jshReady = withResolvers<void>();

  let isInteractive = false;
  output.pipeTo(
    new WritableStream({
      write(data) {
        if (!isInteractive) {
          const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

          if (osc === 'interactive') {
            // 等待直到我们看到交互式 OSC
            isInteractive = true;

            jshReady.resolve();
          }
        }

        terminal.write(data);
      },
    }),
  );

  terminal.onData((data) => {
    // console.log('terminal onData', { data, isInteractive });

    if (isInteractive) {
      input.write(data);
    }
  });

  await jshReady.promise;

  return process;
}

export type ExecutionResult = { output: string; exitCode: number } | undefined;

export class BoltShell {
  #initialized: (() => void) | undefined;
  #readyPromise: Promise<void>;
  #webcontainer: WebContainer | undefined;
  #terminal: ITerminal | undefined;
  #process: WebContainerProcess | undefined;
  executionState = atom<{ sessionId: string; active: boolean; executionPrms?: Promise<any> } | undefined>();
  #outputStream: ReadableStreamDefaultReader<string> | undefined;
  #shellInputStream: WritableStreamDefaultWriter<string> | undefined;

  constructor() {
    this.#readyPromise = new Promise((resolve) => {
      this.#initialized = resolve;
    });
  }

  ready() {
    return this.#readyPromise;
  }

  async init(webcontainer: WebContainer, terminal: ITerminal) {
    this.#webcontainer = webcontainer;
    this.#terminal = terminal;

    const { process, output } = await this.newBoltShellProcess(webcontainer, terminal);
    this.#process = process;
    this.#outputStream = output.getReader();
    await this.waitTillOscCode('interactive');
    this.#initialized?.();
  }

  get terminal() {
    return this.#terminal;
  }

  get process() {
    return this.#process;
  }

  async executeCommand(sessionId: string, command: string): Promise<ExecutionResult> {
    if (!this.process || !this.terminal) {
      return undefined;
    }

    const state = this.executionState.get();

    /*
     * 中断当前执行
     *  this.#shellInputStream?.write('\x03');
     */
    this.terminal.input('\x03');
    await this.waitTillOscCode('prompt');

    if (state && state.executionPrms) {
      await state.executionPrms;
    }

    // 启动一个新执行
    this.terminal.input(command.trim() + '\n');

    // 等待执行完成
    const executionPromise = this.getCurrentExecutionResult();
    this.executionState.set({ sessionId, active: true, executionPrms: executionPromise });

    const resp = await executionPromise;
    this.executionState.set({ sessionId, active: false });

    return resp;
  }

  async newBoltShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
    const args: string[] = [];

    // 我们生成一个 JSH 进程，并在进程尚未附加到可见终端时提供备用的列和行
    const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
      terminal: {
        cols: terminal.cols ?? 80,
        rows: terminal.rows ?? 15,
      },
    });

    const input = process.input.getWriter();
    this.#shellInputStream = input;

    const [internalOutput, terminalOutput] = process.output.tee();

    const jshReady = withResolvers<void>();

    let isInteractive = false;
    terminalOutput.pipeTo(
      new WritableStream({
        write(data) {
          if (!isInteractive) {
            const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

            if (osc === 'interactive') {
              // 等待直到我们看到交互式 OSC
              isInteractive = true;

              jshReady.resolve();
            }
          }

          terminal.write(data);
        },
      }),
    );

    terminal.onData((data) => {
      // console.log('terminal onData', { data, isInteractive });

      if (isInteractive) {
        input.write(data);
      }
    });

    await jshReady.promise;

    return { process, output: internalOutput };
  }

  async getCurrentExecutionResult(): Promise<ExecutionResult> {
    const { output, exitCode } = await this.waitTillOscCode('exit');
    return { output, exitCode };
  }

  async waitTillOscCode(waitCode: string) {
    let fullOutput = '';
    let exitCode: number = 0;

    if (!this.#outputStream) {
      return { output: fullOutput, exitCode };
    }

    const tappedStream = this.#outputStream;

    while (true) {
      const { value, done } = await tappedStream.read();

      if (done) {
        break;
      }

      const text = value || '';
      fullOutput += text;

      // 检查命令完成信号及退出代码
      const [, osc, , , code] = text.match(/\x1b\]654;([^\x07=]+)=?((-?\d+):(\d+))?\x07/) || [];

      if (osc === 'exit') {
        exitCode = parseInt(code, 10);
      }

      if (osc === waitCode) {
        break;
      }
    }

    return { output: fullOutput, exitCode };
  }
}

export function newBoltShellProcess() {
  return new BoltShell();
}
