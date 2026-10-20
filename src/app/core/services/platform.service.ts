import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type AppOs = 'ios' | 'android' | 'web';

function normalizePlatform(value: string): AppOs {
  if (value === 'ios' || value === 'android') {
    return value;
  }
  return 'web';
}

/**
 * Thin, testable wrapper around Capacitor's platform detection so the rest
 * of the app never imports `@capacitor/core` directly.
 */
@Injectable({ providedIn: 'root' })
export class PlatformService {
  public readonly os: AppOs = normalizePlatform(Capacitor.getPlatform());
  public readonly isNative: boolean = Capacitor.isNativePlatform();
  public readonly isIos: boolean = this.os === 'ios';
  public readonly isAndroid: boolean = this.os === 'android';

  /** Browser `BarcodeDetector` support, used for the PWA scanning fallback. */
  public readonly supportsBarcodeDetector: boolean = 'BarcodeDetector' in window;

  public isPluginAvailable(pluginName: string): boolean {
    return Capacitor.isPluginAvailable(pluginName);
  }
}
