import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HearingDto, CreateHearingDto } from '../../shared/models/dtos';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HearingService {
  private apiUrl = `${environment.apiUrl}/cases`; 

  constructor(private http: HttpClient) {}

  getHearings(caseId: number): Observable<HearingDto[]> {
    return this.http.get<HearingDto[]>(`${this.apiUrl}/${caseId}/hearings`);
  }

  // Use CreateHearingDto for payload
  addHearing(caseId: number, data: CreateHearingDto): Observable<HearingDto> {
    return this.http.post<HearingDto>(`${this.apiUrl}/${caseId}/hearings`, data);
  }
  
  updateHearing(caseId: number, hearingId: number, data: CreateHearingDto): Observable<HearingDto> {
    return this.http.put<HearingDto>(`${this.apiUrl}/${caseId}/hearings/${hearingId}`, data);
  }

  deleteHearing(caseId: number, hearingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${caseId}/hearings/${hearingId}`);
  }
}