import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CaseService } from '../../../core/services/case';
import { LogService } from '../../../core/services/log';
import { SettingService } from '../../../core/services/setting'; 
import { ExecutionService } from '../../../core/services/execution';
import { HearingService } from '../../../core/services/hearing'; 
import { LookupService } from '../../../core/services/lookup';
import { AutoPickerDirective } from '../../../shared/directives/auto-picker.directive';
import { formatCaseTitle } from '../../../shared/utils/case-helpers';
import { AppValidators } from '../../../core/utils/validators'; // Use centralized validators
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, AutoPickerDirective, NgSelectModule],
  templateUrl: './case-detail.html',
  styleUrl: './case-detail.scss'
})
export class CaseDetailComponent implements OnInit {
  caseData: any = null;
  logs: any[] = [];
  hearings: any[] = [];
  isLoading = true;
  
  petitioners: any[] = [];
  respondents: any[] = [];
  judges: any[] = [];
  purposeOptions: string[] = []; 

  // Modal States
  showPartyViewModal = false;
  selectedPartyForView: any = null;
  showLogModal = false;
  showHearingModal = false;
  showExecutionModal = false;
  showAddJudgeUI = false;
  isExecutionEditMode = false;

  // Reactive Forms
  logFormGroup: FormGroup;
  hearingFormGroup: FormGroup;
  executionFormGroup: FormGroup;

  editingLogId: number | null = null;
  editingHearingId: number | null = null;

  selectedFile: File | null = null;
  newJudgeName: string = ''; 
  
