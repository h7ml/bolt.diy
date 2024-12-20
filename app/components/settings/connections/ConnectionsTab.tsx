import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { logStore } from '~/lib/stores/logs';

interface GitHubUserResponse {
  login: string;
  id: number;
  [key: string]: any; // 用于其他我们不明确需要的属性
}

export default function ConnectionsTab() {
  const [githubUsername, setGithubUsername] = useState(Cookies.get('githubUsername') || '');
  const [githubToken, setGithubToken] = useState(Cookies.get('githubToken') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // 检查凭据是否存在并验证它们
    if (githubUsername && githubToken) {
      verifyGitHubCredentials();
    }
  }, []);

  const verifyGitHubCredentials = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as GitHubUserResponse;

        if (data.login === githubUsername) {
          setIsConnected(true);
          return true;
        }
      }

      setIsConnected(false);

      return false;
    } catch (error) {
      console.error('验证 GitHub 凭据时出错:', error);
      setIsConnected(false);

      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!githubUsername || !githubToken) {
      toast.error('请提供 GitHub 用户名和令牌');
      return;
    }

    setIsVerifying(true);

    const isValid = await verifyGitHubCredentials();

    if (isValid) {
      Cookies.set('githubUsername', githubUsername);
      Cookies.set('githubToken', githubToken);
      logStore.logSystem('GitHub 连接设置已更新', {
        username: githubUsername,
        hasToken: !!githubToken,
      });
      toast.success('GitHub 凭据已成功验证并保存！');
      Cookies.set('git:github.com', JSON.stringify({ username: githubToken, password: 'x-oauth-basic' }));
      setIsConnected(true);
    } else {
      toast.error('无效的 GitHub 凭据。请检查您的用户名和令牌。');
    }
  };

  const handleDisconnect = () => {
    Cookies.remove('githubUsername');
    Cookies.remove('githubToken');
    Cookies.remove('git:github.com');
    setGithubUsername('');
    setGithubToken('');
    setIsConnected(false);
    logStore.logSystem('GitHub 连接已移除');
    toast.success('GitHub 连接已成功移除！');
  };

  return (
    <div className="p-4 mb-4 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-3">
      <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">GitHub 连接</h3>
      <div className="flex mb-4">
        <div className="flex-1 mr-2">
          <label className="block text-sm text-bolt-elements-textSecondary mb-1">GitHub 用户名：</label>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            disabled={isVerifying}
            className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor disabled:opacity-50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-bolt-elements-textSecondary mb-1">个人访问令牌：</label>
          <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            disabled={isVerifying}
            className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor disabled:opacity-50"
          />
        </div>
      </div>
      <div className="flex mb-4 items-center">
        {!isConnected ? (
          <button
            onClick={handleSaveConnection}
            disabled={isVerifying || !githubUsername || !githubToken}
            className="bg-bolt-elements-button-primary-background rounded-lg px-4 py-2 mr-2 transition-colors duration-200 hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isVerifying ? (
              <>
                <div className="i-ph:spinner animate-spin mr-2" />
                验证中...
              </>
            ) : (
              '连接'
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="bg-bolt-elements-button-danger-background rounded-lg px-4 py-2 mr-2 transition-colors duration-200 hover:bg-bolt-elements-button-danger-backgroundHover text-bolt-elements-button-danger-text"
          >
            断开连接
          </button>
        )}
        {isConnected && (
          <span className="text-sm text-green-600 flex items-center">
            <div className="i-ph:check-circle mr-1" />
            已连接到 GitHub
          </span>
        )}
      </div>
    </div>
  );
}
