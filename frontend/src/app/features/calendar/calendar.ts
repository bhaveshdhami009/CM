import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../core/services/calendar';
import { formatCaseTitle } from '../../shared/utils/case-helpers';

type ViewMode = 'month' | 'week' | 'day';

interface DayGroup {
  caseInfo: any;
  events: any[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  providers: [DatePipe]
})
export class CalendarComponent implements OnInit {
  viewMode: ViewMode = 'month';
  currentDate: Date = new Date();
  today: Date = new Date();

  // Data
  rawEvents: any[] = [];
  
  // Month View Data (Key: 'YYYY-MM-DD', Value: Events[])
  eventsByDate: Map<string, any[]> = new Map();
  
  // Day View Data
  groupedDayEvents: DayGroup[] = [];

  isLoading = false;
  calendarDays: Date[] = [];
  weekDays: Date[] = [];

  constructor(
    private calendarService: CalendarService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.refreshView();
  }

  // --- VIEW NAVIGATION ---

  setView(mode: ViewMode) {
    this.viewMode = mode;
    this.refreshView();
  }
  
  getMonthCellData(date: Date) {
    const events = this.getEventsForDate(date);
    if (events.length === 0) return [];

    const groups = new Map<number, { case: any, events: any[] }>();

    events.forEach(e => {
      const cid = e.case.id;
      if (!groups.has(cid)) {
        groups.set(cid, { case: e.case, events: [] });
      }
      groups.get(cid)?.events.push(e);
    });

    return Array.from(groups.values());
  }
  

  // Fix: Ensure we clone the date to avoid reference issues
  changeDate(offset: number) {
    const newDate = new Date(this.currentDate);
    
    if (this.viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + offset);
    } else if (this.viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (offset * 7));
    } else {
      newDate.setDate(newDate.getDate() + offset);
    }
    
    this.currentDate = newDate;
    this.refreshView();
  }

  // FIX: The event from (ngModelChange) is the value string, not a DOM event
  onDatePick(dateStr: string) {
    if (!dateStr) return;
    
    // Create date from YYYY-MM-DD string
    // Note: new Date("YYYY-MM-DD") treats it as UTC. 
    // We need to preserve the user's selected date visually.
    const newDate = new Date(dateStr + 'T00:00:00'); 
    
    this.currentDate = newDate;
    this.refreshView();
  }


  // Helper for Date Input [value] to handle timezone offset
  get datePickerValue(): string {
    const d = new Date(this.currentDate);
    // Adjust to local timezone so the input shows the correct day
    const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
  }

  drillDown(date: Date) {
    this.currentDate = new Date(date);
    if (this.viewMode === 'month') {
      this.setView('week');
    } else if (this.viewMode === 'week') {
      this.setView('day');
    }
  }
  
  

  // --- DATA LOADING ---

  refreshView() {
    this.generateGrid();
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    let startStr = '', endStr = '';

    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const d = this.currentDate.getDate();

    if (this.viewMode === 'month') {
      // Get full month range (Local time 00:00:00 to Last Day 23:59:59)
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0, 23, 59, 59);
      startStr = start.toISOString();
      endStr = end.toISOString();
    } else if (this.viewMode === 'week') {
      const start = this.getStartOfWeek(this.currentDate);
      start.setHours(0,0,0,0);
      
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23,59,59,999);

      startStr = start.toISOString();
      endStr = end.toISOString();
    } else {
      // Day View
      const start = new Date(y, m, d, 0, 0, 0, 0);
      const end = new Date(y, m, d, 23, 59, 59, 999);
      startStr = start.toISOString();
      endStr = end.toISOString();
    }

    this.calendarService.getEvents(startStr, endStr).subscribe({
      next: (data) => {
        this.rawEvents = data;
        
        // 1. Process Date Map (Fixes Timezone Issue)
        this.mapEventsToLocalDates(data);
        
        // 2. Process Groups for Day View
        if (this.viewMode === 'day') {
          this.groupEventsByCase(data);
        }
        
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // FIX: Grouping Logic using Local Date
  private mapEventsToLocalDates(events: any[]) {
    this.eventsByDate.clear();
    
    events.forEach(event => {
      // Convert UTC ISO to Local Date Object
      const dateObj = new Date(event.event_date);
      // Format to YYYY-MM-DD Local
      const dateKey = this.toLocalISODate(dateObj);
      
      if (!this.eventsByDate.has(dateKey)) {
        this.eventsByDate.set(dateKey, []);
      }
      this.eventsByDate.get(dateKey)?.push(event);
    });
  }

  // Helper: Get events for a specific grid cell (Month/Week)
  getEventsForDate(date: Date): any[] {
    const key = this.toLocalISODate(date);
    return this.eventsByDate.get(key) || [];
  }
  
  // NEW Helper: Group events by Case for Week View columns
  getEventsForDateGroupedByCase(date: Date): DayGroup[] {
    const events = this.getEventsForDate(date);
    if (events.length === 0) return [];
    
    const groups = new Map<number, DayGroup>();
    events.forEach(event => {
      const caseId = event.case.id;
      if (!groups.has(caseId)) {
        groups.set(caseId, { caseInfo: event.case, events: [] });
      }
      groups.get(caseId)?.events.push(event);
    });
    return Array.from(groups.values());
  }

  private groupEventsByCase(events: any[]) {
    // Reuse logic
    const groups = new Map<number, DayGroup>();
    events.forEach(event => {
      const caseId = event.case.id;
      if (!groups.has(caseId)) {
        groups.set(caseId, { caseInfo: event.case, events: [] });
      }
      groups.get(caseId)?.events.push(event);
    });
    this.groupedDayEvents = Array.from(groups.values());
  }

  // --- GRID GENERATION ---

  generateGrid() {
    if (this.viewMode === 'month') {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); 

        this.calendarDays = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            this.calendarDays.push(new Date(year, month, 1 - (startDayOfWeek - i)));
        }
        for (let i = 1; i <= daysInMonth; i++) {
            this.calendarDays.push(new Date(year, month, i));
        }
    } else if (this.viewMode === 'week') {
        this.weekDays = [];
        const start = this.getStartOfWeek(this.currentDate);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            this.weekDays.push(d);
        }
    }
  }

  getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; 
    return new Date(d.setDate(diff));
  }

  // Utils
  toLocalISODate(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().split('T')[0];
  }

  getCaseTitle(c: any): string {
    return formatCaseTitle(c);
  }
  
  openPicker(input: HTMLInputElement) {
    try {
      input.showPicker();
    } catch (e) {
      // fallback if needed
      input.click();
    }
  }
  
  getGroupStatusClass(events: any[]): string {
    // 1. Critical: Pending Logs
    if (events.some(e => e.type === 'log' && e.is_pending)) {
      return 'status-pending';
    }

    // 2. High Priority: Hearing
    if (events.some(e => e.type === 'hearing')) {
      return 'status-hearing';
    }

    // 3. Medium Priority: Execution
    if (events.some(e => e.type === 'execution')) {
      return 'status-execution';
    }

    // 4. Case Filed / Received
    if (events.some(e => e.type === 'case_filed' || e.type === 'case_received')) {
      return 'status-admin';
    }

    // 5. Default: All tasks done
    return 'status-done';
  }

  // Helper for single events (Week/Day view)
  getEventClass(event: any): string {
    if (event.type === 'log') {
      return event.is_pending ? 'status-pending' : 'status-done';
    }
    if (event.type === 'hearing') return 'status-hearing';
    if (event.type === 'execution') return 'status-execution';
    return 'status-admin';
  }

}