import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdvancedSearchDto } from '../../shared/models/dtos'; // Import DTO
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(payload: AdvancedSearchDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}