import { useNavigate } from '@remix-run/react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { db, deleteById, getAll } from '~/lib/persistence';
import { classNames } from '~/utils/classNames';
import styles from '~/components/settings/Settings.module.scss';
import { logStore } from '~/lib/stores/logs'; // 导入 logStore 以进行事件记录

export default function ChatHistoryTab() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const downloadAsJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllChats = async () => {
    const confirmDelete = window.confirm('您确定要删除所有聊天记录吗？此操作无法撤销。');

    if (!confirmDelete) {
      return; // 如果用户取消，退出
    }

    if (!db) {
      const error = new Error('数据库不可用');
      logStore.logError('删除聊天记录失败 - 数据库不可用', error);
      toast.error('数据库不可用');

      return;
    }

    try {
      setIsDeleting(true);

      const allChats = await getAll(db);
      await Promise.all(allChats.map((chat) => deleteById(db!, chat.id)));
      logStore.logSystem('所有聊天记录成功删除', { count: allChats.length });
      toast.success('所有聊天记录成功删除');
      navigate('/', { replace: true });
    } catch (error) {
      logStore.logError('删除聊天记录失败', error);
      toast.error('删除聊天记录失败');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAllChats = async () => {
    if (!db) {
      const error = new Error('数据库不可用');
      logStore.logError('导出聊天记录失败 - 数据库不可用', error);
      toast.error('数据库不可用');

      return;
    }

    try {
      const allChats = await getAll(db);
      const exportData = {
        chats: allChats,
        exportDate: new Date().toISOString(),
      };

      downloadAsJson(exportData, `all-chats-${new Date().toISOString()}.json`);
      logStore.logSystem('聊天记录成功导出', { count: allChats.length });
      toast.success('聊天记录成功导出');
    } catch (error) {
      logStore.logError('导出聊天记录失败', error);
      toast.error('导出聊天记录失败');
      console.error(error);
    }
  };

  return (
    <>
      <div className="p-4">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">聊天记录</h3>
        <button
          onClick={handleExportAllChats}
          className={classNames(
            'bg-bolt-elements-button-primary-background',
            'rounded-lg px-4 py-2 mb-4 transition-colors duration-200',
            'hover:bg-bolt-elements-button-primary-backgroundHover',
            'text-bolt-elements-button-primary-text',
          )}
        >
          导出所有聊天记录
        </button>

        <div
          className={classNames('text-bolt-elements-textPrimary rounded-lg py-4 mb-4', styles['settings-danger-area'])}
        >
          <h4 className="font-semibold">危险区域</h4>
          <p className="mb-2">此操作无法撤销！</p>
          <button
            onClick={handleDeleteAllChats}
            disabled={isDeleting}
            className={classNames(
              'bg-bolt-elements-button-danger-background',
              'rounded-lg px-4 py-2 transition-colors duration-200',
              isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bolt-elements-button-danger-backgroundHover',
              'text-bolt-elements-button-danger-text',
            )}
          >
            {isDeleting ? '删除中...' : '删除所有聊天记录'}
          </button>
        </div>
      </div>
    </>
  );
}
