import { Injectable, signal } from '@angular/core';

export interface ToastAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface ToastMessage {
  readonly id: string;
  readonly text: string;
  readonly action?: ToastAction;
  readonly durationMs: number;
}

export interface ToastOptions {
  readonly action?: ToastAction;
  readonly durationMs?: number;
}

const DEFAULT_DURATION_MS = 3000;

/**
 * Queue-based toast service. Owns its own auto-dismiss timers independently
 * of whatever renders them, so `dismiss()` is safe to call twice (manual
 * dismiss racing the timer) — it's just an idempotent array filter.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly queueSignal = signal<readonly ToastMessage[]>([]);

  public readonly queue = this.queueSignal.asReadonly();

  public show(text: string, options?: ToastOptions): void {
    const id = crypto.randomUUID();
    const durationMs = options?.durationMs ?? DEFAULT_DURATION_MS;
    const toast: ToastMessage = { id, text, action: options?.action, durationMs };

    this.queueSignal.update((current) => [...current, toast]);
    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  public dismiss(id: string): void {
    this.queueSignal.update((current) => current.filter((toast) => toast.id !== id));
  }
}
