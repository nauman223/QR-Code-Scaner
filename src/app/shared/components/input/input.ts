import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'password';

let nextInputId = 0;

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements ControlValueAccessor {
  public readonly label = input.required<string>();
  public readonly type = input<InputType>('text');
  public readonly placeholder = input('');
  public readonly errorMessage = input<string | null>(null);
  public readonly hint = input<string | null>(null);
  public readonly autocomplete = input<string | null>(null);

  protected readonly id = `app-input-${(nextInputId += 1)}`;
  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  public writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const control = event.target as HTMLInputElement;
    this.value.set(control.value);
    this.onChange(control.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
