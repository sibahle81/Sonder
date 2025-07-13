import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RolePlayerRelation } from './../entities/roleplayer-relation';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { RolePlayerType } from '../entities/roleplayer-type';
import { RolePlayer } from '../entities/roleplayer';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { IdTypeEnum } from '../enums/idTypeEnum';
import { Refund } from 'projects/fincare/src/app/billing-manager/models/refund';
import { FinPayee } from 'projects/fincare/src/app/shared/models/finpayee';
import { DebtorSearchResult } from 'projects/fincare/src/app/shared/models/debtor-search-result';
import { PreviousInsurerRolePlayer } from '../entities/previous-insurer-roleplayer';
import { RolePlayerContact } from '../../../member-manager/models/roleplayer-contact';
import { PersonEmployment } from '../entities/person-employment';
import { ClientVopdResponse } from '../entities/vopd-response';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { RolePlayerAddress } from '../entities/role-player-address';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Injectable({
  providedIn: 'root'
}
)
export class RolePlayerService {
  api = 'clc/api/RolePlayer/RolePlayer';
  apiRoleplayerPolicy = 'clc/api/RolePlayer/RolePlayerPolicy';
  apiRolePlayerNotes = 'clc/api/RolePlayer/RolePlayerNotes';

  constructor(
    private readonly commonService: CommonService
  ) { }

  getRolePlayers(): Observable<RolePlayer[]> {
    const results = this.commonService.getAll<RolePlayer[]>(`${this.api}`);
    return results;
  }

  getRolePlayerTypeIsRelation(): Observable<RolePlayerType[]> {
    const results = this.commonService.getAll<RolePlayerType[]>(`${this.api}/GetRolePlayerTypesIsRelation`);
    return results;
  }

