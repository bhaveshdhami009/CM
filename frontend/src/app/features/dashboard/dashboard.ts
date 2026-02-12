import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../core/services/dashboard';
import { AuthService } from '../../core/services/auth';
import { formatCaseTitle } from '../../shared/utils/case-helpers';
import { DashboardStats, DashboardWidgets } from '../../shared/models/dtos';
import { AutoPickerDirective } from '../../shared/directives/auto-picker.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AutoPickerDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  
  stats: DashboardStats = {
    tasksCompleted: 0,
    hearingsCount: 0,
    casesFiled: 0,
    totalPendingTasks: 0
  };

  widgets: DashboardWidgets = {
    upcomingHearings: [],
    pendingTasks: [],
    recentActivity: [],
    announcements: [],
    recentCases: []
  };

  dateRange = 'month';
  customStart = '';
  customEnd = '';

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.setRange('month'); // Default
    this.loadWidgets();
  }

  // --- ACTIONS ---

  setRange(range: string) {
    this.dateRange = range;
    const now = new Date();
    const start = new Date();
    
    if (range === 'day') {
        // Start of Today
        // No change needed to 'start' variable as it defaults to now, 
        // just set customStart/End correctly below
    } 
    else if (range === 'week') {
        start.setDate(now.getDate() - 7);
    } 
    else if (range === 'month') {
        start.setMonth(now.getMonth() - 1);
    } 
    else if (range === 'year') {
        start.setFullYear(now.getFullYear() - 1);
    }

    this.customStart = start.toISOString().split('T')[0];
    this.customEnd = now.toISOString().split('T')[0];
    
    this.loadStats();
  }

  onCustomDateChange() {
    this.dateRange = 'custom';
    if (this.customStart && this.customEnd) {
      this.loadStats();
    }
  }

  // --- DATA LOADING ---

  loadStats() {
    this.dashboardService.getStats(this.customStart, this.customEnd).subscribe(data => {
      this.stats = data;
    });
  }

  loadWidgets() {
    this.isLoading = true;
    this.dashboardService.getWidgets().subscribe({
      next: (data) => {
        this.widgets = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // --- HELPERS ---
  getTitle(c: any) { 
      return c ? formatCaseTitle(c) : 'Unknown Case'; 
  }
}