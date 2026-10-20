import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // `mode` is intentionally left unset so Ionic auto-detects 'ios' vs 'md':
    // this is what enables the iOS edge-swipe-back gesture on that platform.
    // It only affects navigation transitions/gestures here, never visual
    // styling — every visible component is custom Bootstrap + SCSS.
    provideIonicAngular({
      animated: true,
    }),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
