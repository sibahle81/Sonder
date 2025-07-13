import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Lead } from '../models/lead';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { LeadPerson } from '../models/lead-person';
import { LeadCompany } from '../models/lead-company';
import { LeadNote } from '../models/lead-note';
import { LeadContactV2 } from '../models/lead-contact-V2';
import { LeadAddress } from '../models/lead-address';

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

  getLeadByRolePlayerId(rolePlayerId: number): Observable<Lead> {
    return this.commonService.get<Lead>(rolePlayerId, `${this.apiUrl}/GetLeadByRolePlayerId`);
  }

  getLeads(): Observable<Lead[]> {
    return this.commonService.getAll<Lead[]>(`${this.apiUrl}`);
  }

  createNewLead(lead: Lead): Observable<Lead> {
    return this.commonService.postGeneric<Lead, Lead>(this.apiUrl + '/CreateNewLead', lead);
  }

  createLeads(leads: Lead[]): Observable<Lead[]> {
    return this.commonService.postGeneric<Lead[], Lead[]>(this.apiUrl + '/CreateLeads', leads);
  }

  bulkLeadUpload(leads: Lead[]): Observable<Lead[]> {
    return this.commonService.postGeneric<Lead[], Lead[]>(this.apiUrl + '/BulkLeadUpload', leads);
  }

  updateLead(lead: Lead): Observable<boolean> {
    return this.commonService.edit(lead, this.apiUrl + '/UpdateLead');
  }

  getLeadPersonByIdNumber(idNumber: string): Observable<LeadPerson> {
    return this.commonService.get<LeadPerson>(idNumber, `${this.apiUrl}/GetLeadPersonByIdNumber`);
  }

  getLeadCompanyByRegistrationNumber(registrationNumber: string): Observable<LeadCompany> {
    const urlQuery = encodeURIComponent(registrationNumber);
    return this.commonService.get<LeadCompany>(urlQuery, `${this.apiUrl}/GetLeadCompanyByRegistrationNumber`);
  }

  getLeadCompanyByCFReferenceNumber(cfReferenceNumber: string): Observable<LeadCompany> {
    const urlQuery = encodeURIComponent(cfReferenceNumber);
    return this.commonService.get<LeadCompany>(urlQuery, `${this.apiUrl}/GetLeadCompanyByCFReferenceNumber`);
  }

  getLeadCompanyByCFRegistrationNumber(cfRegistrationNumber: string): Observable<LeadCompany> {
    const urlQuery = encodeURIComponent(cfRegistrationNumber);
    return this.commonService.get<LeadCompany>(urlQuery, `${this.apiUrl}/GetLeadCompanyByCFRegistrationNumber`);
  }

  getPagedLeads(leadStatusId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Lead>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Lead>>(`${this.apiUrl}/GetPagedLeadsBasic/${leadStatusId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedLeadNotes(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<LeadNote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<LeadNote>>(`${this.apiUrl}/GetPagedLeadNotes/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addLeadNote(leadNote: LeadNote): Observable<number> {
    return this.commonService.postGeneric<LeadNote, number>(`${this.apiUrl}/AddLeadNote`, leadNote);
  }

  editLeadNote(leadNote: LeadNote): Observable<any> {
    return this.commonService.edit(leadNote, `${this.apiUrl}/EditLeadNote`);
  }

  getPagedLeadContactsV2(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<LeadContactV2>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<LeadContactV2>>(`${this.apiUrl}/GetPagedLeadContactsV2/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addLeadContactV2(leadContactV2: LeadContactV2): Observable<number> {
    return this.commonService.postGeneric<LeadContactV2, number>(`${this.apiUrl}/AddLeadContactV2`,leadContactV2);
  }

  editLeadContactV2(leadContactV2: LeadContactV2): Observable<any> {
    return this.commonService.edit(leadContactV2, `${this.apiUrl}/EditLeadContactV2`);
  }

  getPagedLeadAddresses(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<LeadAddress>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<LeadAddress>>(`${this.apiUrl}/GetPagedLeadAddresses/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addLeadAddress(leadAddress: LeadAddress): Observable<number> {
    return this.commonService.postGeneric<LeadAddress, number>(`${this.apiUrl}/AddLeadAddress`, leadAddress);
  }

  editLeadAddress(leadAddress: LeadAddress): Observable<any> {
    return this.commonService.edit(leadAddress, `${this.apiUrl}/EditLeadAddress`);
  }
}
