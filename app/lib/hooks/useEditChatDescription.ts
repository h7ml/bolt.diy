import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  chatId as chatIdStore,
  description as descriptionStore,
  db,
  updateChatDescription,
  getMessages,
} from '~/lib/persistence';

interface EditChatDescriptionOptions {
  initialDescription?: string;
  customChatId?: string;
  syncWithGlobalStore?: boolean;
}

type EditChatDescriptionHook = {
  editing: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => Promise<void>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
  currentDescription: string;
  toggleEditMode: () => void;
};

/**
 * Hook 用于管理编辑聊天描述的状态和行为。
 *
 * 提供功能：
 * - 在编辑模式和查看模式之间切换。
 * - 管理输入变化、失去焦点和表单提交事件。
 * - 将更新保存到 IndexedDB，并可选择保存到全局应用程序状态。
 *
 * @param {Object} options
 * @param {string} options.initialDescription - 当前聊天描述。
 * @param {string} options.customChatId - 可选的ID，通过侧边栏更新描述。
 * @param {boolean} options.syncWithGlobalStore - 标志以指示全局描述存储的同步。
 * @returns {EditChatDescriptionHook} 管理描述编辑的方法和状态。
 */
export function useEditChatDescription({
  initialDescription = descriptionStore.get()!,
  customChatId,
  syncWithGlobalStore,
}: EditChatDescriptionOptions): EditChatDescriptionHook {
  const chatIdFromStore = useStore(chatIdStore);
  const [editing, setEditing] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);

  const [chatId, setChatId] = useState<string>();

  useEffect(() => {
    setChatId(customChatId || chatIdFromStore);
  }, [customChatId, chatIdFromStore]);
  useEffect(() => {
    setCurrentDescription(initialDescription);
  }, [initialDescription]);

  const toggleEditMode = useCallback(() => setEditing((prev) => !prev), []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDescription(e.target.value);
  }, []);

  const fetchLatestDescription = useCallback(async () => {
    if (!db || !chatId) {
      return initialDescription;
    }

    try {
      const chat = await getMessages(db, chatId);
      return chat?.description || initialDescription;
    } catch (error) {
      console.error('获取最新描述失败:', error);
      return initialDescription;
    }
  }, [db, chatId, initialDescription]);

  const handleBlur = useCallback(async () => {
    const latestDescription = await fetchLatestDescription();
    setCurrentDescription(latestDescription);
    toggleEditMode();
  }, [fetchLatestDescription, toggleEditMode]);

  const isValidDescription = useCallback((desc: string): boolean => {
    const trimmedDesc = desc.trim();

    if (trimmedDesc === initialDescription) {
      toggleEditMode();
      return false; // 没有变化，跳过验证
    }

    const lengthValid = trimmedDesc.length > 0 && trimmedDesc.length <= 100;

    // 允许字母、数字、空格和常见标点，但排除可能导致问题的字符
    const characterValid = /^[a-zA-Z0-9\s\-_.,!?()[\]{}'"]+$/.test(trimmedDesc);

    if (!lengthValid) {
      toast.error('描述必须在1到100个字符之间。');
      return false;
    }

    if (!characterValid) {
      toast.error('描述只能包含字母、数字、空格和基本标点。');
      return false;
    }

    return true;
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!isValidDescription(currentDescription)) {
        return;
      }

      try {
        if (!db) {
          toast.error('聊天持久化不可用');
          return;
        }

        if (!chatId) {
          toast.error('聊天ID不可用');
          return;
        }

        await updateChatDescription(db, chatId, currentDescription);

        if (syncWithGlobalStore) {
          descriptionStore.set(currentDescription);
        }

        toast.success('聊天描述更新成功');
      } catch (error) {
        toast.error('更新聊天描述失败: ' + (error as Error).message);
      }

      toggleEditMode();
    },
    [currentDescription, db, chatId, initialDescription, customChatId],
  );

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        await handleBlur();
      }
    },
    [handleBlur],
  );

  return {
    editing,
    handleChange,
    handleBlur,
    handleSubmit,
    handleKeyDown,
    currentDescription,
    toggleEditMode,
  };
}
