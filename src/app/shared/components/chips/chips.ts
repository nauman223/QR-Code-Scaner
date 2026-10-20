import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ChipOption {
  readonly value: string;
  readonly label: string;
}

/** Single-select chip list — a visual alternative to `SegmentedControl` for the same choice. */
@Component({
  selector: 'app-chips',
  templateUrl: './chips.html',
  styleUrl: './chips.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Chips),
      multi: true,
    },
  ],
})
export class Chips implements ControlValueAccessor {
  public readonly options = input.required<readonly ChipOption[]>();
  public readonly ariaLabel = input('');

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

  protected select(optionValue: string): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(optionValue);
    this.onChange(optionValue);
    this.onTouched();
  }
}
