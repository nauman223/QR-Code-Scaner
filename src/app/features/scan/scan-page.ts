import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/ion-content';

import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-scan-page',
  imports: [IonContent, EmptyState],
  template: `
    <ion-content>
      <app-empty-state
        icon="scan"
        title="Scanner coming soon"
        message="Live QR scanning lands in the next build step."
      />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanPage {}
