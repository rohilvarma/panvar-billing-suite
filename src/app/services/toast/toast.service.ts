import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _messageService: MessageService = inject(MessageService);
  constructor() { }

  public addToast(type: string, header: string, message: string): void {
    this._messageService.add({
      severity: type,
      summary: header,
      detail: message,
      life: 3000
    })
  }

  public clear(): void {
    this._messageService.clear();
  }
}
