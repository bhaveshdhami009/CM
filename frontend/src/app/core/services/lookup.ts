import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  CreateDistrictDto, 
  CreateCourtDto, 
  CreateEstablishmentDto, 
  CreateJudgeDto 
} from '../../shared/models/dtos'; // Import Write DTOs
import { environment } from '../../../environments/environment';

// Optional: Define Read Interfaces locally or in DTOs if not already present
// For now, returning any[] is acceptable for Read operations if strict read DTOs aren't defined.

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private apiUrl = `${environment.apiUrl}/lookups`;

  constructor(private http: HttpClient) {}

  // --- GETTERS ---
  
  getCaseTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/case-types`);
  }

  getAllDistricts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/districts`);
  }
  // Alias
  getDistricts() { return this.getAllDistricts(); }

  getAllCourts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courts`);
  }
  
  getCourts(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/districts/${districtId}/courts`);
  }

  getAllJudges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/judges`);
  }
  
  getAllEstablishments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/establishments`);
  }
  
  getEstablishments(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/districts/${districtId}/establishments`);
  }

  // --- MANAGEMENT (CRUD) ---
  // Using Intersection Types for Save: DTO & { id?: number }
  
  saveEstablishment(data: CreateEstablishmentDto & { id?: number }): Observable<any> {
    if (data.id) return this.http.put(`${this.apiUrl}/establishments/${data.id}`, data);
    return this.http.post(`${this.apiUrl}/establishments`, data);
  }

  deleteEstablishment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/establishments/${id}`);
  }

  saveDistrict(data: CreateDistrictDto & { id?: number }): Observable<any> {
    if (data.id) return this.http.put(`${this.apiUrl}/districts/${data.id}`, data);
    return this.http.post(`${this.apiUrl}/districts`, data);
  }

  deleteDistrict(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/districts/${id}`);
  }

  saveCourt(data: CreateCourtDto & { id?: number }): Observable<any> {
    if (data.id) return this.http.put(`${this.apiUrl}/courts/${data.id}`, data);
    return this.http.post(`${this.apiUrl}/courts`, data);
  }

  deleteCourt(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courts/${id}`);
  }

  saveJudge(data: CreateJudgeDto & { id?: number }): Observable<any> {
    if (data.id) return this.http.put(`${this.apiUrl}/judges/${data.id}`, data);
    return this.http.post(`${this.apiUrl}/judges`, { name: data.name }); 
  }

  deleteJudge(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/judges/${id}`);
  }
  
  // Kept for backward compatibility
  addJudge(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/judges`, { name });
  }
}