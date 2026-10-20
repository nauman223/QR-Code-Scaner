import { inject, Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import { SettingsService } from '@core/services/settings.service';

/**
 * Thin wrapper around `@capacitor/haptics`. Every method fails silently on
 * platforms/browsers that don't support haptics rather than throwing, since
 * feedback is always a nicety, never something the app depends on.
 */
@Injectable({ providedIn: 'root' })
export class HapticsService {
  private readonly settings = inject(SettingsService);

  /** Fired on a successful QR scan; respects the "vibrate on scan" setting. */
  public async scanSuccess(): Promise<void> {
    if (!this.settings.settings().vibrateOnScan) {
      return;
    }
    await this.run(() => Haptics.impact({ style: ImpactStyle.Medium }));
  }

  /** Subtle tap for discrete UI selections (segments, toggles, chips). */
  public async selectionChanged(): Promise<void> {
    await this.run(() => Haptics.selectionChanged());
  }

  public async success(): Promise<void> {
    await this.run(() => Haptics.notification({ type: NotificationType.Success }));
  }

  public async warning(): Promise<void> {
    await this.run(() => Haptics.notification({ type: NotificationType.Warning }));
  }

  public async error(): Promise<void> {
    await this.run(() => Haptics.notification({ type: NotificationType.Error }));
  }

  private async run(action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch {
      // Haptics unsupported on this platform/browser; nothing to recover.
    }
  }
}
