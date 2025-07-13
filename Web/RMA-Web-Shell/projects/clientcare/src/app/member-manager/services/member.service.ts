import { User } from './../../../../../shared-models-lib/src/lib/security/user';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { RolePlayer } from './../../policy-manager/shared/entities/roleplayer';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { CancelMemberSummary } from '../../policy-manager/shared/entities/cancel-member-summary';
import { RatesUploadErrorAudit, UploadRatesSummary } from '../../policy-manager/shared/entities/upload-rates-summary';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { MemberSearch } from '../../member-manager/models/member-search';
import { NatureOfBusiness } from '../../member-manager/models/nature-of-business';
import { MemberResendEmailRequest } from '../../member-manager/models/roleplayer-contact';
import { LinkedUserMember } from '../../policy-manager/shared/entities/linked-user-member';
import { RolePlayerNote } from 'projects/shared-models-lib/src/lib/roleplayer/roleplayer-note';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { PersonEmployment } from '../../policy-manager/shared/entities/person-employment';
import { EmployeeSearchRequest } from 'projects/shared-models-lib/src/lib/member/employee-search-request';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = 'clc/api/Member/Member';
  private apiUrlDeclaration = 'clc/api/Member/Declaration';
  createReaction$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly commonService: CommonService) {
  }

  getMember(id: number): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(id, `${this.apiUrl}`);
  }

  getMembers(): Observable<RolePlayer[]> {
    return this.commonService.getAll<RolePlayer[]>(`${this.apiUrl}`);
  }

  createNewMember(rolePlayer: RolePlayer): Observable<number> {
    return this.commonService.postGeneric<RolePlayer, number>(this.apiUrl + '/CreateNewMember', rolePlayer);
  }

  updateMember(rolePlayer: RolePlayer): Observable<boolean> {
    return this.commonService.edit(rolePlayer, this.apiUrl + '/UpdateMember');
  }

  getPagedMembers(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<MemberSearch>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<MemberSearch>>(`${this.apiUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getCompaniesByCompanyLevel(companyLevel: CompanyLevelEnum): Observable<Company[]> {
    return this.commonService.get<Company[]>(companyLevel, `${this.apiUrl}/GetCompaniesByCompanyLevel`);
  }

  getSubsidiaries(rolePlayerId: number): Observable<Company[]> {
    return this.commonService.get<Company[]>(rolePlayerId, `${this.apiUrl}/GetSubsidiaries`);
  }

  generateMemberNumber(memberName: string): Observable<string> {
    const url = `${this.apiUrl}/GenerateMemberNumber/${memberName}`;
    return this.commonService.getString(url);
  }

  searchAccountExecutive(query: string): Observable<User[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<User[]>(`${this.apiUrl}/SearchAccountExecutive/${urlQuery}`);
  }

  searchMemberByNameOrNumber(query: string): Observable<Company[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Company[]>(`${this.apiUrl}/GetCompaniesByNameOrNumber/${urlQuery}`);
  }

  getNatureOfBusiness(): Observable<NatureOfBusiness[]> {
    return this.commonService.getAll<NatureOfBusiness[]>(`${this.apiUrl}/GetNatureOfBusinesses`);
  }

  updateNumberOfInjured() {
    this.createReaction$.next(true);
  }

  bulkCancel(content: any): Observable<CancelMemberSummary> {
    return this.commonService.postGeneric<any, CancelMemberSummary>(`${this.apiUrl}/MemberBulkCancel`, content);
  }

  uploadMemberRates(content: any): Observable<UploadRatesSummary> {
    return this.commonService.postGeneric<any, UploadRatesSummary>(`${this.apiUrlDeclaration}/UploadMemberRates`, content);
  }

  uploadIndustryRates(content: any): Observable<UploadRatesSummary> {
    return this.commonService.postGeneric<any, UploadRatesSummary>(`${this.apiUrlDeclaration}/UploadIndustryRates`, content);
  }

  getRateUploadErrorAudit(fileIdentifier: string): Observable<RatesUploadErrorAudit[]> {
    return this.commonService.getAll<RatesUploadErrorAudit[]>(`${this.apiUrlDeclaration}/GetRateUploadErrorAudit/${fileIdentifier}`);
  }

  getPagedMemberRenewalEmailAudit(itemType: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<EmailAudit>> {
    const itemTypeParam = encodeURIComponent(itemType.toString());
    const urlQuery = encodeURIComponent(query);
    const startDate = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<EmailAudit>>(`${this.apiUrl}/GetPagedEmailAudit/${itemTypeParam}/${startDate}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  resendRenewalLetter(memberResendEmailRequest: MemberResendEmailRequest) {
    return this.commonService.edit(memberResendEmailRequest, `${this.apiUrl}/ResendRenewalLetter`);
  }

  deleteContactInformation(contactInformationId: number): Observable<boolean> {
    return this.commonService.remove<boolean>(contactInformationId, `${this.apiUrl}`);
  }

  getPagedCompanies(companyLevelId: number, rolePlayerId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Company>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Company>>(`${this.apiUrl}/GetPagedCompanies/${companyLevelId}/${rolePlayerId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedPersons(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Person>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Person>>(`${this.apiUrl}/GetPagedPersons/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getLinkedUserMembers(userId: number): Observable<LinkedUserMember[]> {
    return this.commonService.getAll<LinkedUserMember[]>(`${this.apiUrl}/GetLinkedUserMembers/${userId}`);
  }

  getPagedLinkedUserMembers(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<LinkedUserMember>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<LinkedUserMember>>(`${this.apiUrl}/GetPagedLinkedUserMembers/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addRolePlayerNote(rolePlayerNote: RolePlayerNote): Observable<number> {
    return this.commonService.postGeneric<RolePlayerNote, number>(`${this.apiUrl}/AddRolePlayerNote`, rolePlayerNote);
  }

  editRolePlayerNote(rolePlayerNote: RolePlayerNote): Observable<any> {
    return this.commonService.edit(rolePlayerNote, `${this.apiUrl}/EditRolePlayerNote`);
  }

  getPagedRolePlayerNotes(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerNote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerNote>>(`${this.apiUrl}/GetPagedRolePlayerNotes/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchMembers(industryClassId: number, clientTypeId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.apiUrl}/SearchMembers/${industryClassId}/${clientTypeId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getMemberCompanyByRegistrationNumber(registrationNumber: string): Observable<Company> {
    const urlQuery = encodeURIComponent(registrationNumber);
    return this.commonService.get<Company>(urlQuery, `${this.apiUrl}/GetMemberCompanyByRegistrationNumber`);
  }

  getMemberCompanyByCFReferenceNumber(cfReferenceNumber: string): Observable<Company> {
    const urlQuery = encodeURIComponent(cfReferenceNumber);
    return this.commonService.get<Company>(urlQuery, `${this.apiUrl}/GetMemberCompanyByCFReferenceNumber`);
  }

  getMemberCompanyByCFRegistrationNumber(cfRegistrationNumber: string): Observable<Company> {
    const urlQuery = encodeURIComponent(cfRegistrationNumber);
    return this.commonService.get<Company>(urlQuery, `${this.apiUrl}/GetMemberCompanyByCFRegistrationNumber`);
  }

  getPagedEmployees(employeeSearchRequest: EmployeeSearchRequest): Observable<PagedRequestResult<PersonEmployment>> {
    return this.commonService.postGeneric<EmployeeSearchRequest, PagedRequestResult<PersonEmployment>>(`${this.apiUrl}/GetPagedEmployees/`, employeeSearchRequest);
  }
}