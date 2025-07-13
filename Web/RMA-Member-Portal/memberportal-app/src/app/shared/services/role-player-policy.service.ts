import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PolicyMovement } from "src/app/case/models/policy-movement";
import { PagedRequestResult } from "src/app/core/models/pagination/PagedRequestResult.model";
import { CommonService } from "src/app/core/services/common/common.service";
import { RolePlayerPolicy } from "../models/role-player-policy";
import { RolePlayer } from "../models/roleplayer";

@Injectable({
  providedIn: 'root'
})
export class RolePlayerPolicyService {

  private apiRolePlayerPolicy = 'clc/api/RolePlayer/RolePlayerPolicy';

  constructor(private readonly commonService: CommonService) { }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerPolicy>> {
    const urlQuery = encodeURIComponent(query);
    return this.
      commonService.getAll<PagedRequestResult<RolePlayerPolicy>>(`${this.apiRolePlayerPolicy}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getRolePlayerPolicy(id: number): Observable<RolePlayerPolicy> {
    return this.commonService.get<RolePlayerPolicy>(id, `${this.apiRolePlayerPolicy}`);
  }

  getRolePlayerPolicyByNumber(policyNumber: string): Observable<RolePlayerPolicy> {
    const urlQuery = encodeURIComponent(policyNumber);
    return this.commonService.getAll<RolePlayerPolicy>(`${this.apiRolePlayerPolicy}/GetRolePlayerPolicyByNumber/${urlQuery}`);
  }

  verifyPolicyExists(policyNumber: string): Observable<number> {
    const urlQuery = encodeURIComponent(policyNumber);
    return this.commonService.getAll<number>(`${this.apiRolePlayerPolicy}/VerifyPolicyExists/${urlQuery}`);
  }

  searchPoliciesForCase(query: string): Observable<RolePlayerPolicy[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<RolePlayerPolicy[]>(`${this.apiRolePlayerPolicy}/SearchPoliciesForCase/${urlQuery}`);
  }

  searchPoliciesByIdNumberForCase(query: string): Observable<RolePlayerPolicy[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<RolePlayerPolicy[]>(`${this.apiRolePlayerPolicy}/SearchPoliciesByIdNumberForCase/${urlQuery}`);
  }

  searchPoliciesByRolePlayerForCase(rolePlayerId: number): Observable<RolePlayerPolicy[]> {
    return this.commonService.getAll<RolePlayerPolicy[]>(`${this.apiRolePlayerPolicy}/SearchPoliciesByRolePlayerForCase/${rolePlayerId}`);
  }

  getPoliciesForRepresentative(representativeId: string): Observable<RolePlayerPolicy[]> {
    const urlQuery = encodeURIComponent(representativeId);
    return this.commonService.getAll<RolePlayerPolicy[]>(`${this.apiRolePlayerPolicy}/GetPoliciesByRepresentativeId/${urlQuery}`);
  }

  verifyPolicyMovementExists(refNumber: string): Observable<PolicyMovement> {
    const urlQuery = encodeURIComponent(refNumber);
    return this.commonService.getAll<PolicyMovement>(`${this.apiRolePlayerPolicy}/VerifyPolicyMovementExists/${urlQuery}`);
  }

  updatePolicyStatus(rolePlayerPolicy: RolePlayerPolicy): Observable<boolean> {
    return this.commonService.edit<RolePlayerPolicy>(rolePlayerPolicy, `${this.apiRolePlayerPolicy}/UpdatePolicyStatus}`);
  }

  getInsuredLivesToContinuePolicy(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.apiRolePlayerPolicy}/GetInsuredLivesToContinuePolicy/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPoliciesByPolicyPayeeIdNoRefData(rolePlayerId: number): Observable<RolePlayerPolicy[]> {
    return this.commonService.getAll<RolePlayerPolicy[]>(`${this.apiRolePlayerPolicy}/GetPoliciesByPolicyPayeeIdNoRefData/${rolePlayerId}`);
  }

  getPoliciesByPolicyOwnerIdNoRefData(rolePlayerId: number): Observable<RolePlayerPolicy[]> {
    return this.commonService.getAll<RolePlayerPolicy[]>(`${this.apiRolePlayerPolicy}/GetPoliciesByPolicyOwnerIdNoRefData/${rolePlayerId}`);
  }

  editRolePlayerPolicies(roleplayerPolicies: RolePlayerPolicy[]) {
    return this.commonService.edit(roleplayerPolicies, `${this.apiRolePlayerPolicy}/EditRolePlayerPolicies`);
  }
}
