export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

export interface Logger {
  readonly level: LogLevel;
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

function formatMeta(meta: unknown): string {
  if (meta instanceof Error) return meta.stack ?? meta.message;
  if (typeof meta === 'string') return meta;
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

export function createLogger(level: LogLevel = 'info'): Logger {
  const threshold = ORDER[level] ?? ORDER.info;
  const make =
    (lvl: Exclude<LogLevel, 'silent'>, sink: (line: string) => void) =>
    (message: string, meta?: unknown): void => {
      if (ORDER[lvl] < threshold) return;
      sink(`[${lvl}] ${message}${meta === undefined ? '' : ` ${formatMeta(meta)}`}`);
    };

  return {
    level,
    debug: make('debug', (line) => console.log(line)),
    info: make('info', (line) => console.log(line)),
    warn: make('warn', (line) => console.warn(line)),
    error: make('error', (line) => console.error(line)),
  };
}

export function isLogLevel(value: string | undefined): value is LogLevel {
  return value !== undefined && (LOG_LEVELS as readonly string[]).includes(value);
}
