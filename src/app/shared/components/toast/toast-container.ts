import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Icon } from '@shared/components/icon/icon';

import { ToastService, type ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [Icon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.queue;

  protected handleAction(toast: ToastMessage): void {
    toast.action?.onClick();
    this.toastService.dismiss(toast.id);
  }

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
