import React, { useState } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import type { ProviderInfo } from '~/types/model';

interface APIKeyManagerProps {
  provider: ProviderInfo;
  apiKey: string;
  setApiKey: (key: string) => void;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, apiKey, setApiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(tempKey);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start sm:items-center mt-2 mb-2 flex-col sm:flex-row">
      <div>
        <span className="text-sm text-bolt-elements-textSecondary">{provider?.name} API 密钥:</span>
        {!isEditing && (
          <div className="flex items-center mb-4">
            <span className="flex-1 text-xs text-bolt-elements-textPrimary mr-2">
              {apiKey ? '••••••••' : '未设置（如果在.env文件中设置仍然有效）'}
            </span>
            <IconButton onClick={() => setIsEditing(true)} title="编辑 API 密钥">
              <div className="i-ph:pencil-simple" />
            </IconButton>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-3 mt-2">
          <input
            type="password"
            value={tempKey}
            placeholder="您的 API 密钥"
            onChange={(e) => setTempKey(e.target.value)}
            className="flex-1 px-2 py-1 text-xs lg:text-sm rounded border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
          />
          <IconButton onClick={handleSave} title="保存 API 密钥">
            <div className="i-ph:check" />
          </IconButton>
          <IconButton onClick={() => setIsEditing(false)} title="取消">
            <div className="i-ph:x" />
          </IconButton>
        </div>
      ) : (
        <>
          {provider?.getApiKeyLink && (
            <IconButton className="ml-auto" onClick={() => window.open(provider?.getApiKeyLink)} title="编辑 API 密钥">
              <span className="mr-2 text-xs lg:text-sm">{provider?.labelForGetApiKey || '获取 API 密钥'}</span>
              <div className={provider?.icon || 'i-ph:key'} />
            </IconButton>
          )}
        </>
      )}
    </div>
  );
};
