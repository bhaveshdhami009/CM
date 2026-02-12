import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ExecutionDto, 
  StartExecutionDto, 
  MarkCycleCompleteDto 
} from '../../shared/models/dtos';
import { environment } from '../../../environments/environment';


export type UpdateExecutionDto = Partial<StartExecutionDto>;


@Injectable({ providedIn: 'root' })
export class ExecutionService {
  private apiUrl = `${environment.apiUrl}/cases`;

  constructor(private http: HttpClient) {}

  start(caseId: number, data: StartExecutionDto): Observable<ExecutionDto> {
    return this.http.post<ExecutionDto>(`${this.apiUrl}/${caseId}/execution/start`, data);
  }
  
  update(caseId: number, data: UpdateExecutionDto): Observable<ExecutionDto> {
    return this.http.patch<ExecutionDto>(`${this.apiUrl}/${caseId}/execution`, data);
  }

  // NEW: Hard Delete
  delete(caseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${caseId}/execution`);
  }

  // UPDATED: Stop route changed to /stop
  stop(caseId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${caseId}/execution/stop`, {});
  }

  // Changed input to DTO to match backend strict validation
  completeCycle(caseId: number, data: MarkCycleCompleteDto): Observable<ExecutionDto> {
    return this.http.post<ExecutionDto>(`${this.apiUrl}/${caseId}/execution/complete`, data);
  }

  //stop(caseId: number): Observable<any> {
  //  return this.http.delete(`${this.apiUrl}/${caseId}/execution`);
  //}
}