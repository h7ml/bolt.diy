import { type ActionFunctionArgs } from '@remix-run/cloudflare';

//import { StreamingTextResponse, parseStreamPart } from 'ai';
import { streamText } from '~/lib/.server/llm/stream-text';
import { stripIndents } from '~/utils/stripIndent';
import type { IProviderSetting, ProviderInfo } from '~/types/model';

export async function action(args: ActionFunctionArgs) {
  return enhancerAction(args);
}

function parseCookies(cookieHeader: string) {
  const cookies: any = {};

  // 用分号和空格分割 cookie 字符串
  const items = cookieHeader.split(';').map((cookie) => cookie.trim());

  items.forEach((item) => {
    const [name, ...rest] = item.split('=');

    if (name && rest) {
      // 解码名称和值，如果值部分包含 '=' 则连接起来
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join('=').trim());
      cookies[decodedName] = decodedValue;
    }
  });

  return cookies;
}

async function enhancerAction({ context, request }: ActionFunctionArgs) {
  const { message, model, provider } = await request.json<{
    message: string;
    model: string;
    provider: ProviderInfo;
    apiKeys?: Record<string, string>;
  }>();

  const { name: providerName } = provider;

  // 验证 'model' 和 'provider' 字段
  if (!model || typeof model !== 'string') {
    throw new Response('无效或缺失的模型', {
      status: 400,
      statusText: '错误请求',
    });
  }

  if (!providerName || typeof providerName !== 'string') {
    throw new Response('无效或缺失的提供者', {
      status: 400,
      statusText: '错误请求',
    });
  }

  const cookieHeader = request.headers.get('Cookie');

  // 解析 cookie 的值（返回一个对象，如果 cookie 不存在则返回 null）
  const apiKeys = JSON.parse(parseCookies(cookieHeader || '').apiKeys || '{}');
  const providerSettings: Record<string, IProviderSetting> = JSON.parse(
    parseCookies(cookieHeader || '').providers || '{}',
  );

  try {
    const result = await streamText({
      messages: [
        {
          role: 'user',
          content:
            `[模型: ${model}]\n\n[提供者: ${providerName}]\n\n` +
            stripIndents`
            你是一名专业的提示工程师，专注于制定精确、有效的提示。
            你的任务是通过使提示更加具体、可操作和有效来增强提示。

            我希望你改进被 \`<original_prompt>\` 标签包裹的用户提示。

            对于有效的提示：
            - 使指示明确且毫不含糊
            - 添加相关的上下文和限制
            - 删除多余的信息
            - 保持核心意图
            - 确保提示是自给自足的
            - 使用专业语言

            对于无效或不清晰的提示：
            - 以清晰、专业的指导进行回应
            - 保持回应简洁且可操作
            - 保持有帮助、建设性的语气
            - 专注于用户应该提供什么
            - 使用标准模板以保持一致性

            重要提示：你的回应必须只包含增强后的提示文本。
            不要包含任何解释、元数据或包装标签。

            <original_prompt>
              ${message}
            </original_prompt>
          `,
        },
      ],
      env: context.cloudflare.env,
      apiKeys,
      providerSettings,
    });

    return new Response(result.textStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof Error && error.message?.includes('API key')) {
      throw new Response('无效或缺失的 API 密钥', {
        status: 401,
        statusText: '未授权',
      });
    }

    throw new Response(null, {
      status: 500,
      statusText: '内部服务器错误',
    });
  }
}
