import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Button } from '@shared/components/button/button';
import { Icon, type IconName } from '@shared/components/icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [Icon, Button],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  public readonly icon = input<IconName>('inbox');
  public readonly title = input.required<string>();
  public readonly message = input<string | null>(null);
  public readonly actionLabel = input<string | null>(null);

  public readonly actionPressed = output();
}
