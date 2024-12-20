import React from 'react';
import { Switch } from '~/components/ui/Switch';
import { PromptLibrary } from '~/lib/common/prompt-library';
import { useSettings } from '~/lib/hooks/useSettings';

export default function FeaturesTab() {
  const {
    debug,
    enableDebugMode,
    isLocalModel,
    enableLocalModels,
    enableEventLogs,
    isLatestBranch,
    enableLatestBranch,
    promptId,
    setPromptId,
  } = useSettings();

  const handleToggle = (enabled: boolean) => {
    enableDebugMode(enabled);
    enableEventLogs(enabled);
  };

  return (
    <div className="p-4 bg-bolt-elements-bg-depth-2 border border-bolt-elements-borderColor rounded-lg mb-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">可选功能</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-bolt-elements-textPrimary">调试功能</span>
            <Switch className="ml-auto" checked={debug} onCheckedChange={handleToggle} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">使用主分支</span>
              <p className="text-sm text-bolt-elements-textSecondary">检查主分支的更新，而不是稳定版本</p>
            </div>
            <Switch className="ml-auto" checked={isLatestBranch} onCheckedChange={enableLatestBranch} />
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-bolt-elements-borderColor pt-4">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">实验功能</h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-4">声明：实验功能可能不稳定，并可能会有所更改。</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-bolt-elements-textPrimary">实验提供者</span>
          <Switch className="ml-auto" checked={isLocalModel} onCheckedChange={enableLocalModels} />
        </div>
        <div className="flex items-start justify-between pt-4 mb-2 gap-2">
          <div className="flex-1 max-w-[200px]">
            <span className="text-bolt-elements-textPrimary">提示库</span>
            <p className="text-sm text-bolt-elements-textSecondary mb-4">从库中选择一个提示作为系统提示。</p>
          </div>
          <select
            value={promptId}
            onChange={(e) => setPromptId(e.target.value)}
            className="flex-1 p-2 ml-auto rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all text-sm min-w-[100px]"
          >
            {PromptLibrary.getList().map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
