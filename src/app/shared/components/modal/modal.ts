import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Generic modal shell (also used for confirm dialogs via projected content).
 * Hand-rolled focus trap and Escape/backdrop handling — `@angular/cdk` is
 * only approved for virtual scroll, so `cdk/overlay` and `cdk/a11y` are not
 * used here.
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  public readonly open = input(false);
  public readonly title = input<string | null>(null);

  public readonly closed = output();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private lastFocusedElement: HTMLElement | null = null;

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) {
        this.lastFocusedElement?.focus();
        return;
      }

      this.lastFocusedElement = document.activeElement as HTMLElement | null;
      const panelElement = this.panel()?.nativeElement;
      const focusable = panelElement
        ? Array.from(panelElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];
      (focusable[0] ?? panelElement)?.focus();

      const handleKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          this.closed.emit();
          return;
        }
        if (event.key !== 'Tab' || focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      };

      document.addEventListener('keydown', handleKeydown);
      onCleanup(() => {
        document.removeEventListener('keydown', handleKeydown);
      });
    });
  }

  protected handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
