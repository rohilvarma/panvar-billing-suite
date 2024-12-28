import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService: MessageService = inject(MessageService);
  constructor() {}

  /**
   * Adds a toast message.
   *
   * @param severity The severity of the message to add. Can be one of
   *     'success', 'info', 'warn', 'error', 'secondary', or 'contrast'.
   * @param title The title to display in the toast message.
   * @param message The message to display in the toast message.
   * @param statusCode An optional status code to display in the toast message.
   *     If provided, the status code is displayed in the summary of the toast
   *     message.
   * @param errorType An optional error type to display in the toast message.
   *     If provided, the error type is displayed in the detail of the toast
   *     message.
   * @returns void
   */
  public addToast(
    severity: string,
    title: string,
    message: string,
    statusCode?: string | undefined,
    errorType?: string | undefined
  ): void {
    this.messageService.add({
      severity: severity,
      summary: statusCode === undefined ? title : `${statusCode}: ${title}`,
      detail: errorType === undefined ? message : `${errorType}: ${message}`,
      life: 3000,
    });
  }

  /**
   * Clear all toast messages.
   */
  public clear(): void {
    this.messageService.clear();
  }
}
