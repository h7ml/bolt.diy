import { useStore } from '@nanostores/react';
import {
  isDebugMode,
  isEventLogsEnabled,
  isLocalModelsEnabled,
  LOCAL_PROVIDERS,
  promptStore,
  providersStore,
  latestBranchStore,
} from '~/lib/stores/settings';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import type { IProviderSetting, ProviderInfo } from '~/types/model';
import { logStore } from '~/lib/stores/logs'; // 假设 logStore 是从此位置导入的
import commit from '~/commit.json';

interface CommitData {
  commit: string;
  version?: string;
}

const commitJson: CommitData = commit;

export function useSettings() {
  const providers = useStore(providersStore);
  const debug = useStore(isDebugMode);
  const eventLogs = useStore(isEventLogsEnabled);
  const promptId = useStore(promptStore);
  const isLocalModel = useStore(isLocalModelsEnabled);
  const isLatestBranch = useStore(latestBranchStore);
  const [activeProviders, setActiveProviders] = useState<ProviderInfo[]>([]);

  // 检查我们是否在稳定版本中的函数
  const checkIsStableVersion = async () => {
    try {
      const stableResponse = await fetch(
        `https://raw.githubusercontent.com/stackblitz-labs/bolt.diy/refs/tags/v${commitJson.version}/app/commit.json`,
      );

      if (!stableResponse.ok) {
        console.warn('获取稳定提交信息失败');
        return false;
      }

      const stableData = (await stableResponse.json()) as CommitData;

      return commit.commit === stableData.commit;
    } catch (error) {
      console.warn('检查稳定版本时出错:', error);
      return false;
    }
  };

  // 在挂载时从 cookies 中读取值
  useEffect(() => {
    const savedProviders = Cookies.get('providers');

    if (savedProviders) {
      try {
        const parsedProviders: Record<string, IProviderSetting> = JSON.parse(savedProviders);
        Object.keys(parsedProviders).forEach((provider) => {
          const currentProvider = providers[provider];
          providersStore.setKey(provider, {
            ...currentProvider,
            settings: {
              ...parsedProviders[provider],
              enabled: parsedProviders[provider].enabled ?? true,
            },
          });
        });
      } catch (error) {
        console.error('从 cookies 中解析 providers 失败:', error);
      }
    }

    // 从 cookies 中加载调试模式
    const savedDebugMode = Cookies.get('isDebugEnabled');

    if (savedDebugMode) {
      isDebugMode.set(savedDebugMode === 'true');
    }

    // 从 cookies 中加载事件日志
    const savedEventLogs = Cookies.get('isEventLogsEnabled');

    if (savedEventLogs) {
      isEventLogsEnabled.set(savedEventLogs === 'true');
    }

    // 从 cookies 中加载本地模型
    const savedLocalModels = Cookies.get('isLocalModelsEnabled');

    if (savedLocalModels) {
      isLocalModelsEnabled.set(savedLocalModels === 'true');
    }

    const promptId = Cookies.get('promptId');

    if (promptId) {
      promptStore.set(promptId);
    }

    // 从 cookies 中加载最新分支设置或根据版本确定
    const savedLatestBranch = Cookies.get('isLatestBranch');
    let checkCommit = Cookies.get('commitHash');

    if (checkCommit === undefined) {
      checkCommit = commit.commit;
    }

    if (savedLatestBranch === undefined || checkCommit !== commit.commit) {
      // 如果用户未设置设置，检查版本
      checkIsStableVersion().then((isStable) => {
        const shouldUseLatest = !isStable;
        latestBranchStore.set(shouldUseLatest);
        Cookies.set('isLatestBranch', String(shouldUseLatest));
        Cookies.set('commitHash', String(commit.commit));
      });
    } else {
      latestBranchStore.set(savedLatestBranch === 'true');
    }
  }, []);

  // 在更改时向 cookies 写入值
  useEffect(() => {
    const providers = providersStore.get();
    const providerSetting: Record<string, IProviderSetting> = {};
    Object.keys(providers).forEach((provider) => {
      providerSetting[provider] = providers[provider].settings;
    });
    Cookies.set('providers', JSON.stringify(providerSetting));
  }, [providers]);

  useEffect(() => {
    let active = Object.entries(providers)
      .filter(([_key, provider]) => provider.settings.enabled)
      .map(([_k, p]) => p);

    if (!isLocalModel) {
      active = active.filter((p) => !LOCAL_PROVIDERS.includes(p.name));
    }

    setActiveProviders(active);
  }, [providers, isLocalModel]);

  // 更新设置的辅助函数
  const updateProviderSettings = useCallback(
    (provider: string, config: IProviderSetting) => {
      const settings = providers[provider].settings;
      providersStore.setKey(provider, { ...providers[provider], settings: { ...settings, ...config } });
    },
    [providers],
  );

  const enableDebugMode = useCallback((enabled: boolean) => {
    isDebugMode.set(enabled);
    logStore.logSystem(`调试模式 ${enabled ? '启用' : '禁用'}`);
    Cookies.set('isDebugEnabled', String(enabled));
  }, []);

  const enableEventLogs = useCallback((enabled: boolean) => {
    isEventLogsEnabled.set(enabled);
    logStore.logSystem(`事件日志 ${enabled ? '启用' : '禁用'}`);
    Cookies.set('isEventLogsEnabled', String(enabled));
  }, []);

  const enableLocalModels = useCallback((enabled: boolean) => {
    isLocalModelsEnabled.set(enabled);
    logStore.logSystem(`本地模型 ${enabled ? '启用' : '禁用'}`);
    Cookies.set('isLocalModelsEnabled', String(enabled));
  }, []);

  const setPromptId = useCallback((promptId: string) => {
    promptStore.set(promptId);
    Cookies.set('promptId', promptId);
  }, []);

  const enableLatestBranch = useCallback((enabled: boolean) => {
    latestBranchStore.set(enabled);
    logStore.logSystem(`主分支更新 ${enabled ? '启用' : '禁用'}`);
    Cookies.set('isLatestBranch', String(enabled));
  }, []);

  return {
    providers,
    activeProviders,
    updateProviderSettings,
    debug,
    enableDebugMode,
    eventLogs,
    enableEventLogs,
    isLocalModel,
    enableLocalModels,
    promptId,
    setPromptId,
    isLatestBranch,
    enableLatestBranch,
  };
}
