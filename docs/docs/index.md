# 欢迎来到 bolt diy
bolt.diy 允许您为每个提示选择使用的 LLM！目前，您可以使用 OpenAI、Anthropic、Ollama、OpenRouter、Gemini、LMStudio、Mistral、xAI、HuggingFace、DeepSeek 或 Groq 模型 - 并且可以轻松扩展以使用 Vercel AI SDK 支持的任何其他模型！请参阅下面的说明，以便在本地运行并扩展以包含更多模型。

## 目录
- [加入社区！](#join-the-community)
- [什么是 bolt.diy](#whats-boltdiy)
- [什么使 bolt.diy 与众不同](#what-makes-boltdiy-different)
- [设置](#setup)
- [使用 Docker 运行](#run-with-docker)
  - [使用辅助脚本](#1a-using-helper-scripts)
  - [直接 Docker 构建命令](#1b-direct-docker-build-commands-alternative-to-using-npm-scripts)
  - [使用配置文件的 Docker Compose 运行容器](#2-docker-compose-with-profiles-to-run-the-container)
- [无 Docker 运行](#run-without-docker)
- [添加新 LLM](#adding-new-llms)
- [可用脚本](#available-scripts)
- [开发](#development)
- [提示和技巧](#tips-and-tricks)

---

## 加入社区！

[加入社区！](https://thinktank.ottomator.ai)

---

## 什么是 bolt.diy

bolt.diy 是一个 AI 驱动的 Web 开发代理，允许您直接从浏览器提示、运行、编辑和部署全栈应用程序 - 无需本地设置。如果您希望使用 Bolt 开源代码库构建自己的 AI 驱动的 Web 开发代理，[点击此处开始！](./CONTRIBUTING.md)

---

## 什么使 bolt.diy 与众不同

Claude、v0 等都是令人惊叹的 - 但您无法安装包、运行后端或编辑代码。这就是 bolt.diy 脱颖而出的地方：

- **浏览器中的全栈**：bolt.diy 将尖端 AI 模型与由 **StackBlitz 的 WebContainers** 提供支持的浏览器内开发环境集成。这使您能够：
  - 安装并运行 npm 工具和库（如 Vite、Next.js 等）
  - 运行 Node.js 服务器
  - 与第三方 API 交互
  - 从聊天中部署到生产环境
  - 通过 URL 分享您的工作

- **具有环境控制的 AI**：与传统开发环境不同，AI 只能协助代码生成，bolt.diy 使 AI 模型对整个环境（包括文件系统、节点服务器、包管理器、终端和浏览器控制台）具有 **完全控制权**。这使 AI 代理能够处理整个应用生命周期 - 从创建到部署。

无论您是经验丰富的开发人员、PM 还是设计师，bolt.diy 都允许您轻松构建生产级全栈应用程序。

对于希望使用 WebContainers 构建自己的 AI 驱动开发工具的开发人员，请查看此代码库中的开源 Bolt 代码库！

---

## 设置

许多人是从 GitHub 安装软件的新用户。如果您在安装过程中遇到任何问题，请使用上述链接提交“问题”或通过分叉、编辑说明并进行拉取请求来增强此文档。

1. [从这里安装 Git](https://git-scm.com/downloads)

2. [从这里安装 Node.js](https://nodejs.org/en/download/)

安装完成后请注意安装程序的说明。

在所有操作系统上，Node.js 的路径应自动添加到您的系统路径中。但如果您想确保，可以检查您的路径。在 Windows 上，您可以在系统中搜索“编辑系统环境变量”，在系统属性中选择“环境变量...”，然后检查“Path”系统变量中是否有指向 Node 的路径。在 Mac 或 Linux 机器上，它会告诉您检查 /usr/local/bin 是否在您的 $PATH 中。要确定 usr/local/bin 是否包含在 $PATH 中，请打开您的终端并运行：

```
echo $PATH .
```

如果在输出中看到 usr/local/bin，那么您就可以继续了。

3. 通过打开终端窗口（或带有管理员权限的 CMD）并输入以下指令来克隆仓库（如果您还没有）：

```
git clone https://github.com/stackblitz-labs/bolt.diy.git
```

4. 将 .env.example 重命名为 .env.local 并添加您的 LLM API 密钥。您会在 Mac 的 "[your name]/bolt.diy/.env.example" 找到此文件。对于 Windows 和 Linux，路径将类似。

![image](https://github.com/user-attachments/assets/7e6a532c-2268-401f-8310-e8d20c731328)

如果您看不到上述指示的文件，可能是您无法查看隐藏文件。在 Mac 上，打开终端窗口并输入以下命令。在 Windows 上，您将在文件资源管理器设置中看到隐藏文件选项。如果您在这里遇到问题，可以通过快速 Google 搜索来找到帮助。

```
defaults write com.apple.finder AppleShowAllFiles YES
```

**注意**：您只需设置要使用的密钥，Ollama 不需要 API 密钥，因为它在您的计算机上本地运行：

[在此处获取您的 GROQ API 密钥](https://console.groq.com/keys)

[按照这些说明获取您的 Open AI API 密钥](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key)

在您的 [帐户设置](https://console.anthropic.com/settings/keys) 中获取您的 Anthropic API 密钥

```
GROQ_API_KEY=XXX
OPENAI_API_KEY=XXX
ANTHROPIC_API_KEY=XXX
```

可选地，您可以设置调试级别：

```
VITE_LOG_LEVEL=debug
```

**重要**：绝不要将您的 `.env.local` 文件提交到版本控制中。它已经包含在 .gitignore 中。

## 使用 Docker 运行

先决条件：

如上所述需要 Git 和 Node.js，以及 Docker: https://www.docker.com/

### 1a. 使用辅助脚本

提供了 NPM 脚本以方便构建：

```bash
# 开发构建
npm run dockerbuild

# 生产构建
npm run dockerbuild:prod
```

### 1b. 直接 Docker 构建命令（替代使用 NPM 脚本）

如果需要，您可以使用 Docker 的目标功能来指定构建环境，而不是使用 NPM 脚本：

```bash
# 开发构建
docker build . --target bolt-ai-development

# 生产构建
docker build . --target bolt-ai-production
```

### 2. 使用配置文件的 Docker Compose 运行容器

使用 Docker Compose 配置文件来管理不同环境：

```bash
# 开发环境
docker-compose --profile development up

# 生产环境
docker-compose --profile production up
```

当您使用开发配置文件运行 Docker Compose 命令时，您在机器上对代码所做的任何更改将反映在运行在容器上的网站中（即热加载仍然适用！）。

---

## 无 Docker 运行

1. 使用终端（或在 Windows 中具有管理员权限的 CMD）安装依赖项：

```
pnpm install
```

如果您收到“找不到命令：pnpm”或类似的错误，这意味着 pnpm 尚未安装。您可以通过以下命令安装：

```
sudo npm install -g pnpm
```

2. 使用以下命令启动应用程序：

```bash
pnpm run dev
```

---

## 添加新 LLM：

要使新的 LLM 在此版本的 bolt.diy 中可用，请转到 `app/utils/constants.ts` 并找到常量 MODEL_LIST。此数组中的每个元素都是一个对象，包含模型 ID 作为名称（从提供程序的 API 文档获取），前端模型下拉列表的标签以及提供程序。

默认情况下，Anthropic、OpenAI、Groq 和 Ollama 被实现为提供程序，但此代码库的 YouTube 视频涵盖了如何扩展其以适用于更多提供程序的内容，您可以自行使用！

当您将新的模型添加到 MODEL_LIST 数组中时，它会立即在您本地运行应用程序或重新加载时可用。对于 Ollama 模型，请确保您已安装该模型，然后再尝试在此处使用它！

---

## 可用脚本

- `pnpm run dev`: 启动开发服务器。
- `pnpm run build`: 构建项目。
- `pnpm run start`: 使用 Wrangler Pages 本地运行构建的应用程序。此脚本使用 `bindings.sh` 设置必要的绑定，以便您无需重复环境变量。
- `pnpm run preview`: 构建项目，然后启动本地，方便测试生产构建。请注意，HTTP 流式传输目前在 `wrangler pages dev` 上无法按预期工作。
- `pnpm test`: 使用 Vitest 运行测试套件。
- `pnpm run typecheck`: 运行 TypeScript 类型检查。
- `pnpm run typegen`: 使用 Wrangler 生成 TypeScript 类型。
- `pnpm run deploy`: 构建项目并将其部署到 Cloudflare Pages。

---

## 开发

要启动开发服务器：

```bash
pnpm run dev
```

这将启动 Remix Vite 开发服务器。如果您使用 Chrome，则需要 Google Chrome Canary 在本地运行！这是一种简单的安装方式，并且是进行 Web 开发的好浏览器。

---

## 提示和技巧

以下是一些建议，以充分利用 bolt.diy：

- **明确您的技术栈**：如果您想使用特定的框架或库（如 Astro、Tailwind、ShadCN 或任何其他流行的 JavaScript 框架），请在初始提示中提及它们，以确保 Bolt 根据要求构建项目。

- **使用增强提示图标**：在发送提示之前，尝试点击‘增强’图标，让 AI 模型帮助您完善提示，然后在提交之前编辑结果。

- **先构建基础结构，然后添加功能**：确保您的应用程序的基本结构到位，然后再深入更高级的功能。这有助于 Bolt 理解您项目的基础，并确保在构建更复杂的功能之前一切都有条不紊。

- **批量处理简单指令**：通过将简单指令合并为一条消息来节省时间。例如，您可以要求 Bolt 更改配色方案、添加移动响应性并重新启动开发服务器，所有这些都可以一次性完成，从而节省大量时间并显著减少 API 使用量。