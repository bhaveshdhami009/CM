import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  showError(message: string) {
    this.notificationSubject.next({ message, type: 'error' });
  }

  showSuccess(message: string) {
    this.notificationSubject.next({ message, type: 'success' });
  }
}