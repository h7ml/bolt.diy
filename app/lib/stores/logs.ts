import { atom, map } from 'nanostores';
import Cookies from 'js-cookie';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('LogStore');

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: Record<string, any>;
  category: 'system' | 'provider' | 'user' | 'error';
}

const MAX_LOGS = 1000; // 保留在内存中的最大日志数

class LogStore {
  private _logs = map<Record<string, LogEntry>>({});
  showLogs = atom(true);

  constructor() {
    // 在初始化时从 cookies 加载保存的日志
    this._loadLogs();
  }

  private _loadLogs() {
    const savedLogs = Cookies.get('eventLogs');

    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        this._logs.set(parsedLogs);
      } catch (error) {
        logger.error('无法从 cookies 解析日志:', error);
      }
    }
  }

  private _saveLogs() {
    const currentLogs = this._logs.get();
    Cookies.set('eventLogs', JSON.stringify(currentLogs));
  }

  private _generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private _trimLogs() {
    const currentLogs = Object.entries(this._logs.get());

    if (currentLogs.length > MAX_LOGS) {
      const sortedLogs = currentLogs.sort(
        ([, a], [, b]) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      const newLogs = Object.fromEntries(sortedLogs.slice(0, MAX_LOGS));
      this._logs.set(newLogs);
    }
  }

  addLog(
    message: string,
    level: LogEntry['level'] = 'info',
    category: LogEntry['category'] = 'system',
    details?: Record<string, any>,
  ) {
    const id = this._generateId();
    const entry: LogEntry = {
      id,
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      category,
    };

    this._logs.setKey(id, entry);
    this._trimLogs();
    this._saveLogs();

    return id;
  }

  // 系统事件
  logSystem(message: string, details?: Record<string, any>) {
    return this.addLog(message, 'info', 'system', details);
  }

  // 提供者事件
  logProvider(message: string, details?: Record<string, any>) {
    return this.addLog(message, 'info', 'provider', details);
  }

  // 用户行为
  logUserAction(message: string, details?: Record<string, any>) {
    return this.addLog(message, 'info', 'user', details);
  }

  // 错误事件
  logError(message: string, error?: Error | unknown, details?: Record<string, any>) {
    const errorDetails = {
      ...(details || {}),
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
    };
    return this.addLog(message, 'error', 'error', errorDetails);
  }

  // 警告事件
  logWarning(message: string, details?: Record<string, any>) {
    return this.addLog(message, 'warning', 'system', details);
  }

  // 调试事件
  logDebug(message: string, details?: Record<string, any>) {
    return this.addLog(message, 'debug', 'system', details);
  }

  clearLogs() {
    this._logs.set({});
    this._saveLogs();
  }

  getLogs() {
    return Object.values(this._logs.get()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  getFilteredLogs(level?: LogEntry['level'], category?: LogEntry['category'], searchQuery?: string) {
    return this.getLogs().filter((log) => {
      const matchesLevel = !level || level === 'debug' || log.level === level;
      const matchesCategory = !category || log.category === category;
      const matchesSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase());

      return matchesLevel && matchesCategory && matchesSearch;
    });
  }
}

export const logStore = new LogStore();
