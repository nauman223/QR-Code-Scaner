import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const DISMISS_DISTANCE_RATIO = 0.3;

/**
 * Bottom sheet with drag-to-dismiss. Follows the pointer via `transform`
 * only (no layout-affecting properties) while dragging, then either snaps
 * back or emits `closed` past the dismissal threshold.
 */
@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheet {
  public readonly open = input(false);

  public readonly closed = output();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private lastFocusedElement: HTMLElement | null = null;
  private dragStartY = 0;
  private panelHeight = 0;

  protected readonly dragOffsetPx = signal(0);
  protected readonly dragging = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) {
        this.lastFocusedElement?.focus();
        this.dragOffsetPx.set(0);
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

  protected handleDragStart(event: PointerEvent, panelElement: HTMLElement): void {
    this.dragging.set(true);
    this.dragStartY = event.clientY;
    this.panelHeight = panelElement.getBoundingClientRect().height;
    panelElement.setPointerCapture(event.pointerId);
  }

  protected handleDragMove(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    this.dragOffsetPx.set(Math.max(0, event.clientY - this.dragStartY));
  }

  protected handleDragEnd(): void {
    if (!this.dragging()) {
      return;
    }
    this.dragging.set(false);
    const threshold = this.panelHeight * DISMISS_DISTANCE_RATIO;
    const shouldDismiss = this.dragOffsetPx() > threshold;
    this.dragOffsetPx.set(0);
    if (shouldDismiss) {
      this.closed.emit();
    }
  }
}
