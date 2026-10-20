import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'scan'
  | 'generate'
  | 'history'
  | 'settings'
  | 'star'
  | 'star-outline'
  | 'search'
  | 'close'
  | 'check'
  | 'warning'
  | 'chevron-left'
  | 'chevron-down'
  | 'trash'
  | 'copy'
  | 'share'
  | 'inbox';

/**
 * Hand-authored inline SVG icon set (no icon font/library, per PROJECT
 * dependency policy). Color comes from the surrounding text color
 * (`currentColor`); size from the `size` input.
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[attr.aria-hidden]': 'label() ? null : true',
  },
})
export class Icon {
  public readonly name = input.required<IconName>();
  public readonly size = input(24);
  public readonly label = input<string | null>(null);
}
