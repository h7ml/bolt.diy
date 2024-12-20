# 常见问题解答（FAQ）

<details>
<summary><strong>bolt.diy的最佳模型是什么？</strong></summary>

为了获得最佳的bolt.diy体验，我们推荐使用以下模型：

- **Claude 3.5 Sonnet（旧版）**：整体最佳编码器，在所有用例中提供优异的结果
- **Gemini 2.0 Flash**：在保持良好性能的同时具有卓越的速度
- **GPT-4o**：与Claude 3.5 Sonnet相比的强大替代品，具备可比的能力
- **DeepSeekCoder V2 236b**：最佳开源模型（可通过OpenRouter、DeepSeek API或自托管获取）
- **Qwen 2.5 Coder 32b**：最佳自托管模型，具有合理的硬件要求

**注意**：参数少于7b的模型通常缺乏与bolt正确交互的能力！
</details>

<details>
<summary><strong>我该如何获得最佳的bolt.diy结果？</strong></summary>

- **具体说明您的技术栈**：  
  在您的初始提示中提及您想使用的框架或库（如Astro、Tailwind、ShadCN）。这确保了bolt.diy根据您的偏好搭建项目。

- **使用增强提示图标**：  
  在发送提示之前，点击*增强*图标，让AI优化您的提示。您可以在提交之前编辑建议的改进内容。

- **先搭建基础，再添加功能**：  
  确保您的应用程序的基础结构到位后，再引入高级功能。这有助于bolt.diy建立一个坚实的基础。

- **批量处理简单指令**：  
  将简单任务组合成一个提示，以节省时间并减少API信用消耗。例如：  
  *“更改配色方案，添加移动响应功能，并重新启动开发服务器。”*
</details>

<details>
<summary><strong>我该如何为bolt.diy贡献？</strong></summary>

查看我们的[贡献指南](CONTRIBUTING.md)，了解如何参与的更多细节！
</details>

<details>
<summary><strong>bolt.diy的未来计划是什么？</strong></summary>

访问我们的[路线图](https://roadmap.sh/r/ottodev-roadmap-2ovzo)，了解最新动态。  
新的功能和改进正在进行中！
</details>

<details>
<summary><strong>为什么有这么多未解决的问题/拉取请求？</strong></summary>

bolt.diy最初是@ColeMedin的YouTube频道上的一个小型展示项目，旨在探索使用本地LLM编辑开源项目。然而，它迅速发展成为一个巨大的社区努力！  

我们正在组建一个维护团队，以管理需求并简化问题解决。维护者都是明星，我们还在探索合作伙伴关系，以帮助项目蓬勃发展。
</details>

<details>
<summary><strong>本地LLM与像Claude 3.5 Sonnet这样的大型模型相比，bolt.diy的效果如何？</strong></summary>

尽管本地LLM正在快速提高，但像GPT-4o、Claude 3.5 Sonnet和DeepSeek Coder V2 236b等大型模型仍为复杂应用提供最佳结果。我们持续专注于改善提示、代理和平台，以更好地支持较小的本地LLM。
</details>

<details>
<summary><strong>常见错误及故障排除</strong></summary>

### **“处理此请求时出错”**
这个通用错误消息意味着出现了问题。请检查：
- 终端（如果您使用Docker或`pnpm`启动了应用程序）。
- 浏览器中的开发者控制台（按`F12`或右键点击 > *检查*，然后转到*控制台*选项卡）。

### **“x-api-key头缺失”**
有时通过重新启动Docker容器可以解决此错误。  
如果仍然无效，请尝试从Docker切换到`pnpm`或反之亦然。我们正在积极调查此问题。

### **运行应用程序时预览为空**
空白预览通常是由于幻觉化的坏代码或错误命令导致的。  
要进行故障排除：
- 检查开发者控制台是否有错误。
- 请记住，预览是核心功能，因此应用程序没有损坏！我们正在努力使这些错误更加透明。

### **“一切正常，但结果不好”**
像Qwen-2.5-Coder这样的本地LLM在小型应用程序中很强大，但在大型项目中仍然是实验性的。为了获得更好的结果，请考虑使用更大型模型，如GPT-4o、Claude 3.5 Sonnet或DeepSeek Coder V2 236b。

### **“收到结构化异常 #0xc0000005：访问冲突”**
如果您收到此消息，您可能在Windows上。解决方案通常是更新[Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170)

### **“Windows中的Miniflare或Wrangler错误”**
您需要确保安装了最新版本的Visual Studio C++（14.40.33816），更多信息请查看https://github.com/stackblitz-labs/bolt.diy/issues/19。
</details>

---

还有其他问题吗？可以随时联系或在我们的GitHub仓库中打开一个问题！