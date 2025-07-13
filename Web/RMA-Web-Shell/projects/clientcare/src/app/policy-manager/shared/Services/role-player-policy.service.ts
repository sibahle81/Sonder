import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RolePlayerPolicy } from '../entities/role-player-policy';
import { PolicyMovement } from '../entities/policy-movement';
import { RolePlayer } from '../entities/roleplayer';

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

  getRolePlayerAmendments(rolePlayerId: number, policyId: number): Observable<PagedRequestResult<RolePlayerPolicy>> {
    return this.commonService.getAll<PagedRequestResult<RolePlayerPolicy>>(`${this.apiRolePlayerPolicy}/GetRolePlayerAmendments/${rolePlayerId}/${policyId}`);
  }

  verifyPolicyExists(policyNumber: string): Observable<number> {
    const urlQuery = encodeURIComponent(policyNumber);
    return this.commonService.getAll<number>(`${this.apiRolePlayerPolicy}/VerifyPolicyExists/${urlQuery}`);
  }

  cancelRequestGroupPolicyChild(policyId: number, status: number): Observable<number> {
    return this.commonService.postWithNoData<number>(`${this.apiRolePlayerPolicy}/CancelRequestGroupPolicyChild/${policyId}/${status}`);
  }
 
  policySearchMoreInfo(policyId: number, rolePlayerId: number): Observable<string> {
    return this.commonService.postWithNoData<string>(`${this.apiRolePlayerPolicy}/PolicySearchMoreInfo/${policyId}/${rolePlayerId}`);
  }
 
  getGroupPolicyStatus(policyId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiRolePlayerPolicy}/GetGroupPolicyStatus/${policyId}`);
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

  searchCoidPolicies(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerPolicy>> {
    const urlQuery = encodeURIComponent(query);
    return this.
      commonService.getAll<PagedRequestResult<RolePlayerPolicy>>(`${this.apiRolePlayerPolicy}/SearchCoidPolicies/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
}
