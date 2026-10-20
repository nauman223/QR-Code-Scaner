import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonType = 'button' | 'submit';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly type = input<ButtonType>('button');
  public readonly disabled = input(false);
  public readonly loading = input(false);

  public readonly pressed = output();

  protected handleClick(): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.pressed.emit();
  }
}
