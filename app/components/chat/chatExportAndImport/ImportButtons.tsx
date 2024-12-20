import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { ImportFolderButton } from '~/components/chat/ImportFolderButton';

export function ImportButtons(importChat: ((description: string, messages: Message[]) => Promise<void>) | undefined) {
  return (
    <div className="flex flex-col items-center justify-center w-auto">
      <input
        type="file"
        id="chat-import"
        className="hidden"
        accept=".json"
        onChange={async (e) => {
          const file = e.target.files?.[0];

          if (file && importChat) {
            try {
              const reader = new FileReader();

              reader.onload = async (e) => {
                try {
                  const content = e.target?.result as string;
                  const data = JSON.parse(content);

                  if (!Array.isArray(data.messages)) {
                    toast.error('无效的聊天文件格式');
                  }

                  await importChat(data.description, data.messages);
                  toast.success('聊天导入成功');
                } catch (error: unknown) {
                  if (error instanceof Error) {
                    toast.error('解析聊天文件失败: ' + error.message);
                  } else {
                    toast.error('解析聊天文件失败');
                  }
                }
              };
              reader.onerror = () => toast.error('读取聊天文件失败');
              reader.readAsText(file);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : '导入聊天失败');
            }
            e.target.value = ''; // 重置文件输入
          } else {
            toast.error('出现错误');
          }
        }}
      />
      <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const input = document.getElementById('chat-import');
              input?.click();
            }}
            className="px-4 py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-all flex items-center gap-2"
          >
            <div className="i-ph:upload-simple" />
            导入聊天
          </button>
          <ImportFolderButton
            importChat={importChat}
            className="px-4 py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-all flex items-center gap-2"
          />
        </div>
      </div>
    </div>
  );
}
