import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LookupService } from '../../../core/services/lookup';
import { CaseService } from '../../../core/services/case';
import { PartyService } from '../../../core/services/party';
import { SettingService } from '../../../core/services/setting'; 
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CreateCaseDto } from '../../../shared/models/dtos'; // Corrected DTO Import
import { NgSelectModule } from '@ng-select/ng-select'; 
import { of } from 'rxjs';
import { AutoPickerDirective } from '../../../shared/directives/auto-picker.directive';
import { AppValidators } from '../../../core/utils/validators'; // Central Validators

@Component({
  selector: 'app-create-case',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, AutoPickerDirective],
  templateUrl: './create-case.html',
  styleUrl: './create-case.scss'
})
export class CreateCaseComponent implements OnInit {
  caseForm: FormGroup;
  partyForm: FormGroup;

  // Lookup Data
  caseTypes: string[] = [];
  districts: any[] = [];
  courts: any[] = [];
  establishments: any[] = []; 

  // Search & Party State
  petitionerSearchControl = new FormControl('');
  respondentSearchControl = new FormControl('');
  petitionerSearchResults: any[] = [];
  respondentSearchResults: any[] = [];
  selectedPetitioners: any[] = [];
  selectedRespondents: any[] = [];

  // Visibility Flags
  showPartyModal = false;
  activeRole: 'Petitioner' | 'Respondent' = 'Petitioner';
  showDlsaFields = false;
  showExecutionFields = false; 

  // Edit Mode
  isEditMode = false;
  caseId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private lookupService: LookupService,
    private caseService: CaseService,
    private partyService: PartyService,
    private settingService: SettingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.caseForm = this.fb.group({
      fileNo: [''],
      filingNo: [''],
      filingDate: [''],
      establishmentId: [null],
      caseNo: [''],
      //courtNo: [''],
      receivedDate: [''],
      caseType: [null, AppValidators.required],
      act: [''],
      section: [''],
      districtId: [null, AppValidators.required],
      courtId: [null, AppValidators.required],
      remarks: [''],
      
      // Optional Groups (initially disabled)
      dlsa: this.fb.group({
        letterNo: ['', AppValidators.required], 
        registrationNo: ['', AppValidators.required], 
        letterDate: ['', AppValidators.required],
        remarks: [''],
        billedOn: [''],
        receivedOn: ['']
      }),
      execution: this.fb.group({
        amount: ['', [AppValidators.required, Validators.min(0)]],
        start_date: ['', AppValidators.required],
        next_due_date: ['', AppValidators.required],
        remarks: ['']
      })
    });
    
    this.caseForm.get('dlsa')?.disable();
    this.caseForm.get('execution')?.disable();

