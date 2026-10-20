import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/ion-content';

import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-generate-page',
  imports: [IonContent, EmptyState],
  template: `
    <ion-content>
      <app-empty-state
        icon="generate"
        title="Generator coming soon"
        message="Building QR codes from URLs, Wi-Fi, contacts and more lands in a later build step."
      />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratePage {}
