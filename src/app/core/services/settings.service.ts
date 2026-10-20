import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import {
  DEFAULT_APP_SETTINGS,
  mergeAppSettings,
  type AppSettings,
} from '@core/models/settings.model';

const SETTINGS_STORAGE_KEY = 'app-settings';

/**
 * Single source of truth for user preferences, persisted through Capacitor
 * Preferences (works on web, iOS, and Android with no code changes). Reads
 * happen once at startup; every mutation writes straight through.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly settingsSignal = signal<AppSettings>(DEFAULT_APP_SETTINGS);
  private readonly loadedSignal = signal(false);

  public readonly settings = this.settingsSignal.asReadonly();
  public readonly loaded = this.loadedSignal.asReadonly();

  private readonly ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  public async whenReady(): Promise<void> {
    await this.ready;
  }

  public async update(patch: Partial<AppSettings>): Promise<void> {
    await this.ready;
    const next: AppSettings = { ...this.settingsSignal(), ...patch };
    this.settingsSignal.set(next);
    await Preferences.set({ key: SETTINGS_STORAGE_KEY, value: JSON.stringify(next) });
  }

  public async resetToDefaults(): Promise<void> {
    this.settingsSignal.set(DEFAULT_APP_SETTINGS);
    await Preferences.set({
      key: SETTINGS_STORAGE_KEY,
      value: JSON.stringify(DEFAULT_APP_SETTINGS),
    });
  }

  private async load(): Promise<void> {
    const { value } = await Preferences.get({ key: SETTINGS_STORAGE_KEY });
    if (value !== null) {
      try {
        const parsed: unknown = JSON.parse(value);
        this.settingsSignal.set(mergeAppSettings(parsed));
      } catch {
        // Corrupted stored value; keep the defaults already in the signal.
      }
    }
    this.loadedSignal.set(true);
  }
}
