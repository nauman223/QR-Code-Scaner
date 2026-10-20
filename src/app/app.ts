import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonRouterOutlet } from '@ionic/angular';
import { IonApp } from '@ionic/angular/ion-app';

import { ThemeService } from '@core/services/theme.service';

import { ToastContainer } from '@shared/components/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    // Injected only to activate the singleton: its constructor wires the
    // data-bs-theme/status-bar effect for the lifetime of the app.
    inject(ThemeService);

    afterNextRender(() => {
      void SplashScreen.hide();
    });
  }
}
