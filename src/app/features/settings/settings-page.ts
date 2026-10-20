import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/ion-content';

import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-settings-page',
  imports: [IonContent, EmptyState],
  template: `
    <ion-content>
      <app-empty-state
        icon="settings"
        title="Settings coming soon"
        message="Theme, scan feedback, and privacy toggles land in a later build step."
      />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
