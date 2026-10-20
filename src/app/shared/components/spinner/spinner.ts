import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <span
      class="app-spinner"
      [style.width.px]="size()"
      [style.height.px]="size()"
      role="status"
      [attr.aria-label]="label()"
    ></span>
  `,
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  public readonly size = input(24);
  public readonly label = input('Loading');
}
