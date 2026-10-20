import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';

@Component({
  selector: 'app-error-state',
  imports: [Icon, Button],
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  public readonly title = input('Something went wrong');
  public readonly message = input<string | null>(null);
  public readonly retryLabel = input('Retry');

  public readonly retry = output();
}
