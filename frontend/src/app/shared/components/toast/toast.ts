import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent implements OnInit {
  notification: Notification | null = null;
  timeoutId: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(note => {
      this.notification = note;
      
      // Clear previous timer if a new notification arrives quickly
      if (this.timeoutId) clearTimeout(this.timeoutId);

      // Auto hide after 3 seconds
      this.timeoutId = setTimeout(() => this.close(), 3000);
    });
  }

  close() {
    this.notification = null;
  }
}