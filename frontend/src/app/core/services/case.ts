import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCaseDto } from '../../shared/models/dtos'; // Updated Import Name
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = `${environment.apiUrl}/cases`;

  constructor(private http: HttpClient) {}

  // Strict typing for creation payload
  createCase(caseData: CreateCaseDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, caseData);
  }
  
  getCases(page: number = 1, limit: number, search?: string, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
      
    if (search) params = params.set('search', search);

    // Append column filters
    if (filters) {
      if (filters.file_no) params = params.set('file_no', filters.file_no);
      if (filters.case_type) params = params.set('case_type', filters.case_type);
      if (filters.court_name) params = params.set('court_name', filters.court_name);
      if (filters.title) params = params.set('title', filters.title);
    }
      
    return this.http.get<any>(this.apiUrl, { params });
  }
  
  getCaseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  
  deleteCase(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
  // Strict typing for update payload
  updateCase(id: number, data: CreateCaseDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }
}