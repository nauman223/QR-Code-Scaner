import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <div
      class="app-skeleton"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
    ></div>
  `,
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'presentation' },
})
export class Skeleton {
  public readonly width = input('100%');
  public readonly height = input('1rem');
  public readonly radius = input('var(--app-radius-sm)');
}
