import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrgDto } from '../../shared/models/dtos'; // Import DTO
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.contact_email) params = params.set('contact_email', filters.contact_email);
      if (filters.phone) params = params.set('phone', filters.phone);
      if (filters.address) params = params.set('address', filters.address);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  create(data: CreateOrgDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  
  // Update allows partial fields
  update(id: number, data: Partial<CreateOrgDto>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}