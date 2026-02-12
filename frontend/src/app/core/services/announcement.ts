import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnnouncementDto, CreateAnnouncementDto } from '../../shared/models/dtos';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private apiUrl = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient) {}

  // 1. For the Dashboard (Active only)
  getFeed(): Observable<AnnouncementDto[]> {
    return this.http.get<AnnouncementDto[]>(`${this.apiUrl}/feed`);
  }

  // 2. For the Admin Page (All managed items)
  getManagedList(): Observable<AnnouncementDto[]> {
    return this.http.get<AnnouncementDto[]>(`${this.apiUrl}/manage`);
  }

  create(data: CreateAnnouncementDto): Observable<AnnouncementDto> {
    return this.http.post<AnnouncementDto>(this.apiUrl, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}