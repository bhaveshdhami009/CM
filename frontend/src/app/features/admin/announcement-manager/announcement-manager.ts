import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AnnouncementService } from '../../../core/services/announcement';
import { AuthService } from '../../../core/services/auth';
import { ROLES } from '../../../core/config/roles';
import { AnnouncementDto, AnnouncementScope } from '../../../shared/models/dtos'; 
import { AppValidators } from '../../../core/utils/validators';
import { Subject } from 'rxjs'; // <--- Import
import { debounceTime } from 'rxjs/operators'; // <--- Import

@Component({
  selector: 'app-announcement-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './announcement-manager.html',
  styleUrl: './announcement-manager.scss'
})
export class AnnouncementManagerComponent implements OnInit {
  announcements: AnnouncementDto[] = [];
  filteredAnnouncements: AnnouncementDto[] = []; // <--- New: Display Data
  
  isLoading = true;
  showModal = false;
  isPlatformAdmin = false;

  announcementForm: FormGroup;

  // <--- New: Filter State
  filterValues = {
    title: '',
    message: '',
    scope: '',
    expires: ''
  };
  private filterSubject = new Subject<void>();

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.announcementForm = this.fb.group({
      title: ['', AppValidators.required],
      message: ['', AppValidators.required],
      scope: [AnnouncementScope.ORG, AppValidators.required],
      expires_at: [''] 
    });

    // Setup Debounce
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.checkRole();
    this.loadData();
  }

  checkRole() {
    const user = this.authService.currentUser();
    this.isPlatformAdmin = user?.role === ROLES.PLATFORM_ADMIN;
  }

  loadData() {
    this.isLoading = true;
    this.announcementService.getManagedList().subscribe({
      next: (data) => {
        this.announcements = data;
        this.applyFilters(); // <--- Initialize filtered list
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // <--- New: Trigger Filter
  onFilterChange() {
    this.filterSubject.next();
  }

  // <--- New: Filtering Logic
  applyFilters() {
    const titleF = this.filterValues.title.toLowerCase();
    const msgF = this.filterValues.message.toLowerCase();
    const scopeF = this.filterValues.scope; // Exact match or empty
    const expiresF = this.filterValues.expires;

    this.filteredAnnouncements = this.announcements.filter(item => {
      const matchesTitle = item.title.toLowerCase().includes(titleF);
      const matchesMsg = item.message.toLowerCase().includes(msgF);
      
      // Scope Filter (Dropdown)
      const matchesScope = scopeF ? item.scope === scopeF : true;

      // Expires Filter (Text match on date string for simplicity)
      let matchesDate = true;
      if (expiresF) {
        const dateStr = item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'Never';
        matchesDate = dateStr.toLowerCase().includes(expiresF.toLowerCase());
      }

      return matchesTitle && matchesMsg && matchesScope && matchesDate;
    });
  }

  openCreateModal() {
    this.announcementForm.reset({
      scope: AnnouncementScope.ORG, 
      title: '',
      message: '',
      expires_at: ''
    });
    this.showModal = true;
  }

  save() {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const payload = this.announcementForm.value;
    
    if (!this.isPlatformAdmin) {
      payload.scope = AnnouncementScope.ORG;
    }

    this.announcementService.create(payload).subscribe({
      next: () => {
        this.showModal = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error saving announcement')
    });
  }

  deleteItem(item: AnnouncementDto) {
    if(!confirm(`Delete "${item.title}"?`)) return;
    
    this.announcementService.delete(item.id).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Error deleting')
    });
  }
}