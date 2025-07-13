import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { RolePlayer } from '../models/roleplayer';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { Company } from '../models/company';
import { User } from 'oidc-client';

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


  updateNumberOfInjured() {
    this.createReaction$.next(true);
  }



  deleteContactInformation(contactInformationId: number): Observable<boolean> {
    return this.commonService.remove<boolean>(contactInformationId, `${this.apiUrl}`);
  }

  getPagedCompanies(companyLevelId: number, rolePlayerId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Company>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Company>>(`${this.apiUrl}/GetPagedCompanies/${companyLevelId}/${rolePlayerId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
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

}