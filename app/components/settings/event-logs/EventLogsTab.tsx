import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSettings } from '~/lib/hooks/useSettings';
import { toast } from 'react-toastify';
import { Switch } from '~/components/ui/Switch';
import { logStore, type LogEntry } from '~/lib/stores/logs';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';

export default function EventLogsTab() {
  const {} = useSettings();
  const showLogs = useStore(logStore.showLogs);
  const [logLevel, setLogLevel] = useState<LogEntry['level'] | 'all'>('info');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, forceUpdate] = useState({});

  const filteredLogs = useMemo(() => {
    const logs = logStore.getLogs();
    return logs.filter((log) => {
      const matchesLevel = !logLevel || log.level === logLevel || logLevel === 'all';
      const matchesSearch =
        !searchQuery ||
        log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.details)?.toLowerCase()?.includes(searchQuery?.toLowerCase());

      return matchesLevel && matchesSearch;
    });
  }, [logLevel, searchQuery]);

  // Effect to initialize showLogs
  useEffect(() => {
    logStore.showLogs.set(true);
  }, []);

  useEffect(() => {
    // 系统信息日志
    logStore.logSystem('应用程序已初始化', {
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV,
    });

    // 系统状态的调试日志
    logStore.logDebug('系统配置已加载', {
      runtime: 'Next.js',
      features: ['AI Chat', '事件日志记录'],
    });

    // 潜在问题的警告日志
    logStore.logWarning('资源使用阈值接近', {
      memoryUsage: '75%',
      cpuLoad: '60%',
    });

    // 带有详细上下文的错误日志
    logStore.logError('API 连接失败', new Error('连接超时'), {
      endpoint: '/api/chat',
      retryCount: 3,
      lastAttempt: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    const container = document.querySelector('.logs-container');

    if (container && autoScroll) {
      container.scrollTop = container.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleClearLogs = useCallback(() => {
    if (confirm('您确定要清除所有日志吗？')) {
      logStore.clearLogs();
      toast.success('日志成功清除');
      forceUpdate({}); // 清除日志后强制重新渲染
    }
  }, []);

  const handleExportLogs = useCallback(() => {
    try {
      const logText = logStore
        .getLogs()
        .map(
          (log) =>
            `[${log.level.toUpperCase()}] ${log.timestamp} - ${log.message}${
              log.details ? '\n详情: ' + JSON.stringify(log.details, null, 2) : ''
            }`,
        )
        .join('\n\n');

      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-logs-${new Date().toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('日志成功导出');
    } catch (error) {
      toast.error('导出日志失败');
      console.error('导出错误:', error);
    }
  }, []);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-bolt-elements-textPrimary';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex flex-col space-y-4 mb-4">
        {/* 标题和切换按钮行 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary">事件日志</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-bolt-elements-textSecondary whitespace-nowrap">显示操作</span>
              <Switch checked={showLogs} onCheckedChange={(checked) => logStore.showLogs.set(checked)} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-bolt-elements-textSecondary whitespace-nowrap">自动滚动</span>
              <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
            </div>
          </div>
        </div>

        {/* 控制行 */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value as LogEntry['level'])}
            className="flex-1 p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all lg:max-w-[20%] text-sm min-w-[100px]"
          >
            <option value="all">所有</option>
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
            <option value="debug">调试</option>
          </select>
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索日志..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
            />
          </div>
          {showLogs && (
            <div className="flex items-center gap-2 flex-nowrap">
              <button
                onClick={handleExportLogs}
                className={classNames(
                  'bg-bolt-elements-button-primary-background',
                  'rounded-lg px-4 py-2 transition-colors duration-200',
                  'hover:bg-bolt-elements-button-primary-backgroundHover',
                  'text-bolt-elements-button-primary-text',
                )}
              >
                导出日志
              </button>
              <button
                onClick={handleClearLogs}
                className={classNames(
                  'bg-bolt-elements-button-danger-background',
                  'rounded-lg px-4 py-2 transition-colors duration-200',
                  'hover:bg-bolt-elements-button-danger-backgroundHover',
                  'text-bolt-elements-button-danger-text',
                )}
              >
                清除日志
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-bolt-elements-bg-depth-1 rounded-lg p-4 h-[calc(100vh - 250px)] min-h-[400px] overflow-y-auto logs-container overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-bolt-elements-textSecondary py-8">未找到日志</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className="text-sm mb-3 font-mono border-b border-bolt-elements-borderColor pb-2 last:border-0"
            >
              <div className="flex items-start space-x-2 flex-wrap">
                <span className={`font-bold ${getLevelColor(log.level)} whitespace-nowrap`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-bolt-elements-textSecondary whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="text-bolt-elements-textPrimary break-all">{log.message}</span>
              </div>
              {log.details && (
                <pre className="mt-2 text-xs text-bolt-elements-textSecondary overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