  getRolePlayer(id: number): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(id, `${this.api}`);
  }

  GetMainMemberByPolicyId(policyId: number): Observable<RolePlayerRelation> {
    return this.commonService.getAll<RolePlayerRelation>(`${this.api}/GetMainMemberByPolicyId/${policyId}`);
  }

  doesRelationExist(relation: RolePlayerRelation): Observable<boolean> {
    return this.commonService.postGeneric<RolePlayerRelation, boolean>(`${this.api}/DoesRelationExist/`, relation);
  }

  checkVopdStatus(rolePlayerId: number): Observable<boolean> {
    return this.commonService.get<boolean>(rolePlayerId, `${this.api}/CheckVopdStatus`);
  }

  getVOPDResponseResultByRoleplayerId(rolePlayerId: number): Observable<ClientVopdResponse> {
    return this.commonService.get<ClientVopdResponse>(rolePlayerId, `${this.api}/GetVOPDResponseResultByRoleplayerId`);
  }

  CheckIfGroupPolicy(policyId: number): Observable<boolean> {
    return this.commonService.get<boolean>(policyId, `${this.api}/CheckIfGroupPolicy`);
  }

  updateRolePlayer(rolePlayer: RolePlayer): Observable<boolean> {
    return this.commonService.edit(rolePlayer, `${this.api}`);
  }

  updateRolePlayerRelations(relation: RolePlayerRelation): Observable<boolean> {
    return this.commonService.edit(relation, `${this.api}/UpdateRolePlayerRelations`);
  }

  addRolePlayer(rolePlayer: RolePlayer): Observable<number> {
    return this.commonService.postGeneric<RolePlayer, number>(this.api, rolePlayer);
  }

  addRolePlayerRelation(rolePlayerRelation: RolePlayerRelation): Observable<number> {
    return this.commonService.postGeneric<RolePlayerRelation, number>(`${this.api}/AddRelation`, rolePlayerRelation);
  }

  SearchRolePlayerByRegistrationNumber(keyRole: KeyRoleEnum, registrationNumber: string): Observable<RolePlayer> {
    const urlRegistrationNumber = encodeURIComponent(registrationNumber);
    const url = `${this.api}/${keyRole}/${urlRegistrationNumber}`;
    return this.commonService.getAll<RolePlayer>(url);
  }

  SearchRolePlayersByRegistrationNumber(keyRole: KeyRoleEnum, registrationNumber: string): Observable<RolePlayer[]> {
    const urlRegistrationNumber = encodeURIComponent(registrationNumber);
    const url = `${this.api}/GetByRegistrationNumber/${keyRole}/${urlRegistrationNumber}`;
    return this.commonService.getAll<RolePlayer[]>(url);
  }

  GetPersonDetailsByIdNumber(idType: IdTypeEnum, query: string): Observable<RolePlayer> {
    const url = `${this.api}/GetPersonDetailsByIdNumber/${idType}/${query}`;
    return this.commonService.getAll<RolePlayer>(url);
  }

  getRolePlayerTypes(ids: number[]): Observable<RolePlayerType[]> {
    const typeIds = ids.map(id => `typeId=${id}`).join('&');
    const url = `${this.api}/GetRolePlayerTypes?${typeIds}`;
    return this.commonService.getAll(url);
  }

  getLinkedRolePlayers(rolePlayerId: number, ids: number[]): Observable<RolePlayer[]> {
    const typeIds = ids.map(id => `typeId=${id}`).join('&');
    const url = `${this.api}/GetLinkedRolePlayers/${rolePlayerId}?${typeIds}`;
    return this.commonService.getAll(url);
  }

  getPersonRolePlayerByIdNumber(idnumber: string, idType: number): Observable<RolePlayer[]> {
    const urlQuery = encodeURIComponent(idnumber);
    return this.commonService.getAll<RolePlayer[]>(`${this.api}/GetPersonRolePlayerByIdNumber/${idType}/${urlQuery}`);
  }

  getRolePlayerByIdNumber(idnumber: string): Observable<RolePlayer[]> {
    const urlQuery = encodeURIComponent(idnumber);
    return this.commonService.getAll<RolePlayer[]>(`${this.api}/GetRolePlayerByIdNumber/${urlQuery}`);
  }

  GetInsuredLifeByPolicyId(policyId: number): Observable<RolePlayer[]> {
    return this.commonService.getAll<RolePlayer[]>(`${this.api}/GetInsuredLifeByPolicyId/${policyId}`);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.api}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getAllPoliciesDueRefunds(): Observable<Refund[]> {
    const url = `${this.apiRoleplayerPolicy}/GetAllPoliciesDueRefunds`;
    return this.commonService.getAll<Refund[]>(url);
  }

  getBankingDetailsByRolePlayerId(roleplayerId: number): Observable<RolePlayerBankingDetail[]> {
    const url = `${this.api}/GetBankingDetailsByRolePlayerId/${roleplayerId}`;
    return this.commonService.getAll<RolePlayerBankingDetail[]>(url);
  }

  getFinPayee(roleplayerId: number): Observable<FinPayee> {
    const url = `${this.api}/GetFinPayee/${roleplayerId}`;
    return this.commonService.getAll<FinPayee>(url);
  }

  searchForFinPayees(query: string): Observable<DebtorSearchResult[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<DebtorSearchResult[]>(`${this.api}/SearchForFinPayees/${urlQuery}`);
  }

  GetDebtorIndustryClassBankAccountNumber(finPayeNumber: string): Observable<string> {
    const urlQuery = encodeURIComponent(finPayeNumber);
    return this.commonService.getAll<string>(`${this.api}/GetDebtorIndustryClassBankAccountNumber/${urlQuery}`);
  }

  getActiveBankingDetails(roleplayerId: number): Observable<RolePlayerBankingDetail> {
    const url = `${this.api}/GetActiveBankingDetails/${roleplayerId}`;
    return this.commonService.getAll<RolePlayerBankingDetail>(url);
  }

  getPreviousInsurerRolePlayer(roleplayerId: number): Observable<PreviousInsurerRolePlayer> {
    const results = this.commonService.getAll<PreviousInsurerRolePlayer>(`${this.api}/GetPreviousInsurerRolePlayer/${roleplayerId}`);
    return results;
  }

  CheckIfRolePlayerExists(idNumber: string): Observable<number> {
    const results = this.commonService.get<number>(idNumber, `${this.api}/CheckIfRolePlayerExists`);
    return results;
  }

  rolePlayerExists(rolePlayerId: number): Observable<boolean> {
    const result = this.commonService.get<boolean>(rolePlayerId, `${this.api}/RolePlayerExists`);
    return result;
  }

  getRolePlayerNotes(rolePlayerId: number): Observable<Note[]> {
    const results = this.commonService.get<Note[]>(rolePlayerId, `${this.apiRolePlayerNotes}`);
    return results;
  }

  addRolePlayerNote(note: Note): Observable<number> {
    return this.commonService.postGeneric<Note, number>(this.apiRolePlayerNotes, note);
  }

  getBankingDetailsByAccountNumber(accountNumber: string): Observable<RolePlayerBankingDetail[]> {
    const url = `${this.api}/GetBankingDetailsByAccountNumber/${accountNumber}`;
    return this.commonService.getAll<RolePlayerBankingDetail[]>(url);
  }

  getRolePlayerContactInformation(rolePlayerId: number): Observable<RolePlayerContact[]> {
    const url = `${this.api}/GetRolePlayerContactDetails/${rolePlayerId}`;
    return this.commonService.getAll<RolePlayerContact[]>(url);
  }

  updateRolePlayerContact(rolePlayerContact: RolePlayerContact): Observable<number> {
    return this.commonService.editIsresolved(rolePlayerContact, `${this.api}/EditRolePlayerContact`);
  }

  addRolePlayerContact(rolePlayerContact: RolePlayerContact): Observable<number> {
    return this.commonService.postGeneric<RolePlayerContact, number>(`${this.api}/CreateRolePlayerContactDetails`, rolePlayerContact);
  }

  addPersonEmployment(personEmployment: PersonEmployment): Observable<number> {
    return this.commonService.postGeneric<PersonEmployment, number>(`${this.api}/CreatePersonEmployment`, personEmployment);
  }

  updatePersonEmployment(personEmployment: PersonEmployment): Observable<number> {
    return this.commonService.editIsresolved(personEmployment, `${this.api}/EditPersonEmployment`);
  }

  getPersonEmployment(personEmployeeId: number, personEmployerId: number): Observable<PersonEmployment> {
    const url = `${this.api}/GetPersonEmployment/${personEmployeeId}/${personEmployerId}`;
    return this.commonService.getAll<PersonEmployment>(url);
  }

  getPersonEmploymentByPersonEmploymentId(personEmploymentId: number): Observable<PersonEmployment> {
    const url = `${this.api}/GetPersonEmploymentByPersonEmploymentId/${personEmploymentId}`;
    return this.commonService.getAll<PersonEmployment>(url);
  }

  getRolePlayerPolicyCount(rolePlayerId: number): Observable<number> {
    const url = `${this.api}/GetRolePlayerPolicyCount/${rolePlayerId}`;
    return this.commonService.getAll<number>(url);
  }

  GetDebtorIndustryClass(finPayeNumber: string): Observable<IndustryClassEnum> {
    const urlQuery = encodeURIComponent(finPayeNumber);
    return this.commonService.getAll<IndustryClassEnum>(`${this.api}/GetDebtorIndustryClass/${urlQuery}`);
  }

  getPersonEmploymentByIndustryNumber(industryNumber: string): Observable<PersonEmployment> {
    const urlQuery = encodeURIComponent(industryNumber);
    return this.commonService.getAll<PersonEmployment>(`${this.api}/GetPersonEmploymentByIndustryNumber/${urlQuery}`);
  }

  getFinPayeeByDebtorNumber(finPayeNumber: string): Observable<FinPayee> {
    const urlQuery = encodeURIComponent(finPayeNumber);
    return this.commonService.getAll<FinPayee>(`${this.api}/GetFinPayeeByFinpayeNumber/${urlQuery}`);
  }

  addBeneficiary(rolePlayer: RolePlayer): Observable<number> {
    return this.commonService.postGeneric<RolePlayer, number>(`${this.api}/SaveBeneficiary`, rolePlayer);
  }

  getPagedRolePlayerContacts(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerContact>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerContact>>(`${this.api}/GetPagedRolePlayerContacts/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedBeneficiaries(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.api}/GetPagedBeneficiaries/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getBeneficiary(beneficiaryId: number): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(beneficiaryId, `${this.api}/GetBeneficiary`);
  }

  getBeneficiaries(ids: number[]): Observable<RolePlayer[]> {
    const roleplayerIds = ids.map(id => `roleplayerIds=${id}`).join('&');
    const url = `${this.api}/GetBeneficiaries?${roleplayerIds}`;
    return this.commonService.getAll(url);
  }

  getClaimant(beneficiaryId: number): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(beneficiaryId, `${this.api}/GetBeneficiary`);
  }

  getPagedRolePlayerAddress(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerAddress>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerAddress>>(`${this.api}/GetPagedRolePlayerAddress/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerBankingDetails(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerBankingDetail>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerBankingDetail>>(`${this.api}/GetPagedRolePlayerBankingDetails/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updateRolePlayerAddress(rolePlayerAddress: RolePlayerAddress): Observable<number> {
    return this.commonService.postGeneric<RolePlayerAddress, number>(`${this.api}/UpdateRolePlayerAddress`, rolePlayerAddress);
  }

  createRolePlayerAddress(rolePlayerContact: RolePlayerAddress): Observable<number> {
    return this.commonService.postGeneric<RolePlayerAddress, number>(`${this.api}/CreateRolePlayerAddress`, rolePlayerContact);
  }

  deleteRolePlayerRelation(rolePlayerRelation: RolePlayerRelation): Observable<boolean> {
    return this.commonService.edit(rolePlayerRelation, `${this.api}/DeleteRolePlayerRelation`);
  }

  searchDebtors(industryClassId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.api}/SearchDebtors/${industryClassId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updateDebtor(debtor: FinPayee): Observable<boolean> {
    return this.commonService.postGeneric<FinPayee, boolean>(`${this.api}/UpdateDebtor`, debtor);
  }

  overrideRolePlayerVopd(dateOfDeath: Date, idNumber: string, firstName: string, surname: string, deceasedStatus: string, vopdDatetime: Date, fileIdentifier: string): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.api}/OverrideRolePlayerVopd`, { dateOfDeath, idNumber, firstName, surname, deceasedStatus, vopdDatetime, fileIdentifier });
  }

  getRolePlayerPersonByIdOrPassport(idPassportNumber: string): Observable<RolePlayer> {
    return this.commonService.get<RolePlayer>(idPassportNumber, `${this.api}/GetRolePlayerPersonByIdOrPassport`);
  }

  getPagedPersonEmployment(employerRolePlayerId: number, employeeRolePlayerId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PersonEmployment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PersonEmployment>>(`${this.api}/GetPagedPersonEmployment/${employerRolePlayerId}/${employeeRolePlayerId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayers(rolePlayerIdentificationTypeId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.api}/GetPagedRolePlayers/${rolePlayerIdentificationTypeId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerRelations(fromRolePlayerId: number, rolePlayerRelationTypeId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.api}/GetPagedRolePlayerRelations/${fromRolePlayerId}/${rolePlayerRelationTypeId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerPolicyRelations(rolePlayerId: number, policyId: number, rolePlayerRelationTypeId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.api}/GetPagedRolePlayerPolicyRelations/${rolePlayerId}/${policyId}/${rolePlayerRelationTypeId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  GetDebtorBankAccountNumbers(finPayeeNumber: string): Observable<string[]> {
    const urlQuery = encodeURIComponent(finPayeeNumber);
    return this.commonService.getAll<string[]>(`${this.api}/GetDebtorBankAccountNumbers/${urlQuery}`);
  }
}