  currentJudge: string = '-';
  currentCourtRoom: string = '-';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private caseService: CaseService,
    private logService: LogService,
    private hearingService: HearingService,
    private settingService: SettingService,
    private lookupService: LookupService,
    private executionService: ExecutionService
  ) {
    // 1. Log Form (Matches CreateLogDto)
    this.logFormGroup = this.fb.group({
      log_date: ['', AppValidators.required],
      purpose: ['', AppValidators.required],
      remarks: [''],
      is_pending: [true] // Boolean
    });

    // 2. Hearing Form (Matches CreateHearingDto)
    this.hearingFormGroup = this.fb.group({
      hearing_date: ['', AppValidators.required],
      purpose: ['', AppValidators.required],
      court_room: [''],
      judge_id: [null],
      remarks: [''],
      outcome: ['']
    });

    // 3. Execution Form (Matches StartExecutionDto)
    this.executionFormGroup = this.fb.group({
      amount: [0, [AppValidators.required, Validators.min(0)]],
      start_date: ['', AppValidators.required],
      next_due_date: ['', AppValidators.required],
      remarks: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCase(Number(id));
      this.loadLogs(Number(id));
      this.loadHearings(Number(id));
    }
    this.loadSettings();
    this.loadJudges();
  }

  // --- Loaders ---
  loadCase(id: number) {
    this.isLoading = true;
    this.caseService.getCaseById(id).subscribe({
      next: (data) => {
        this.caseData = data;
        this.processParties(data.parties);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
  
  loadLogs(caseId: number) {
    this.logService.getLogs(caseId).subscribe(data => this.logs = data);
  }
  
  loadHearings(caseId: number) {
    this.hearingService.getHearings(caseId).subscribe(data => {
      this.hearings = data;
      this.updateCurrentStatusFromHearings();
    });
  }

  loadSettings() {
    this.settingService.getSetting('log_purposes').subscribe({
      next: (data) => this.purposeOptions = data || [],
      error: () => this.purposeOptions = ['Misc']
    });
  }
  
  loadJudges() {
    this.lookupService.getAllJudges().subscribe(data => this.judges = data);
  }

  deleteCase() {
    if(!confirm('Are you sure you want to delete this case? This action cannot be undone.')) return;
    
    this.caseService.deleteCase(this.caseData.id).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert('Failed to delete case')
    });
  }

  // --- HEARING LOGIC ---

  openHearingModal(hearing?: any) {
    this.showHearingModal = true;
    
    if (hearing) {
      this.editingHearingId = hearing.id;
      this.hearingFormGroup.patchValue({
        hearing_date: hearing.hearing_date ? this.toLocalISOString(new Date(hearing.hearing_date)) : '',
        purpose: hearing.purpose,
        court_room: hearing.court_room,
        judge_id: hearing.judge?.id,
        remarks: hearing.remarks,
        outcome: hearing.outcome
      });
    } else {
      this.editingHearingId = null;
      this.hearingFormGroup.reset();
      this.hearingFormGroup.patchValue({
        hearing_date: this.toLocalISOString(new Date()),
        court_room: this.currentCourtRoom !== '-' ? this.currentCourtRoom : '',
        judge_id: this.judges.find(j => j.name === this.currentJudge)?.id || null
      });
    }
  }

  saveHearing() {
    if (this.hearingFormGroup.invalid) {
      this.hearingFormGroup.markAllAsTouched();
      return;
    }

    const payload = this.hearingFormGroup.value;
    
    const request$ = this.editingHearingId
      ? this.hearingService.updateHearing(this.caseData.id, this.editingHearingId, payload)
      : this.hearingService.addHearing(this.caseData.id, payload);

    request$.subscribe({
      next: () => {
        this.showHearingModal = false;
        this.loadHearings(this.caseData.id);
        this.loadCase(this.caseData.id); 
      },
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }

  deleteHearing(id: number) {
    if(!confirm('Delete this hearing?')) return;
    this.hearingService.deleteHearing(this.caseData.id, id).subscribe({
      next: () => this.loadHearings(this.caseData.id),
      error: (err) => alert('Error deleting hearing')
    });
  }

  // --- LOG LOGIC ---

  openLogModal(log?: any) {
    this.showLogModal = true;
    this.selectedFile = null;
    
    if (log) {
      this.editingLogId = log.id;
      this.logFormGroup.patchValue({
        log_date: log.log_date ? this.toLocalISOString(new Date(log.log_date)) : '',
        purpose: log.purpose,
        remarks: log.remarks,
        // Log doesn't have 'outcome', but let's keep consistent
        is_pending: log.is_pending
      });
    } else {
      this.editingLogId = null;
      this.logFormGroup.reset();
      this.logFormGroup.patchValue({ 
        log_date: this.toLocalISOString(new Date()),
        is_pending: true        
      });
    }
  }

  saveLog() {
    if (this.logFormGroup.invalid) {
      this.logFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.logFormGroup.value;

    if (this.editingLogId) {
       this.logService.updateLog(this.caseData.id, this.editingLogId, formData, this.selectedFile).subscribe({
         next: () => {
           this.showLogModal = false;
           this.loadLogs(this.caseData.id);
         },
         error: (err) => alert(err.message)
       });
    } else {
       this.logService.addLog(this.caseData.id, formData, this.selectedFile).subscribe({
        next: () => {
          this.showLogModal = false;
          this.loadLogs(this.caseData.id);
        },
        error: (err) => alert(err.message)
      });
    }
  }

  deleteLog(id: number) {
    if(!confirm('Delete this log?')) return;
    this.logService.deleteLog(this.caseData.id, id).subscribe({
      next: () => this.loadLogs(this.caseData.id),
      error: (err) => alert('Error deleting log')
    });
  }
  
  toggleLogStatus(log: any) {
    this.logService.togglePending(this.caseData.id, log.id).subscribe({
      next: () => {
        log.is_pending = !log.is_pending;
        this.loadCase(this.caseData.id);
      },
      error: (err) => alert('Error toggling status')
    });
  }
  
  // --- EXECUTION LOGIC ---

  // 1. Open Modal (Handles both Start and Edit)
  openExecutionModal(editMode: boolean) {
    this.isExecutionEditMode = editMode;
    this.showExecutionModal = true;

    if (editMode && this.caseData.execution) {
        const exec = this.caseData.execution;
        // Patch values. IMPORTANT: Format date to YYYY-MM-DD for input[type=date]
        this.executionFormGroup.patchValue({
            amount: Math.floor(exec.amount),
            start_date: exec.start_date ? exec.start_date.split('T')[0] : '',
            next_due_date: exec.next_due_date ? exec.next_due_date.split('T')[0] : '',
            remarks: exec.remarks
        });
    } else {
        // Reset for new entry
        this.executionFormGroup.reset({ amount: 0, remarks: '' });
        this.executionFormGroup.patchValue({
            start_date: new Date().toISOString().split('T')[0], // Default to Today
            next_due_date: new Date().toISOString().split('T')[0] // Default to Today
        });
    }
  }
  
  closeExecutionModal() {
    this.showExecutionModal = false;
    this.isExecutionEditMode = false; // Reset mode
    this.executionFormGroup.reset();  // Clear form
  }

  // 2. Save (Decides between Start or Update)
  saveExecution() {
    if (this.executionFormGroup.invalid) {
      this.executionFormGroup.markAllAsTouched();
      return;
    }

    const data = this.executionFormGroup.value;

    if (this.isExecutionEditMode) {
        // UPDATE
        this.executionService.update(this.caseData.id, data).subscribe({
            next: () => {
                this.closeExecutionModal();
                this.loadCase(this.caseData.id);
            },
            error: (err) => alert(err.error?.message || 'Update failed')
        });
    } else {
        // START
        this.executionService.start(this.caseData.id, data).subscribe({
          next: () => {
            this.closeExecutionModal();
            this.loadCase(this.caseData.id);
            this.loadLogs(this.caseData.id); 
          },
          error: (err) => alert(err.error?.message)
        });
    }
  }

  // 3. Delete
  deleteExecution() {
      if(!confirm('Are you sure you want to delete this execution record?')) return;

      this.executionService.delete(this.caseData.id).subscribe({
          next: () => this.loadCase(this.caseData.id),
          error: (err) => alert(err.error?.message || 'Delete failed')
      });
  }

  // 2. Updated markExecutionPaid
  markExecutionPaid() {
    if(!confirm('Mark this cycle as paid?')) return;
    
    this.executionService.completeCycle(this.caseData.id, { remarks: 'Payment Received' }).subscribe({
      next: () => {
        // FIX: Load BOTH
        this.loadCase(this.caseData.id);
        this.loadLogs(this.caseData.id);
      },
      error: (err) => alert(err.error?.message)
    });
  }

  // 3. Updated stopExecution
  stopExecution() {
    if(!confirm('Stop execution?')) return;
    
    this.executionService.stop(this.caseData.id).subscribe({
      next: () => {
        // FIX: Load BOTH
        this.loadCase(this.caseData.id);
        this.loadLogs(this.caseData.id);
      },
      error: (err) => alert(err.error?.message)
    });
  }

  // --- Helpers ---
  
  viewParty(party: any) {
    this.selectedPartyForView = party;
    this.showPartyViewModal = true;
  }
  
  updateCurrentStatusFromHearings() {
    if (this.hearings && this.hearings.length > 0) {
      const lastHearing = this.hearings[0];
      this.currentJudge = lastHearing.judge ? lastHearing.judge.name : 'Unknown';
      this.currentCourtRoom = lastHearing.court_room || '-';
    }
  }

  addNewJudge() {
    if (!this.newJudgeName.trim()) return;
    this.lookupService.saveJudge({ name: this.newJudgeName }).subscribe(newJudge => {
      this.judges.push(newJudge);
      this.hearingFormGroup.patchValue({ judge_id: newJudge.id });
      this.newJudgeName = '';
      this.showAddJudgeUI = false;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  processParties(caseParties: any[]) {
    caseParties.sort((a, b) => a.party_number - b.party_number);
    this.petitioners = caseParties.filter(cp => cp.role === 'Petitioner').map(cp => cp.party);
    this.respondents = caseParties.filter(cp => cp.role === 'Respondent').map(cp => cp.party);
  }

  downloadLogFile(log: any) {
    if (!log.file_path) return;

    this.logService.downloadFile(this.caseData.id, log.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const p1 = this.petitioners[0]?.first_name || 'Petitioner';
        const r1 = this.respondents[0]?.first_name || 'Respondent';
        const purpose = log.purpose || 'Document';
        const date = log.log_date || 'DateError';
        const ext = log.file_extension || 'pdf';
        const sanitize = (str: string) => str.replace(/[^a-z0-9]/gi, '_');
        
        const filename = `${sanitize(p1)}_vs_${sanitize(r1)}_${sanitize(purpose)}_${sanitize(date)}.${ext}`;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to download file')
    });
  }
  
  getStatusClass(status: string | undefined): string {
    if (!status) return 'unknown';
    const lower = status.toLowerCase();
    if (lower.startsWith('pending')) return 'pending';
    if (lower.startsWith('next')) return 'next-hearing';
    return lower.replace(/ /g, '-');
  }
  
  get formattedCaseTitle(): string {
    return formatCaseTitle(this.caseData);
  }
  
  private toLocalISOString(date: Date): string {
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    return localISOTime;
  }
}