import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingDto, CreateSettingDto } from '../../shared/models/dtos';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // Get single value (for dropdowns)
  getSetting(key: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${key}`);
  }

  // Get list of all settings metadata (For Admin Table)
  getAllSettings(): Observable<SettingDto[]> {
    return this.http.get<SettingDto[]>(this.apiUrl);
  }

  createSetting(data: CreateSettingDto): Observable<SettingDto> {
    return this.http.post<SettingDto>(this.apiUrl, data);
  }

  // Update existing (matches backend route POST /:key)
  // We use Partial<CreateSettingDto> because 'key' is in the URL, usually body has value/description
  updateSetting(key: string, data: Partial<CreateSettingDto>): Observable<SettingDto> {
    return this.http.post<SettingDto>(`${this.apiUrl}/${key}`, data);
  }
}