export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
  source?: string;
}

export interface LogTransport {
  name: string;
  log(entry: LogEntry): void | Promise<void>;
  getLogs?(): LogEntry[] | Promise<LogEntry[]>;
  clear?(): void | Promise<void>;
}

/**
 * In-memory transport for session logs
 */
export class MemoryTransport implements LogTransport {
  name = "memory";
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(maxLogs = 1000) {
    this.maxLogs = maxLogs;
  }

  log(entry: LogEntry): void {
    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

/**
 * LocalStorage transport for persistent logs
 */
export class LocalStorageTransport implements LogTransport {
  name = "localStorage";
  private storageKey: string;
  private maxLogs: number;

  constructor(storageKey = "app_logs", maxLogs = 500) {
    this.storageKey = storageKey;
    this.maxLogs = maxLogs;
  }

  log(entry: LogEntry): void {
    try {
      const existingLogs = this.getLogs();
      existingLogs.push(entry);

      const logsToStore = existingLogs.slice(-this.maxLogs);

      localStorage.setItem(this.storageKey, JSON.stringify(logsToStore));
    } catch (error) {
      console.warn("Failed to write to localStorage:", error);
    }
  }

  getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      return [];
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }
}

/**
 * Console transport for development
 */
export class ConsoleTransport implements LogTransport {
  name = "console";
  private enableColors: boolean;

  constructor(enableColors = true) {
    this.enableColors = enableColors;
  }

  log(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const source = entry.source ? `[${entry.source}]` : "";
    const message = `${timestamp} ${source} ${entry.message}`;

    if (this.enableColors && typeof window !== "undefined") {
      // Browser console with colors
      const color = this.getLogColor(entry.level);
      console.log(
        `%c${this.getLevelName(entry.level)}%c ${message}`,
        `color: ${color}; font-weight: bold`,
        "color: inherit",
        entry.data || ""
      );
    } else {
      // Plain console output
      const levelName = this.getLevelName(entry.level);
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(`[${levelName}] ${message}`, entry.data || "");
          break;
        case LogLevel.INFO:
          console.info(`[${levelName}] ${message}`, entry.data || "");
          break;
        case LogLevel.WARN:
          console.warn(`[${levelName}] ${message}`, entry.data || "");
          break;
        case LogLevel.ERROR:
          console.error(`[${levelName}] ${message}`, entry.data || "");
          break;
        default:
          console.log(`[UNKNOWN] ${message}`, entry.data || "");
          break;
      }
    }
  }

  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "DEBUG";
      case LogLevel.INFO:
        return "INFO";
      case LogLevel.WARN:
        return "WARN";
      case LogLevel.ERROR:
        return "ERROR";
      default:
        return "UNKNOWN";
    }
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "#6b7280";
      case LogLevel.INFO:
        return "#3b82f6";
      case LogLevel.WARN:
        return "#f59e0b";
      case LogLevel.ERROR:
        return "#ef4444";
      default:
        return "#000000";
    }
  }
}

/**
 * Main Logger class
 */
export class Logger {
  private transports: LogTransport[] = [];
  private minLevel: LogLevel = LogLevel.INFO;
  private source?: string;

  constructor(source?: string) {
    this.source = source;
  }

  /**
   * Add a transport to the logger
   */
  addTransport(transport: LogTransport): Logger {
    this.transports.push(transport);
    return this;
  }

  /**
   * Remove a transport by name
   */
  removeTransport(name: string): Logger {
    this.transports = this.transports.filter((t) => t.name !== name);
    return this;
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): Logger {
    this.minLevel = level;
    return this;
  }

  /**
   * Set source identifier
   */
  setSource(source: string): Logger {
    this.source = source;
    return this;
  }

  /**
   * Log a message
   */
  private async log(
    level: LogLevel,
    message: string,
    data?: unknown
  ): Promise<void> {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      source: this.source,
    };

    const transportPromises = this.transports.map(async (transport) => {
      try {
        await transport.log(entry);
      } catch (error) {
        console.error(`Transport ${transport.name} failed:`, error);
      }
    });

    await Promise.all(transportPromises);
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: unknown): Promise<void> {
    return this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: unknown): Promise<void> {
    return this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown): Promise<void> {
    return this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, data?: unknown): Promise<void> {
    return this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Get logs from all transports that support it
   */
  async getLogs(): Promise<{ [transportName: string]: LogEntry[] }> {
    const logs: { [transportName: string]: LogEntry[] } = {};

    const transportPromises = this.transports.map(async (transport) => {
      if (transport.getLogs) {
        try {
          const transportLogs = await transport.getLogs();
          logs[transport.name] = transportLogs;
        } catch (error) {
          console.error(`Failed to get logs from ${transport.name}:`, error);
          logs[transport.name] = [];
        }
      }
    });

    await Promise.all(transportPromises);
    return logs;
  }

  /**
   * Clear logs from all transports that support it
   */
  async clearLogs(): Promise<void> {
    const transportPromises = this.transports.map(async (transport) => {
      if (transport.clear) {
        try {
          await transport.clear();
        } catch (error) {
          console.error(`Failed to clear logs from ${transport.name}:`, error);
        }
      }
    });

    await Promise.all(transportPromises);
  }

  /**
   * Create a child logger with a specific source
   */
  child(source: string): Logger {
    const childLogger = new Logger(source);
    childLogger.transports = [...this.transports];
    childLogger.minLevel = this.minLevel;
    return childLogger;
  }
}

/**
 * Create a default logger instance
 */
export function createLogger(source?: string): Logger {
  const { defaultLogLevel } = useAppConfig();
  return new Logger(source)
    .addTransport(new ConsoleTransport())
    .addTransport(new MemoryTransport())
    .setLevel(defaultLogLevel);
}

/**
 * Create a logger with persistent storage
 */
export function createPersistentLogger(source?: string): Logger {
  return new Logger(source)
    .addTransport(new ConsoleTransport())
    .addTransport(new MemoryTransport())
    .addTransport(new LocalStorageTransport())
    .setLevel(LogLevel.INFO);
}

// Default logger instance
export const logger = createLogger("app");
