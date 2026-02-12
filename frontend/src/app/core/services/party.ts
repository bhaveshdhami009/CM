import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePartyDto } from '../../shared/models/dtos'; 
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PartyService {
  private apiUrl = `${environment.apiUrl}/parties`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`);
  }

  // Get All with Pagination
  getParties(page: number = 1, limit: number = 20, search?: string, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
      
    if (search) params = params.set('search', search);

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.parentage) params = params.set('parentage', filters.parentage);
      if (filters.mobile) params = params.set('mobile', filters.mobile);
      if (filters.city) params = params.set('city', filters.city);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  create(partyData: CreatePartyDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, partyData);
  }

  update(id: number, partyData: Partial<CreatePartyDto>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, partyData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}