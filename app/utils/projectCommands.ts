import type { Message } from 'ai';
import { generateId } from './fileUtils';

export interface ProjectCommands {
  type: string;
  setupCommand: string;
  followupMessage: string;
}

interface FileContent {
  content: string;
  path: string;
}

export async function detectProjectCommands(files: FileContent[]): Promise<ProjectCommands> {
  const hasFile = (name: string) => files.some((f) => f.path.endsWith(name));

  if (hasFile('package.json')) {
    const packageJsonFile = files.find((f) => f.path.endsWith('package.json'));

    if (!packageJsonFile) {
      return { type: '', setupCommand: '', followupMessage: '' };
    }

    try {
      const packageJson = JSON.parse(packageJsonFile.content);
      const scripts = packageJson?.scripts || {};

      // 按优先顺序检查首选命令
      const preferredCommands = ['dev', 'start', 'preview'];
      const availableCommand = preferredCommands.find((cmd) => scripts[cmd]);

      if (availableCommand) {
        return {
          type: 'Node.js',
          setupCommand: `npm install && npm run ${availableCommand}`,
          followupMessage: `在 package.json 中找到 "${availableCommand}" 脚本。安装后将运行 "npm run ${availableCommand}"。`,
        };
      }

      return {
        type: 'Node.js',
        setupCommand: 'npm install',
        followupMessage: '您希望我检查 package.json 以确定运行此项目的可用脚本吗？',
      };
    } catch (error) {
      console.error('解析 package.json 时出错:', error);
      return { type: '', setupCommand: '', followupMessage: '' };
    }
  }

  if (hasFile('index.html')) {
    return {
      type: 'Static',
      setupCommand: 'npx --yes serve',
      followupMessage: '',
    };
  }

  return { type: '', setupCommand: '', followupMessage: '' };
}

export function createCommandsMessage(commands: ProjectCommands): Message | null {
  if (!commands.setupCommand) {
    return null;
  }

  return {
    role: 'assistant',
    content: `
<boltArtifact id="project-setup" title="项目设置">
<boltAction type="shell">
${commands.setupCommand}
</boltAction>
</boltArtifact>${commands.followupMessage ? `\n\n${commands.followupMessage}` : ''}`,
    id: generateId(),
    createdAt: new Date(),
  };
}
