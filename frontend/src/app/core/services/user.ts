import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTeamMemberDto, UpdateProfileDto } from '../../shared/models/dtos'; // Import DTOs
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getTeam(filters?: { name?: string; email?: string; role?: number }): Observable<any[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.email) params = params.set('email', filters.email);
      if (filters.role) params = params.set('role', filters.role);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  addMember(data: CreateTeamMemberDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  
  updateMember(id: number, data: Partial<CreateTeamMemberDto>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  removeMember(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  
  updateProfile(data: UpdateProfileDto): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profile`, data);
  }
}