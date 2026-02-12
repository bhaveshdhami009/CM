import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'; 
import { LookupService } from '../../../core/services/lookup';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppValidators } from '../../../core/utils/validators'; // Central Validators

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './master-data.html',
  styleUrl: './master-data.scss'
})
export class MasterDataComponent implements OnInit {
  tables = ['Districts', 'Courts', 'Establishments', 'Judges'];
  selectedTable = 'Districts';
  
  rawData: any[] = [];
  filteredData: any[] = [];
  isLoading = false;
  districtsList: any[] = [];

  filterValues = { name: '', district: '' };
  showModal = false;
  masterForm: FormGroup;

  constructor(
    private lookupService: LookupService,
    private fb: FormBuilder
  ) {
    this.masterForm = this.fb.group({
      id: [null],
      name: ['', AppValidators.required],
      state: [''], // Only for District
      district_id: [null] // Only for Court/Establishment
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadDistrictsForDropdown();
  }

  loadDistrictsForDropdown() {
    this.lookupService.getAllDistricts().subscribe(data => this.districtsList = data);
  }

  onTableChange() {
    this.filterValues = { name: '', district: '' };
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    let request$;
    
    switch(this.selectedTable) {
      case 'Districts': request$ = this.lookupService.getAllDistricts(); break;
      case 'Courts': request$ = this.lookupService.getAllCourts(); break;
      case 'Establishments': request$ = this.lookupService.getAllEstablishments(); break;
      case 'Judges': request$ = this.lookupService.getAllJudges(); break;
    }

    if (request$) {
      request$.subscribe({
        next: (data: any[]) => {
          this.rawData = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  applyFilters() {
    const nameFilter = this.filterValues.name.trim().toLowerCase();
    const districtFilter = this.filterValues.district.trim().toLowerCase();

    this.filteredData = this.rawData.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(nameFilter);
      let districtMatch = true;
      if ((this.selectedTable === 'Courts' || this.selectedTable === 'Establishments') && districtFilter) {
        districtMatch = item.district?.name.toLowerCase().includes(districtFilter);
      }
      return nameMatch && districtMatch;
    });
  }

  openModal(item?: any) {
    this.masterForm.reset();
    
    // Conditional Validation logic
    if (this.selectedTable === 'Courts' || this.selectedTable === 'Establishments') {
      this.masterForm.get('district_id')?.setValidators(AppValidators.required);
    } else {
      this.masterForm.get('district_id')?.clearValidators();
    }
    
    if (this.selectedTable === 'Districts') {
        this.masterForm.get('state')?.setValidators(AppValidators.required);
    } else {
        this.masterForm.get('state')?.clearValidators();
    }

    this.masterForm.get('district_id')?.updateValueAndValidity();
    this.masterForm.get('state')?.updateValueAndValidity();

    if (item) {
      this.masterForm.patchValue({
        id: item.id,
        name: item.name,
        state: item.state,
        district_id: item.district_id || item.district?.id
      });
    }
    
    this.showModal = true;
  }

  save() {
    if (this.masterForm.invalid) {
      this.masterForm.markAllAsTouched();
      return;
    }

    const data = this.masterForm.getRawValue();
    let request$;

    // Use DTO structures implicitly via service calls
    switch(this.selectedTable) {
      case 'Districts': request$ = this.lookupService.saveDistrict(data); break;
      case 'Courts': request$ = this.lookupService.saveCourt(data); break;
      case 'Establishments': request$ = this.lookupService.saveEstablishment(data); break;
      case 'Judges': request$ = this.lookupService.saveJudge(data); break;
    }

    if (request$) {
      request$.subscribe({
        next: () => {
          this.showModal = false;
          this.loadData();
        },
        error: (err: any) => alert(err.error?.message || 'Error saving')
      });
    }
  }

  deleteItem(item: any) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    let request$;
    switch (this.selectedTable) {
      case 'Districts': request$ = this.lookupService.deleteDistrict(item.id); break;
      case 'Courts': request$ = this.lookupService.deleteCourt(item.id); break;
      case 'Establishments': request$ = this.lookupService.deleteEstablishment(item.id); break;
      case 'Judges': request$ = this.lookupService.deleteJudge(item.id); break;
    }

    request$?.subscribe({
        next: () => this.loadData(),
        error: (err: any) => alert(err.error?.message || 'Failed to delete. Item may be in use.'),
    });
  }
}