import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HearingDto, LogDto, AnnouncementDto, DashboardStats, DashboardWidgets } from '../../shared/models/dtos';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(start: string, end: string): Observable<DashboardStats> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params });
  }

  getWidgets(): Observable<DashboardWidgets> {
    return this.http.get<DashboardWidgets>(`${this.apiUrl}/widgets`);
  }
}