import { getSystemPrompt } from './prompts/prompts';
import optimized from './prompts/optimized';

export interface PromptOptions {
  cwd: string;
  allowedHtmlElements: string[];
  modificationTagName: string;
}

export class PromptLibrary {
  static library: Record<
    string,
    {
      label: string;
      description: string;
      get: (options: PromptOptions) => string;
    }
  > = {
    default: {
      label: '默认提示',
      description: '这是经过严峻考验的默认系统提示',
      get: (options) => getSystemPrompt(options.cwd),
    },
    optimized: {
      label: '优化提示（实验性）',
      description: '为降低标记使用而设计的实验版本提示',
      get: (options) => optimized(options),
    },
  };
  static getList() {
    return Object.entries(this.library).map(([key, value]) => {
      const { label, description } = value;
      return {
        id: key,
        label,
        description,
      };
    });
  }
  static getPropmtFromLibrary(promptId: string, options: PromptOptions) {
    const prompt = this.library[promptId];

    if (!prompt) {
      throw '未找到提示';
    }

    return this.library[promptId]?.get(options);
  }
}
