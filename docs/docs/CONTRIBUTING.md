# 贡献指南

## 📋 目录
- [行为准则](#code-of-conduct)
- [我该如何贡献？](#how-can-i-contribute)
- [拉取请求指南](#pull-request-guidelines)
- [编码标准](#coding-standards)
- [开发设置](#development-setup)
- [使用Docker进行部署](#docker-deployment-documentation)

---

## 行为准则

本项目及参与其中的每个人都受到我们的行为准则的约束。通过参与，您需遵守此准则。请向项目维护者举报不可接受的行为。

---

## 我该如何贡献？

### 🐞 报告错误和功能请求
- 查看问题跟踪器以避免重复
- 在可用时使用问题模板
- 包含尽可能多的相关信息
- 对于错误，添加重现问题的步骤

### 🔧 代码贡献
1.  Fork 仓库
2.  为您的功能/修复创建一个新分支
3.  编写代码
4.  提交拉取请求

### ✨ 成为核心贡献者
我们正在寻找专注的贡献者来帮助维护和发展该项目。如果您有兴趣成为核心贡献者，请填写我们的 [贡献者申请表](https://forms.gle/TBSteXSDCtBDwr5m7)。

---

## 拉取请求指南

### 📝 PR 清单
- [ ] 从主分支分支
- [ ] 如有需要更新文档
- [ ] 手动验证所有新功能按预期工作
- [ ] 保持拉取请求专注且原子化

### 👀 审核流程
1. 手动测试更改
2. 至少需要一名维护者审核
3. 处理所有审核意见
4. 保持干净的提交历史

---

## 编码标准

### 💻 一般指南
- 遵循现有的代码风格
- 注释复杂的逻辑
- 保持函数专注且简短
- 使用有意义的变量名

---

## 开发设置

### 🔄 初始化设置
1. 克隆仓库：
```bash
git clone https://github.com/stackblitz-labs/bolt.diy.git
```

2. 安装依赖项：
```bash
pnpm install
```

3. 设置环境变量：
   - 将 `.env.example` 重命名为 `.env.local`
   - 添加您的LLM API密钥（仅设置您计划使用的密钥）：
```bash
GROQ_API_KEY=XXX
HuggingFace_API_KEY=XXX
OPENAI_API_KEY=XXX
ANTHROPIC_API_KEY=XXX
...
```
   - 可选设置调试级别：
```bash
VITE_LOG_LEVEL=debug
```

   - 可选设置上下文大小：
```bash
DEFAULT_NUM_CTX=32768
```

以下是qwen2.5-coder:32b模型的示例上下文值：
 
* DEFAULT_NUM_CTX=32768 - 消耗36GB的显存
* DEFAULT_NUM_CTX=24576 - 消耗32GB的显存
* DEFAULT_NUM_CTX=12288 - 消耗26GB的显存
* DEFAULT_NUM_CTX=6144 - 消耗24GB的显存

**重要**：切勿将您的 `.env.local` 文件提交到版本控制。该文件已包含在 .gitignore 中。

### 🚀 运行开发服务器
```bash
pnpm run dev
```

**注意**：如果您使用Chrome，您需要Google Chrome Canary来在本地运行此程序！它安装简单，并且是一个适合Web开发的好浏览器。

---

## 测试

运行测试套件：

```bash
pnpm test
```

---

## 部署

将应用程序部署到Cloudflare Pages：

```bash
pnpm run deploy
```

确保您拥有必要的权限，并且Wrangler已为您的Cloudflare帐户正确配置。

---

# Docker部署文档

本指南概述了使用Docker构建和部署应用程序的各种方法。

## 构建方法

### 1. 使用助手脚本

提供了NPM脚本以便于构建：

```bash
# 开发构建
npm run dockerbuild

# 生产构建
npm run dockerbuild:prod
```

### 2. 直接Docker构建命令

您可以使用Docker的target功能来指定构建环境：

```bash
# 开发构建
docker build . --target bolt-ai-development

# 生产构建
docker build . --target bolt-ai-production
```

### 3. 带配置文件的Docker Compose

使用Docker Compose配置文件管理不同环境：

```bash
# 开发环境
docker-compose --profile development up

# 生产环境
docker-compose --profile production up
```

---

## 运行应用程序

使用上述任一方法构建后，使用以下命令运行容器：

```bash
# 开发
docker run -p 5173:5173 --env-file .env.local bolt-ai:development

# 生产
docker run -p 5173:5173 --env-file .env.local bolt-ai:production
```

---

## 使用Coolify进行部署

[Coolify](https://github.com/coollabsio/coolify)提供简单的部署流程：

1. 将您的Git仓库导入为新项目
2. 选择您的目标环境（开发/生产）
3. 选择“Docker Compose”作为构建包
4. 配置部署域名
5. 设置自定义启动命令：
   ```bash
   docker compose --profile production up
   ```
6. 配置环境变量
   - 添加必要的AI API密钥
   - 根据需要调整其他环境变量
7. 部署应用程序

---

## VS Code集成

`docker-compose.yaml`配置与VS Code开发容器兼容：

1. 在VS Code中打开命令面板
2. 选择开发容器配置
3. 从上下文菜单中选择“development”配置文件

---

## 环境文件

在运行容器之前，请确保您已配置适当的 `.env.local` 文件。该文件应包含：
- API密钥
- 特定于环境的配置
- 其他所需的环境变量

---

## DEFAULT_NUM_CTX

`DEFAULT_NUM_CTX`环境变量可用于限制qwen2.5-coder模型使用的最大上下文值数量。例如，要将上下文限制为24576个值（消耗32GB显存），请在您的 `.env.local` 文件中设置 `DEFAULT_NUM_CTX=24576`。

首先，感谢您考虑为bolt.diy做贡献！此分支旨在通过集成多个LLM提供者和增强功能，扩展原项目的能力。每一次贡献都有助于让bolt.diy成为全球开发人员更好的工具。

---

## 注意事项

- 5173端口已暴露并映射用于开发和生产环境
- 环境变量从 `.env.local` 加载
- 可以使用不同的配置文件（开发/生产）来应对不同的部署场景
- 配置支持本地开发和生产部署