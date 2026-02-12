import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LogDto, CreateLogDto } from '../../shared/models/dtos';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LogService {
  private apiUrl = `${environment.apiUrl}/cases`;

  constructor(private http: HttpClient) {}

  getLogs(caseId: number): Observable<LogDto[]> {
    return this.http.get<LogDto[]>(`${this.apiUrl}/${caseId}/logs`);
  }

  addLog(caseId: number, data: CreateLogDto, file: File | null): Observable<LogDto> {
    const formData = this.createFormData(data, file);
    return this.http.post<LogDto>(`${this.apiUrl}/${caseId}/logs`, formData);
  }
  
  // Update allows partials, but usually shares structure with Create
  updateLog(caseId: number, logId: number, data: CreateLogDto, file: File | null): Observable<LogDto> {
    const formData = this.createFormData(data, file);
    return this.http.patch<LogDto>(`${this.apiUrl}/${caseId}/logs/${logId}`, formData);
  }

  deleteLog(caseId: number, logId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${caseId}/logs/${logId}`);
  }
  
  downloadFile(caseId: number, logId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${caseId}/logs/${logId}/file`, {
      responseType: 'blob'
    });
  }
  
  togglePending(caseId: number, logId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${caseId}/logs/${logId}/toggle`, {});
  }

  // Helper using CreateLogDto
  private createFormData(data: CreateLogDto, file: File | null): FormData {
    const formData = new FormData();
    
    // Strict mapping based on DTO
    if (data.log_date) formData.append('log_date', data.log_date);
    if (data.purpose) formData.append('purpose', data.purpose);
    if (data.remarks) formData.append('remarks', data.remarks);
    
    // Handle Boolean -> String conversion for FormData
    if (data.is_pending !== undefined && data.is_pending !== null) {
      formData.append('is_pending', String(data.is_pending)); 
    }

    if (file) {
      formData.append('file', file);
    }
    
    return formData;
  }
}