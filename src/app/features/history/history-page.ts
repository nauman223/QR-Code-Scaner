import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/ion-content';

import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-history-page',
  imports: [IonContent, EmptyState],
  template: `
    <ion-content>
      <app-empty-state
        icon="history"
        title="History coming soon"
        message="Your scanned and created codes will show up here once the History feature is built."
      />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {}
