export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  readonly theme: ThemePreference;
  readonly vibrateOnScan: boolean;
  readonly beepOnScan: boolean;
  readonly autoCopyResult: boolean;
  readonly saveScansToHistory: boolean;
  readonly openUrlsAutomatically: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'system',
  vibrateOnScan: true,
  beepOnScan: false,
  autoCopyResult: false,
  saveScansToHistory: true,
  openUrlsAutomatically: false,
};

const THEME_PREFERENCES: readonly string[] = ['light', 'dark', 'system'];

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value);
}

/**
 * Merges parsed, untyped JSON (from Preferences storage) onto the defaults,
 * keeping only fields that are present and of the expected type. Guards
 * against corrupted or outdated stored settings rather than trusting them.
 */
export function mergeAppSettings(value: unknown): AppSettings {
  if (typeof value !== 'object' || value === null) {
    return DEFAULT_APP_SETTINGS;
  }
  const record = value as Record<string, unknown>;

  const theme = isThemePreference(record['theme']) ? record['theme'] : DEFAULT_APP_SETTINGS.theme;

  return {
    theme,
    vibrateOnScan: readBoolean(record['vibrateOnScan'], DEFAULT_APP_SETTINGS.vibrateOnScan),
    beepOnScan: readBoolean(record['beepOnScan'], DEFAULT_APP_SETTINGS.beepOnScan),
    autoCopyResult: readBoolean(record['autoCopyResult'], DEFAULT_APP_SETTINGS.autoCopyResult),
    saveScansToHistory: readBoolean(
      record['saveScansToHistory'],
      DEFAULT_APP_SETTINGS.saveScansToHistory,
    ),
    openUrlsAutomatically: readBoolean(
      record['openUrlsAutomatically'],
      DEFAULT_APP_SETTINGS.openUrlsAutomatically,
    ),
  };
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
