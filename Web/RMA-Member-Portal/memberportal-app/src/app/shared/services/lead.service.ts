import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { Lead } from '../models/lead';

@Injectable({
  providedIn: 'root'
})

export class LeadService {
  private apiUrl = 'clc/api/Lead/Lead';

  constructor(
    private readonly commonService: CommonService) {
  }

  getLead(id: number): Observable<Lead> {
    return this.commonService.get<Lead>(id, `${this.apiUrl}`);
  }

  getLeads(): Observable<Lead[]> {
    return this.commonService.getAll<Lead[]>(`${this.apiUrl}`);
  }

  createNewLead(lead: Lead): Observable<number> {
    return this.commonService.post(this.apiUrl + '/CreateNewLead', lead);
  }

  updateLead(lead: Lead): Observable<boolean> {
    return this.commonService.edit(lead, this.apiUrl + '/UpdateLead');
  }

  searchLeads(query: string): Observable<Lead[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Lead[]>(`${this.apiUrl}/SearchLeads/${urlQuery}`);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, clientType: number, leadClientStatus: number): Observable<PagedRequestResult<Lead>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Lead>>(`${this.apiUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${clientType}/${leadClientStatus}/${urlQuery}`);
  }

  getLeadReminders(userEmail: string): Observable<Lead[]> {
    return this.commonService.getAll<Lead[]>(`${this.apiUrl}/GetReminders/${userEmail}`);
  }

  getUserReminders(userEmail: string): Observable<Lead[]> {
    return this.commonService.getAll<Lead[]>(`${this.apiUrl}/UserReminders/${userEmail}`);
  }

  // updateLeadReminder(reminder: LeadReminder): Observable<boolean> {
  //   return this.commonService.edit(reminder, this.apiUrl + '/UpdateLeadReminder');
  // }

  getLeadByQuoteId(quoteId: number): Observable<Lead> {
    return this.commonService.get<Lead>(quoteId, `${this.apiUrl}/GetLeadByQuoteId`);
  }
}
