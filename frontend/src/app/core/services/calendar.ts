import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  getEvents(start: string, end: string): Observable<any[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<any[]>(this.apiUrl, { params });
  }
}