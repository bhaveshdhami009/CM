import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SearchService } from '../../core/services/search';
import { PartyService } from '../../core/services/party';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ENTITY_CONFIGS } from './universal-list.config';
import { AuthService } from '../../core/services/auth';
import { LogService } from '../../core/services/log';
import { ROLES } from '../../core/config/roles';
import { formatCaseTitle } from '../../shared/utils/case-helpers';
import { AutoPickerDirective } from '../../shared/directives/auto-picker.directive';
import { AdvancedSearchDto, FilterCondition } from '../../shared/models/dtos'; // Import DTOs

@Component({
  selector: 'app-universal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, AutoPickerDirective],
  templateUrl: './universal-list.html',
  styleUrl: './universal-list.scss'
})
export class UniversalListComponent implements OnInit {
  // Use 'keyof' to ensure type safety if ENTITY_CONFIGS is typed, else string[] is fine
  entityTypes = ['cases', 'hearings', 'logs', 'dlsa', 'executions'];
  configs = ENTITY_CONFIGS;
  
  selectedType = 'cases';
  dataList: any[] = [];
  isLoading = false;
  
  logicOperator: 'AND' | 'OR' = 'AND';
  
  // Use DTO Interface
  filters: FilterCondition[] = []; 
  filterValues: { [key: string]: string } = {}; 
  
  canEdit = false;
  private filterSubject = new Subject<void>();
  
  partySearchResults: any[] = [];
  activeFilterIndex: number | null = null;
  
  private partySearchSubject = new Subject<{ query: string, index: number }>();

  constructor(
    private searchService: SearchService,
    private authService: AuthService, 
    private logService: LogService,
    private partyService: PartyService,
    private route: ActivatedRoute    
  ) {
    this.filterSubject.pipe(debounceTime(500)).subscribe(() => this.runSearch());
    
    this.partySearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query)
    ).subscribe(data => this.fetchParties(data.query));
  }

  ngOnInit() {
    this.checkPermissions();
    this.route.queryParams.subscribe(params => {

        // 1. Handle Type Switching
        if (params['type'] && this.entityTypes.includes(params['type'])) {
            this.selectedType = params['type'];
        }

        this.resetFilters();

        // 2. Handle Status Filter (e.g. from "Pending Tasks" widget)
        if (params['status'] === 'pending' && this.selectedType === 'logs') {
            // Push to advanced filters because "is_pending" might not be an inline header
            this.filters.push({
                field: 'is_pending',
                operator: 'equals',
                value: 'true'
            });
        }

        // 3. Trigger Search
        this.runSearch();
    });
  }
  
  checkPermissions() {
    const user = this.authService.currentUser();
    this.canEdit = user ? user.role >= ROLES.EDITOR : false;
  }
  
  switchType() {
    this.resetFilters();
    this.runSearch();
  }
  
  addFilter() {
    const config = this.configs[this.selectedType];
    if (!config || !config.fields || config.fields.length === 0) return;

    this.filters.push({ 
      field: config.fields[0].key, // Safe access
      operator: 'contains', 
      value: '' 
    });
  }

  removeFilter(index: number) {
    this.filters.splice(index, 1);
    this.runSearch();
  }

  resetFilters() {
    this.filters = [];
    this.filterValues = {};
    if (this.configs[this.selectedType]?.columns) {
      this.configs[this.selectedType].columns.forEach((col: any) => {
         if (col.searchKey) this.filterValues[col.searchKey] = '';
      });
    }
  }

  onFilterChange() {
    this.filterSubject.next();
  }

  runSearch() {
    this.isLoading = true;
    
    const inlineFilters: FilterCondition[] = Object.keys(this.filterValues)
      .filter(key => this.filterValues[key] && this.filterValues[key].trim() !== '')
      .map(key => ({
        field: key,
        operator: 'contains',
        value: this.filterValues[key]
      }));

    const advancedFilters = this.filters.filter(f => f.value && String(f.value).trim() !== '');

    const combinedFilters = [...inlineFilters, ...advancedFilters];

    // Use DTO
    const payload: AdvancedSearchDto = {
      entityType: this.selectedType,
      logic: this.logicOperator,
      filters: combinedFilters,
      limit: 100
    };

    this.searchService.search(payload).subscribe({
      next: (res) => {
        this.dataList = res.data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
  
  onPartyInput(event: any, index: number) {
    const query = event.target.value;
    this.activeFilterIndex = index;
    if (query.length < 2) {
      this.partySearchResults = [];
      return;
    }
    this.partySearchSubject.next({ query, index });
  }

  fetchParties(query: string) {
    this.partyService.search(query).subscribe(results => {
      this.partySearchResults = results;
    });
  }

  selectParty(party: any, index: number) {
    const fullName = `${party.first_name} ${party.last_name || ''}`.trim();
    this.filters[index].value = fullName;
    this.partySearchResults = [];
    this.activeFilterIndex = null;
    this.runSearch(); 
  }

  closeDropdown() {
    setTimeout(() => {
      this.activeFilterIndex = null;
    }, 200);
  }

  getFieldType(fieldKey: string): string {
    const fieldDef = this.configs[this.selectedType].fields.find((f: any) => f.key === fieldKey);
    return fieldDef ? fieldDef.type : 'text';
  }
  
  getCaseId(row: any): number {
    return this.selectedType === 'cases' ? row.id : row.case?.id;
  }

  getTitle(row: any): string {
    const parent = this.selectedType === 'cases' ? row : row.case;
    return formatCaseTitle(parent);
  }

  getCaseLabel(row: any): string {
    return row.case?.file_no || 'View Case';
  }

  toggleTaskStatus(log: any) {
    if (!this.canEdit) return;
    const caseId = log.case?.id; 
    if (!caseId) return;

    this.logService.togglePending(caseId, log.id).subscribe({
      next: () => log.is_pending = !log.is_pending,
      error: (err) => alert('Error: ' + err.message)
    });
  }
}