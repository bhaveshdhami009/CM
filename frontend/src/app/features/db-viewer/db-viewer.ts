import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-db-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './db-viewer.html',
  styleUrl: './db-viewer.scss'
})
export class DbViewerComponent implements OnInit {
  // ... existing properties ...
  tableNames: string[] = [];
  selectedTable: string | null = null;
  tableData: any[] = [];
  tableHeaders: string[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<string[]>('/api/test/tables').subscribe(names => {
      this.tableNames = names.sort();
    });
  }

  // NEW: Helper function for stricter checks
  isDateColumn(header: string): boolean {
    if (!header) return false;
    const h = header.toLowerCase();
    // Only return true if it ENDS with _at / _date, or IS 'date'
    return h.endsWith('_at') || h.endsWith('_date') || h === 'date';
  }

  onTableSelect(event: Event): void {
    // ... existing logic ...
    const selectElement = event.target as HTMLSelectElement;
    const tableName = selectElement.value;
    
    this.selectedTable = tableName;
    this.tableData = [];
    this.tableHeaders = [];

    if (!tableName) return;

    this.isLoading = true;
    
    this.http.get<any[]>(`/api/test/table/${tableName}`).subscribe({
      next: (data) => {
        this.tableData = data;
        if (data.length > 0) {
          this.tableHeaders = Object.keys(data[0]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}