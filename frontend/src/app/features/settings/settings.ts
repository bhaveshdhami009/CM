import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme';
import { UserService } from '../../core/services/user';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { UpdateProfileDto } from '../../shared/models/dtos'; // Import DTO

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit {
  colors = [
    '#007bff', '#28a745', '#dc3545', '#6610f2', '#fd7e14', '#20c997', '#343a40'
  ];

  customColor = '#007bff';
  passForm = { oldPassword: '', newPassword: '', logoutOthers: false };
  sessions: any[] = [];
  isLoadingSessions = false;

  constructor(
    public themeService: ThemeService,
    private userService: UserService,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.customColor = this.themeService.accentColor() || '#007bff';
    this.loadSessions();
  }
  
  changePassword() {
    if (!this.passForm.oldPassword || !this.passForm.newPassword) {
      this.notificationService.showError('Please fill in password fields');
      return;
    }

    this.authService.changePassword(this.passForm).subscribe({ 
      next: () => {
        this.notificationService.showSuccess('Password changed successfully');
        this.passForm = { oldPassword: '', newPassword: '', logoutOthers: false };
      },
      error: (err: any) => this.notificationService.showError(err.error?.message || 'Failed to change password')
    });
  }

  loadSessions() {
    this.isLoadingSessions = true;
    this.authService.getSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.isLoadingSessions = false;
      },
      error: () => this.isLoadingSessions = false
    });
  }

  revokeSession(sessionId: string) {
    if(!confirm('Are you sure you want to log out this device?')) return;

    this.authService.revokeSession(sessionId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Device logged out');
        this.loadSessions();
      },
      error: () => this.notificationService.showError('Failed to revoke session')
    });
  }

  selectColor(color: string) {
    this.customColor = color;
    this.saveAppearance();
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
    const isDark = this.themeService.darkMode();

    // Use DTO
    const payload: UpdateProfileDto = { is_dark_mode: isDark };
    this.userService.updateProfile(payload).subscribe({
      error: () => this.notificationService.showError('Failed to save theme preference')
    });
  }

  saveAppearance() {
    this.themeService.setAccentColor(this.customColor);

    const payload: UpdateProfileDto = { accent: this.customColor };
    this.userService.updateProfile(payload).subscribe({
      next: () => this.notificationService.showSuccess('Theme updated successfully'),
      error: () => this.notificationService.showError('Failed to save theme')
    });
  }
}