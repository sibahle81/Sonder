import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { PolicyInsuredLife } from '../entities/policy-insured-life';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PolicyGroupMember } from '../entities/policy-group-member';

@Injectable({ providedIn: 'root' })
export class PolicyInsuredLifeService {

  private readonly api = 'clc/api/Policy/InsuredLife';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPolicyInsuredLives(policyId: number): Observable<PolicyInsuredLife[]> {
    const url = `${this.api}/GetPolicyInsuredLives/${policyId}`;
    return this.commonService.getAll(url);
  }

  getInsuredLives(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string,isChildPolicy: boolean): Observable<PagedRequestResult<PolicyInsuredLife>> {
    const url = `${this.api}/GetPagedPolicyInsuredLives/${pageNumber}/${pageSize}/RolePlayerTypeId/asc/${policyId}/${isChildPolicy}`;
    return this.commonService.getAll<PagedRequestResult<PolicyInsuredLife>>(url);
  }

  getInsuredLivesFiltered(status: number, filter: string, policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<PolicyInsuredLife>> {
    const url = `${this.api}/GetPagedPolicyInsuredLivesFiltered/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${policyId}/${filter}/${status}`;
    return this.commonService.getAll<PagedRequestResult<PolicyInsuredLife>>(url);
  }

  getGroupPolicyOnboardedMembers(policyId: number, query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<PolicyGroupMember>> {
    const search = query ? query : 'null';
    const url = `${this.api}/GroupPolicyOnboardedMembers/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${search}`;
    return this.commonService.getAll<PagedRequestResult<PolicyGroupMember>>(url);
  }

  getGroupPolicyMembers(policyId: number, query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<PolicyGroupMember>> {
    const search = query ? query : 'null';
    const url = `${this.api}/GroupPolicyMainMembers/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${search}`;
    return this.commonService.getAll<PagedRequestResult<PolicyGroupMember>>(url);
  }

  addPolicyInsuredLife(policyInsuredLife: PolicyInsuredLife): Observable<number> {
    return this.commonService.postGeneric<PolicyInsuredLife, number>(`${this.api}/CreatePolicyInsuredLife`, policyInsuredLife);
  }
}
