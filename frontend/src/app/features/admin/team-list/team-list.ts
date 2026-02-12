import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../../core/services/user';
import { ROLES } from '../../../core/config/roles';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppValidators } from '../../../core/utils/validators'; // Central Validators

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Added ReactiveFormsModule
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss'
})
export class TeamListComponent implements OnInit {
  users: any[] = [];
  isLoading = true;
  
  showModal = false;
  isEditMode = false;
  editUserId: number | null = null;
  
  roles = [
    { name: 'Viewer (Read Only)', value: ROLES.VIEWER },
    { name: 'Editor (Create/Edit)', value: ROLES.EDITOR },
    { name: 'Admin (Manage Team)', value: ROLES.ORG_ADMIN }
  ];

  // Switched to Reactive Form
  userForm: FormGroup;
  
  filterValues = { name: '', email: '', role: '' };
  private filterSubject = new Subject<void>();

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    // Initialize Reactive Form
    this.userForm = this.fb.group({
      fullName: ['', AppValidators.required],
      email: ['', AppValidators.email],
      role: [ROLES.VIEWER, AppValidators.required],
      password: [''] // Optional on edit
    });

    this.filterSubject.pipe(debounceTime(500)).subscribe(() => {
      this.loadTeam();
    });  
  }

  ngOnInit() {
    this.loadTeam();
  }
  
  onFilterChange() {
    this.filterSubject.next();
  }

  loadTeam() {
    this.isLoading = true;
    
    // Create a clean filter object with correct types
    const filters = {
      name: this.filterValues.name,
      email: this.filterValues.email,
      // Convert string to number, or undefined if empty
      role: this.filterValues.role ? Number(this.filterValues.role) : undefined
    };
    
    this.userService.getTeam(filters).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.editUserId = null;
    this.userForm.reset({ role: ROLES.VIEWER });
    
    // Password required for creation
    this.userForm.get('password')?.setValidators([AppValidators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.editUserId = user.id;
    
    this.userForm.patchValue({
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      password: ''
    });
    
    // Password optional for edit
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.userForm.value;

    const request$ = this.isEditMode && this.editUserId
      ? this.userService.updateMember(this.editUserId, payload)
      : this.userService.addMember(payload);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadTeam();
      },
      error: (err) => alert(err.error?.message || 'Action failed')
    });
  }

  deleteUser(user: any) {
    if(!confirm(`Remove ${user.full_name} from the team?`)) return;

    this.userService.removeMember(user.id).subscribe({
      next: () => this.loadTeam(),
      error: (err) => alert(err.error?.message)
    });
  }

  getRoleName(roleId: number) {
    const role = this.roles.find(r => r.value === roleId);
    return role ? role.name : 'Unknown';
  }
}