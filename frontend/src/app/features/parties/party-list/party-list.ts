import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { PartyService } from '../../../core/services/party';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppValidators } from '../../../core/utils/validators'; // Central Validators
import { CreatePartyDto } from '../../../shared/models/dtos'; // DTO

@Component({
  selector: 'app-party-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './party-list.html',
  styleUrl: './party-list.scss'
})
export class PartyListComponent implements OnInit {
  parties: any[] = [];
  isLoading = true;
  totalParties = 0;
  
  searchControl = new FormControl('');

  // Modal State
  showModal = false;
  isEditMode = false;
  editId: number | null = null;
  partyForm: FormGroup;
  
  filterValues = {
    name: '',
    parentage: '',
    mobile: '',
    city: ''
  };
  
  private filterSubject = new Subject<void>();

  constructor(
    private partyService: PartyService,
    private fb: FormBuilder
  ) {
    // Replaced manual validators with AppValidators
    this.partyForm = this.fb.group({
      first_name: ['', AppValidators.required],
      middle_name: [''],
      last_name: [''],
      
      mobile: ['', AppValidators.mobile], 
      mobile2: ['', AppValidators.mobile],
      email: ['', AppValidators.email],
      
      father_name: [''],
      mother_name: [''],
      guardian: [''],
      guardian_relation: [''],
      
      address_line_1: [''],
      address_line_2: [''],
      city: [''],
      state: [''],
      pincode: ['', AppValidators.pincode],
      
      remarks: ['']
    });
    
    // Unified Search Trigger
    this.filterSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.loadParties(this.searchControl.value || '');
    });
    
    this.searchControl.valueChanges.subscribe(() => this.filterSubject.next());
  }

  ngOnInit() {
    this.loadParties();
  }
  
  onFilterChange() {
    this.filterSubject.next();
  }

  loadParties(search: string = '') {
    this.isLoading = true;
    
    this.partyService.getParties(1, 100, search, this.filterValues).subscribe({
      next: (res) => {
        this.parties = res.data;
        this.totalParties = res.meta.total;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editId = null;
    this.partyForm.reset();
    this.showModal = true;
  }

  openEditModal(party: any) {
    this.isEditMode = true;
    this.editId = party.id;
    this.partyForm.patchValue(party);
    this.showModal = true;
  }

  save() {
    if (this.partyForm.invalid) {
      this.partyForm.markAllAsTouched();
      return;
    }

    const data = this.partyForm.value as CreatePartyDto;
    
    const request$ = this.isEditMode && this.editId
      ? this.partyService.update(this.editId, data)
      : this.partyService.create(data);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadParties();
        alert(this.isEditMode ? 'Party Updated' : 'Party Created');
      },
      error: (err) => alert(err.error?.message || 'Error saving party')
    });
  }

  deleteParty(id: number) {
    if(!confirm('Are you sure? This cannot be undone.')) return;
    
    this.partyService.delete(id).subscribe({
      next: () => this.loadParties(),
      error: (err) => alert(err.error?.message || 'Delete failed')
    });
  }
}