import React, { useEffect, useState } from 'react';
import { Switch } from '~/components/ui/Switch';
import { useSettings } from '~/lib/hooks/useSettings';
import { LOCAL_PROVIDERS, URL_CONFIGURABLE_PROVIDERS } from '~/lib/stores/settings';
import type { IProviderConfig } from '~/types/model';
import { logStore } from '~/lib/stores/logs';

// 导入默认后备图标
import DefaultIcon from '/icons/Default.svg'; // 根据需要调整路径
import { providerBaseUrlEnvKeys } from '~/utils/constants';

export default function ProvidersTab() {
  const { providers, updateProviderSettings, isLocalModel } = useSettings();
  const [filteredProviders, setFilteredProviders] = useState<IProviderConfig[]>([]);

  // 从 cookie 加载基本 URL
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let newFilteredProviders: IProviderConfig[] = Object.entries(providers).map(([key, value]) => ({
      ...value,
      name: key,
    }));

    if (searchTerm && searchTerm.length > 0) {
      newFilteredProviders = newFilteredProviders.filter((provider) =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (!isLocalModel) {
      newFilteredProviders = newFilteredProviders.filter((provider) => !LOCAL_PROVIDERS.includes(provider.name));
    }

    newFilteredProviders.sort((a, b) => a.name.localeCompare(b.name));

    // 将提供者分为常规和 URL 可配置
    const regular = newFilteredProviders.filter((p) => !URL_CONFIGURABLE_PROVIDERS.includes(p.name));
    const urlConfigurable = newFilteredProviders.filter((p) => URL_CONFIGURABLE_PROVIDERS.includes(p.name));

    setFilteredProviders([...regular, ...urlConfigurable]);
  }, [providers, searchTerm, isLocalModel]);

  const renderProviderCard = (provider: IProviderConfig) => {
    const envBaseUrlKey = providerBaseUrlEnvKeys[provider.name].baseUrlKey;
    const envBaseUrl = envBaseUrlKey ? import.meta.env[envBaseUrlKey] : undefined;
    const isUrlConfigurable = URL_CONFIGURABLE_PROVIDERS.includes(provider.name);

    return (
      <div
        key={provider.name}
        className="flex flex-col provider-item hover:bg-bolt-elements-bg-depth-3 p-4 rounded-lg border border-bolt-elements-borderColor"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={`/icons/${provider.name}.svg`}
              onError={(e) => {
                e.currentTarget.src = DefaultIcon;
              }}
              alt={`${provider.name} icon`}
              className="w-6 h-6 dark:invert"
            />
            <span className="text-bolt-elements-textPrimary">{provider.name}</span>
          </div>
          <Switch
            className="ml-auto"
            checked={provider.settings.enabled}
            onCheckedChange={(enabled) => {
              updateProviderSettings(provider.name, { ...provider.settings, enabled });

              if (enabled) {
                logStore.logProvider(`提供者 ${provider.name} 启用`, { provider: provider.name });
              } else {
                logStore.logProvider(`提供者 ${provider.name} 禁用`, { provider: provider.name });
              }
            }}
          />
        </div>
        {isUrlConfigurable && provider.settings.enabled && (
          <div className="mt-2">
            {envBaseUrl && (
              <label className="block text-xs text-bolt-elements-textSecondary text-green-300 mb-2">
                设置于 (.env) : {envBaseUrl}
              </label>
            )}
            <label className="block text-sm text-bolt-elements-textSecondary mb-2">
              {envBaseUrl ? '覆盖基本 URL' : '基本 URL '}:{' '}
            </label>
            <input
              type="text"
              value={provider.settings.baseUrl || ''}
              onChange={(e) => {
                let newBaseUrl: string | undefined = e.target.value;

                if (newBaseUrl && newBaseUrl.trim().length === 0) {
                  newBaseUrl = undefined;
                }

                updateProviderSettings(provider.name, { ...provider.settings, baseUrl: newBaseUrl });
                logStore.logProvider(`更新了 ${provider.name} 的基本 URL`, {
                  provider: provider.name,
                  baseUrl: newBaseUrl,
                });
              }}
              placeholder={`输入 ${provider.name} 的基本 URL`}
              className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
            />
          </div>
        )}
      </div>
    );
  };

  const regularProviders = filteredProviders.filter((p) => !URL_CONFIGURABLE_PROVIDERS.includes(p.name));
  const urlConfigurableProviders = filteredProviders.filter((p) => URL_CONFIGURABLE_PROVIDERS.includes(p.name));

  return (
    <div className="p-4">
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="搜索提供者..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
        />
      </div>

      {/* 常规提供者网格 */}
      <div className="grid grid-cols-2 gap-4 mb-8">{regularProviders.map(renderProviderCard)}</div>

      {/* 可配置 URL 的提供者部分 */}
      {urlConfigurableProviders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-bolt-elements-textPrimary">实验性提供者</h3>
          <p className="text-sm text-bolt-elements-textSecondary mb-4">
            这些提供者是实验性的，允许您本地运行 AI 模型或连接到您自己的基础设施。它们需要额外的设置，但提供更多灵活性。
          </p>
          <div className="space-y-4">{urlConfigurableProviders.map(renderProviderCard)}</div>
        </div>
      )}
    </div>
  );
}
