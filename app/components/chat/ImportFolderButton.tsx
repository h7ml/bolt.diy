import React, { useState } from 'react';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { MAX_FILES, isBinaryFile, shouldIncludeFile } from '~/utils/fileUtils';
import { createChatFromFolder } from '~/utils/folderImport';
import { logStore } from '~/lib/stores/logs'; // 假设 logStore 从此位置导入

interface ImportFolderButtonProps {
  className?: string;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
}

export const ImportFolderButton: React.FC<ImportFolderButtonProps> = ({ className, importChat }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files || []);

    if (allFiles.length > MAX_FILES) {
      const error = new Error(`文件数量过多: ${allFiles.length}`);
      logStore.logError('文件导入失败 - 文件数量过多', error, {
        fileCount: allFiles.length,
        maxFiles: MAX_FILES,
      });
      toast.error(
        `该文件夹包含 ${allFiles.length.toLocaleString()} 个文件。该产品尚未针对非常大型项目进行优化。请选择一个包含少于 ${MAX_FILES.toLocaleString()} 个文件的文件夹。`,
      );

      return;
    }

    const folderName = allFiles[0]?.webkitRelativePath.split('/')[0] || '未知文件夹';
    setIsLoading(true);

    const loadingToast = toast.loading(`正在导入 ${folderName}...`);

    try {
      const filteredFiles = allFiles.filter((file) => shouldIncludeFile(file.webkitRelativePath));

      if (filteredFiles.length === 0) {
        const error = new Error('未找到有效文件');
        logStore.logError('文件导入失败 - 未找到有效文件', error, { folderName });
        toast.error('在所选文件夹中未找到文件');

        return;
      }

      const fileChecks = await Promise.all(
        filteredFiles.map(async (file) => ({
          file,
          isBinary: await isBinaryFile(file),
        })),
      );

      const textFiles = fileChecks.filter((f) => !f.isBinary).map((f) => f.file);
      const binaryFilePaths = fileChecks
        .filter((f) => f.isBinary)
        .map((f) => f.file.webkitRelativePath.split('/').slice(1).join('/'));

      if (textFiles.length === 0) {
        const error = new Error('未找到文本文件');
        logStore.logError('文件导入失败 - 未找到文本文件', error, { folderName });
        toast.error('在所选文件夹中未找到文本文件');

        return;
      }

      if (binaryFilePaths.length > 0) {
        logStore.logWarning(`导入过程中跳过二进制文件`, {
          folderName,
          binaryCount: binaryFilePaths.length,
        });
        toast.info(`跳过 ${binaryFilePaths.length} 个二进制文件`);
      }

      const messages = await createChatFromFolder(textFiles, binaryFilePaths, folderName);

      if (importChat) {
        await importChat(folderName, [...messages]);
      }

      logStore.logSystem('文件夹导入成功', {
        folderName,
        textFileCount: textFiles.length,
        binaryFileCount: binaryFilePaths.length,
      });
      toast.success('文件夹导入成功');
    } catch (error) {
      logStore.logError('导入文件夹失败', error, { folderName });
      console.error('导入文件夹失败:', error);
      toast.error('导入文件夹失败');
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
      e.target.value = ''; // 重置文件输入
    }
  };

  return (
    <>
      <input
        type="file"
        id="folder-import"
        className="hidden"
        webkitdirectory=""
        directory=""
        onChange={handleFileChange}
        {...({} as any)}
      />
      <button
        onClick={() => {
          const input = document.getElementById('folder-import');
          input?.click();
        }}
        className={className}
        disabled={isLoading}
      >
        <div className="i-ph:upload-simple" />
        {isLoading ? '正在导入...' : '导入文件夹'}
      </button>
    </>
  );
};
