import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../../../core/services/organization';
import { Subject } from 'rxjs'; 
import { debounceTime } from 'rxjs/operators';
import { AppValidators } from '../../../core/utils/validators'; // Use Central Validators

@Component({
  selector: 'app-org-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
  templateUrl: './org-manager.html',
  styleUrl: './org-manager.scss'
})
export class OrgManagerComponent implements OnInit {
  orgs: any[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;
  
  orgForm: FormGroup;
  
  filterValues = {
    name: '',
    contact_email: '',
    phone: '',
    address: ''
  };
  private filterSubject = new Subject<void>();

  constructor(
    private orgService: OrganizationService,
    private fb: FormBuilder
  ) {
    this.orgForm = this.fb.group({
      id: [null],
      
      // Org Details
      name: ['', AppValidators.required],
      address: [''],
      contact_email: ['', [Validators.email]], // Optional email
      phone: ['', AppValidators.mobile],       // Optional but validated if present
      
      // Admin User Details (conditionally required)
      admin_name: [''],
      admin_email: ['', AppValidators.email], 
      admin_password: ['']
    });  
    
    this.filterSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.loadOrgs();
    });
  }

  ngOnInit() {
    this.loadOrgs();
  }
  
  onFilterChange() {
    this.filterSubject.next();
  }

  loadOrgs() {
    this.isLoading = true;
    this.orgService.getAll(this.filterValues).subscribe({
      next: (data) => {
        this.orgs = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.orgForm.reset();
    
    // Set strict validators for CREATE: Admin details are MANDATORY
    this.orgForm.get('admin_name')?.setValidators([Validators.required]);
    this.orgForm.get('admin_email')?.setValidators(AppValidators.email); // Required & Format
    
    this.orgForm.get('admin_name')?.updateValueAndValidity();
    this.orgForm.get('admin_email')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  openEditModal(org: any) {
    this.isEditMode = true;
    this.orgForm.patchValue(org);
    
    // Clear validators for EDIT: Admin details cannot be changed here (handled in Team Manager)
    this.orgForm.get('admin_name')?.clearValidators();
    this.orgForm.get('admin_email')?.clearValidators();
    this.orgForm.get('admin_name')?.updateValueAndValidity();
    this.orgForm.get('admin_email')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  saveOrg() {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched(); 
      return;
    }

    const data = this.orgForm.getRawValue(); 
    
    // Map to DTO Structure (CreateOrgDto)
    // Note: Update doesn't send admin details, Create does.
    
    const request$ = this.isEditMode
      ? this.orgService.update(data.id, data)
      : this.orgService.create(data);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadOrgs();
      },
      error: (err) => alert(err.error?.message || 'Save failed')
    });
  }

  deleteOrg(org: any) {
    if(!confirm(`Are you sure you want to delete "${org.name}"? \n\nWARNING: This will delete ALL users and cases associated with this firm.`)) return;

    this.orgService.delete(org.id).subscribe({
      next: () => this.loadOrgs(),
      error: (err) => alert(err.error?.message || 'Delete failed')
    });
  }
}