    // Party Form using Central Validators
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
  }

  ngOnInit() {
    this.loadLookups();
    this.setupSearchListeners();

    // 1. District Change Listener
    this.caseForm.get('districtId')?.valueChanges.subscribe(districtId => {
      this.caseForm.get('courtId')?.reset();
      this.caseForm.get('establishmentId')?.reset();
      
      if (districtId) {
        this.loadCourts(districtId);
        this.loadEstablishments(districtId);
      } else {
        this.courts = [];
        this.establishments = [];
      }
    });

    // 2. Case Type Change Listener
    this.caseForm.get('caseType')?.valueChanges.subscribe(val => {
      this.handleTypeChange(val);
    });

    // 3. Edit Mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.caseId = Number(id);
      this.loadCaseData(this.caseId);
    }
  }
  
  loadCaseData(id: number) {
    this.caseService.getCaseById(id).subscribe(data => {
      // Patch Scalar Fields
      this.caseForm.patchValue({
        fileNo: data.file_no,
        filingNo: data.filing_no,
        filingDate: data.filing_date ? data.filing_date.split('T')[0] : '',
        caseNo: data.case_no,
        courtNo: data.court_no,
        receivedDate: data.received_date ? data.received_date.split('T')[0] : '',
        caseType: data.case_type,
        act: data.act,
        section: data.section,
        districtId: data.court?.district?.id, 
        courtId: data.court_id, 
        establishmentId: data.establishment_id,
        remarks: data.remarks
      });

      // Handle DLSA
      if (data.dlsa) {
        this.showDlsaFields = true;
        this.caseForm.get('dlsa')?.enable();
        this.caseForm.patchValue({
          dlsa: {
            letterNo: data.dlsa.letter_no,
            registrationNo: data.dlsa.registration_no,
            letterDate: data.dlsa.letter_date ? data.dlsa.letter_date.split('T')[0] : '',
            remarks: data.dlsa.remarks,
            billedOn: data.dlsa.billed_on ? data.dlsa.billed_on.split('T')[0] : '',
            receivedOn: data.dlsa.received_on ? data.dlsa.received_on.split('T')[0] : ''
          }
        });
      }
      
      // Handle Execution
      if (data.execution) {
        this.showExecutionFields = true;
        this.caseForm.get('execution')?.enable();
        const execData = { ...data.execution };
        if(execData.start_date) execData.start_date = execData.start_date.split('T')[0];
        if (execData.amount) execData.amount = Math.floor(execData.amount);
        this.caseForm.patchValue({ execution: execData });
      }

      // Handle Parties
      if (data.parties) {
          this.selectedPetitioners = data.parties
            .filter((p: any) => p.role === 'Petitioner')
            .map((p: any) => p.party);

          this.selectedRespondents = data.parties
            .filter((p: any) => p.role === 'Respondent')
            .map((p: any) => p.party);
      }
        
      if (data.court?.district?.id) {
        this.loadCourts(data.court.district.id);
        this.loadEstablishments(data.court.district.id); 
      }
    });
  }
  
  handleTypeChange(typeName: string) {
    if (!typeName) return;
    const lowerType = typeName.toLowerCase();

    if (lowerType.includes('dlsa')) {
      this.showDlsaFields = true;
      this.caseForm.get('dlsa')?.enable();
    } else {
      this.showDlsaFields = false;
      this.caseForm.get('dlsa')?.reset();
      this.caseForm.get('dlsa')?.disable();
    }

    if (lowerType.includes('execution')) {
      this.showExecutionFields = true;
      this.caseForm.get('execution')?.enable(); 
    } else {
      this.showExecutionFields = false;
      this.caseForm.get('execution')?.reset();
      this.caseForm.get('execution')?.disable();
    }
  }
  
  toggleManualExecution() {
    this.showExecutionFields = !this.showExecutionFields;
    if (this.showExecutionFields) {
      this.caseForm.get('execution')?.enable();
    } else {
      const currentType = this.caseForm.get('caseType')?.value || '';
      if (!currentType.toLowerCase().includes('execution')) {
        this.caseForm.get('execution')?.reset();
        this.caseForm.get('execution')?.disable();
      }
    }
  }

  setupSearchListeners() {
    this.petitionerSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) return of([]);
        return this.partyService.search(query);
      })
    ).subscribe(results => this.petitionerSearchResults = results);

    this.respondentSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) return of([]);
        return this.partyService.search(query);
      })
    ).subscribe(results => this.respondentSearchResults = results);
  }

  loadLookups() {
    this.lookupService.getCaseTypes().subscribe(data => this.caseTypes = data);
    this.lookupService.getDistricts().subscribe(data => this.districts = data);
  }

  loadCourts(districtId: number) {
    this.lookupService.getCourts(districtId).subscribe(data => this.courts = data);
  }
  loadEstablishments(districtId: number) {
    this.lookupService.getEstablishments(districtId).subscribe(data => this.establishments = data);
  }

  selectParty(party: any, role: 'Petitioner' | 'Respondent') {
    if (role === 'Petitioner') {
      if (!this.selectedPetitioners.find(p => p.id === party.id)) {
        this.selectedPetitioners.push(party);
      }
      this.petitionerSearchControl.setValue('');
      this.petitionerSearchResults = [];
    } else {
      if (!this.selectedRespondents.find(p => p.id === party.id)) {
        this.selectedRespondents.push(party);
      }
      this.respondentSearchControl.setValue('');
      this.respondentSearchResults = [];
    }
  }

  removeParty(index: number, role: 'Petitioner' | 'Respondent') {
    if (role === 'Petitioner') this.selectedPetitioners.splice(index, 1);
    else this.selectedRespondents.splice(index, 1);
  }

  openAddPartyModal(role: 'Petitioner' | 'Respondent') {
    this.activeRole = role;
    this.partyForm.reset();
    this.showPartyModal = true;
  }

  closeModal() {
    this.showPartyModal = false;
  }

  saveNewParty() {
    if (this.partyForm.valid) {
      this.partyService.create(this.partyForm.value).subscribe({
        next: (newParty) => {
          this.selectParty(newParty, this.activeRole);
          this.closeModal();
        },
        error: (err) => alert('Failed to create party: ' + err.message)
      });
    }
  }

  onSubmit() {
    if (this.caseForm.invalid) {
      this.caseForm.markAllAsTouched(); 
      // Manual Checks for Arrays
      if (this.selectedPetitioners.length === 0) {
        alert('Please select at least one Petitioner');
        return;
      }
      if (this.selectedRespondents.length === 0) {
        alert('Please select at least one Respondent');
        return;
      }
      return; 
    }
    
    // Duplicate Party Check
    if (this.selectedPetitioners.length > 0 && this.selectedRespondents.length > 0) {
      const petitionerIds = new Set(this.selectedPetitioners.map(p => p.id));
      const hasDuplicate = this.selectedRespondents.some(resp => petitionerIds.has(resp.id));

      if (hasDuplicate) {
        alert('Error: The same person cannot be listed as both a Petitioner and a Respondent.');
        return; 
      }
      
      const formValue = this.caseForm.getRawValue(); // Ensure we get disabled fields if needed? No, disabled usually omitted.
      
      if (!formValue.filingDate) delete formValue.filingDate;
      if (!formValue.receivedDate) delete formValue.receivedDate;

      // 2. Remove Nested Groups if they are not active/shown
      // logic: If the user didn't select a DLSA type, don't send the empty DLSA form group
      if (!this.showDlsaFields) {
          delete formValue.dlsa;
      }
      
      if (!this.showExecutionFields) {
          delete formValue.execution;
      }
      
      const payload: CreateCaseDto = { 
        ...formValue,
        petitionerIds: this.selectedPetitioners.map(p => p.id),
        respondentIds: this.selectedRespondents.map(p => p.id)
      };
      
      if (this.isEditMode && this.caseId) {
        this.caseService.updateCase(this.caseId, payload).subscribe({
          next: () => this.router.navigate(['/cases', this.caseId]),
          error: (err) => alert(err.message)
        });
      } else {
        this.caseService.createCase(payload).subscribe({
          next: () => {
             alert('Case Created Successfully!');
             this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            alert(err.error?.message || 'Failed to create case');
          }
        });
      }
    } else {
      alert('Please fill all required fields and ensure at least one Petitioner and Respondent are selected.');
    }
  }
}