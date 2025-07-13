import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PagedRequestResult } from "src/app/core/models/pagination/PagedRequestResult.model";
import { CommonService } from "src/app/core/services/common/common.service";
import { ConstantApi } from "../constants/constant";
import { IdTypeEnum } from "../enums/id-type.enum";
import { KeyRoleEnum } from "../enums/key-role-enum";
import { FinPayee } from "../models/finpayee";
import { RolePlayerBankingDetail } from "../models/role-player-banking-detail";
import { RolePlayer } from "../models/roleplayer";
import { RolePlayerRelation } from "../models/roleplayer-relation";
import { RolePlayerType } from "../models/roleplayer-type";
import { RolePlayerContact } from "../models/roleplayer-contact";
import { RolePlayerAddress } from "../models/role-player-address";



@Injectable()
export class RolePlayerService {


  constructor(
    private readonly commonService: CommonService
  ) { }

  getRolePlayers(): Observable<RolePlayer[]> {
    const results = this.commonService.getAll<RolePlayer[]>(`${ConstantApi.RolePlayerUrl}`);
    return results;
  }

  getRolePlayerTypeIsRelation(): Observable<RolePlayerType[]> {
    const results = this.commonService.getAll<RolePlayerType[]>(`${ConstantApi.RolePlayerUrl}/GetRolePlayerTypesIsRelation`);
    return results;
  }

  getFinPayee(roleplayerId: number): Observable<FinPayee> {
    const url = `${ConstantApi.RolePlayerUrl}/GetFinPayee/${roleplayerId}`;
    return this.commonService.getAll<FinPayee>(url);
  }

  getRolePlayer(id: number): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(id, `${ConstantApi.RolePlayerUrl}`);
  }

  GetMemberPortalPolicyRolePlayer(id: number): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(id, `${ConstantApi.RolePlayerUrl}/GetMemberPortalPolicyRolePlayer`);
  }

  GetMainMemberByPolicyId(policyId: number): Observable<RolePlayerRelation> {
    return this.commonService.getAll<RolePlayerRelation>(`${ConstantApi.RolePlayerUrl}/GetMainMemberByPolicyId/${policyId}`);
  }

  doesRelationExist(relation: RolePlayerRelation): Observable<boolean> {
    return this.commonService.postRelation(`${ConstantApi.RolePlayerUrl}/DoesRelationExist/`, relation);
  }

  checkVopdStatus(rolePlayerId: number): Observable<boolean> {
    return this.commonService.get<boolean>(rolePlayerId, `${ConstantApi.RolePlayerUrl}/CheckVopdStatus`);
  }

  CheckIfGroupPolicy(policyId: number): Observable<boolean> {
    return this.commonService.get<boolean>(policyId, `${ConstantApi.RolePlayerUrl}/CheckIfGroupPolicy`);
  }

  updateRolePlayer(rolePlayer: RolePlayer): Observable<boolean> {
    return this.commonService.edit(rolePlayer, `${ConstantApi.RolePlayerUrl}`);
  }

  addRolePlayer(rolePlayer: RolePlayer): Observable<number> {
    return this.commonService.add(rolePlayer, ConstantApi.RolePlayerUrl);
  }

  addRolePlayerRelation(rolePlayerRelation: RolePlayerRelation): Observable<number> {
    return this.commonService.add(rolePlayerRelation, `${ConstantApi.RolePlayerUrl}/AddRelation`);
  }

  SearchRolePlayerByRegistrationNumber(keyRole: KeyRoleEnum, registrationNumber: string): Observable<RolePlayer> {
    const url = `${ConstantApi.RolePlayerUrl}/${keyRole}/${registrationNumber}`;
    return this.commonService.getAll<RolePlayer>(url);
  }

  GetPersonDetailsByIdNumber(idType: IdTypeEnum, query: string): Observable<RolePlayer> {
    const url = `${ConstantApi.RolePlayerUrl}/GetPersonDetailsByIdNumber/${idType}/${query}`;
    return this.commonService.getAll<RolePlayer>(url);
  }

  getRolePlayerTypes(ids: number[]): Observable<RolePlayerType[]> {
    const typeIds = ids.map(id => `typeId=${id}`).join('&');
    const url = `${ConstantApi.RolePlayerUrl}/GetRolePlayerTypes?${typeIds}`;
    return this.commonService.getAll(url);
  }

  getLinkedRolePlayers(rolePlayerId: number, ids: number[]): Observable<RolePlayer[]> {
    const typeIds = ids.map(id => `typeId=${id}`).join('&');
    const url = `${ConstantApi.RolePlayerUrl}/GetLinkedRolePlayers/${rolePlayerId}?${typeIds}`;
    return this.commonService.getAll(url);
  }

  getPersonRolePlayerByIdNumber(idnumber: string, idType: number): Observable<RolePlayer[]> {
    const urlQuery = encodeURIComponent(idnumber);
    return this.commonService.getAll<RolePlayer[]>(`${ConstantApi.RolePlayerUrl}/GetPersonRolePlayerByIdNumber/${idType}/${urlQuery}`);
  }

  GetInsuredLifeByPolicyId(policyId: number): Observable<RolePlayer[]> {
    return this.commonService.getAll<RolePlayer[]>(`${ConstantApi.RolePlayerUrl}/GetInsuredLifeByPolicyId/${policyId}`);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${ConstantApi.RolePlayerUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getBankingDetailsByRolePlayerId(roleplayerId: number): Observable<RolePlayerBankingDetail[]> {
    const url = `${ConstantApi.RolePlayerUrl}/GetBankingDetailsByRolePlayerId/${roleplayerId}`;
    return this.commonService.getAll<RolePlayerBankingDetail[]>(url);
  }

  GetDebtorIndustryClassBankAccountNumber(finPayeNumber: string): Observable<string> {
    const urlQuery = encodeURIComponent(finPayeNumber);
    return this.commonService.getAll<string>(`${ConstantApi.RolePlayerUrl}/GetDebtorIndustryClassBankAccountNumber/${urlQuery}`);
  }

  getActiveBankingDetails(roleplayerId: number): Observable<RolePlayerBankingDetail> {
    const url = `${ConstantApi.RolePlayerUrl}/GetActiveBankingDetails/${roleplayerId}`;
    return this.commonService.getAll<RolePlayerBankingDetail>(url);
  }

  rolePlayerExists(rolePlayerId: number): Observable<boolean> {
    const result = this.commonService.get<boolean>(rolePlayerId, `${ConstantApi.RolePlayerUrl}/RolePlayerExists`);
    return result;
  }

  getPagedRolePlayerBankingDetails(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerBankingDetail>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerBankingDetail>>(`${ConstantApi.RolePlayerUrl}}/GetPagedRolePlayerBankingDetails/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updateRolePlayerContact(rolePlayerContact: RolePlayerContact): Observable<number> {
    return this.commonService.editIsresolved(rolePlayerContact, `${ConstantApi.RolePlayerUrl}/EditRolePlayerContact`);
  }

  addRolePlayerContact(rolePlayerContact: RolePlayerContact): Observable<number> {
    return this.commonService.postGeneric<RolePlayerContact, number>(`${ConstantApi.RolePlayerUrl}/CreateRolePlayerContactDetails`, rolePlayerContact);
  }

  
  getPagedRolePlayerAddress(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerAddress>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerAddress>>(`${ConstantApi.RolePlayerUrl}/GetPagedRolePlayerAddress/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
  
  getPagedRolePlayerContacts(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerContact>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerContact>>(`${ConstantApi.RolePlayerUrl}/GetPagedRolePlayerContacts/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

}

