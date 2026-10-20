import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { Style, StatusBar } from '@capacitor/status-bar';

import { PlatformService } from '@core/services/platform.service';
import { SettingsService } from '@core/services/settings.service';

export type ResolvedTheme = 'light' | 'dark';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Resolves the user's theme preference (light/dark/system) against the OS
 * setting, applies it to the DOM via `data-bs-theme`, and keeps the native
 * status bar in sync. `data-bs-theme` is what both Bootstrap's color modes
 * and our own theme token partials (`styles/themes`) key off.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly settings = inject(SettingsService);
  private readonly platform = inject(PlatformService);

  private readonly systemPrefersDark = signal(
    this.document.defaultView?.matchMedia(DARK_SCHEME_QUERY).matches ?? false,
  );

  public readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const preference = this.settings.settings().theme;
    if (preference === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return preference;
  });

  constructor() {
    const media = this.document.defaultView?.matchMedia(DARK_SCHEME_QUERY);
    const listener = (event: MediaQueryListEvent): void => {
      this.systemPrefersDark.set(event.matches);
    };
    media?.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => media?.removeEventListener('change', listener));

    effect(() => {
      const theme = this.resolvedTheme();
      this.document.documentElement.setAttribute('data-bs-theme', theme);
      void this.syncStatusBar(theme);
    });
  }

  private async syncStatusBar(theme: ResolvedTheme): Promise<void> {
    if (!this.platform.isNative) {
      return;
    }
    try {
      await StatusBar.setStyle({ style: theme === 'dark' ? Style.Light : Style.Dark });
    } catch {
      // Status bar styling is a cosmetic nicety; ignore devices/platforms
      // that don't support it rather than surfacing an error to the user.
    }
  }
}
