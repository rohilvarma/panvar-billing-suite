import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService: MessageService = inject(MessageService);
  constructor() {}

  public addToast(
    severity: string,
    header: string,
    message: string,
    status?: number | undefined,
    code?: string | undefined
  ): void {
    this.messageService.add({
      severity: severity,
      summary: status === undefined ? header : `${status}: ${header}`,
      detail: code === undefined ? message : `${code}: ${message}`,
      life: 3000,
    });
  }

  public clear(): void {
    this.messageService.clear();
  }
}
