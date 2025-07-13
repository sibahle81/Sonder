import { Dashboard } from './../../../../../clientcare/src/app/policy-manager/shared/entities/dashboard/dashboard';
import { IndustryClassEnum } from '../../../../../shared-models-lib/src/lib/enums/industry-class.enum';
import { Injectable } from '@angular/core';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { Observable } from 'rxjs';
import { CommonService } from '../../../../../shared-services-lib/src/lib/services/common/common.service';
import { CancellationSummary } from '../models/cancellation-summary';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private policyApiUrl = 'clc/api/Policy/Policy';

  constructor(private readonly commonService: CommonService) { }

  getCancellationsSummaryPerYear(): Observable<CancellationSummary[]> {
    return this.commonService.getAll<CancellationSummary[]>(`${this.policyApiUrl}/GetCancellationsSummaryPerYear`);
  }

  getCancellationsSummaryPerMonth(): Observable<CancellationSummary[]> {
    return this.commonService.getAll<CancellationSummary[]>(`${this.policyApiUrl}/GetCancellationsSummaryPerMonth`);
  }

  getCancellationsSummaryPerReason(): Observable<CancellationSummary[]> {
    return this.commonService.getAll<CancellationSummary[]>(`${this.policyApiUrl}/GetCancellationsSummaryPerReason`);
  }

  getCancellationsSummaryPerResolved(): Observable<CancellationSummary[]> {
    return this.commonService.getAll<CancellationSummary[]>(`${this.policyApiUrl}/GetCancellationsSummaryPerResolved`);
  }

  getPoliciesWithStatus(status: PolicyStatusEnum): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.policyApiUrl}/GetPoliciesWithStatus/${status}`);
  }

  getActiveEmployees(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetActiveEmployees`);
  }

  getAmountInvoiced(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetAmountInvoiced`);
  }

  getNONCoidMetalMembersPerMonth(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNONCoidMetalMembersPerMonth`);
  }

  getNONCoidMetalMembersPerProduct(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNONCoidMetalMembersPerProduct`);
  }

  getNONCoidMiningMembersPerMonth(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNONCoidMiningMembersPerMonth`);
  }

  getNONCoidMiningMembersPerProduct(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNONCoidMiningMembersPerProduct`);
  }

  getActiveNumberOfMembersCLASSXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetActiveNumberOfMembersCLASSXIII`);
  }

  getAmountInvoicedCLASSXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetAmountInvoicedCLASSXIII`);
  }

  getNumberOFLivesCLASSXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNumberOFLivesCLASSXIII`);
  }

  getNumberOFLivesCLASSIV(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNumberOFLivesCLASSIV`);
  }

  getAmountPaidCLASSIV(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetAmountPaidCLASSIV`);
  }

  getAmountPaidCLASSXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetAmountPaidCLASSXIII`);
  }

  getNewBusinessCOIDPoliciesCLASSXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNewBusinessCOIDPoliciesCLASSXIII`);
  }

  getNewBusinessCOIDPoliciesCLASSIV(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetNewBusinessCOIDPoliciesCLASSIV`);
  }

  getMembersPerIndustryClassXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetMembersPerIndustryClassXIII`);
  }

  getCancellationsCLASSXIII(): Observable<Dashboard[]> {
    return this.commonService.getAll<Dashboard[]>(`${this.policyApiUrl}/GetCancellationsCLASSXIII`);
  }

  getOnlyPoliciesByRolePlayer(roleplayerId: number): Observable<Policy[]> {
    return this.commonService.get<Policy[]>(roleplayerId, `${this.policyApiUrl}/GetOnlyPoliciesByRolePlayer`);
  }

  getPoliciesWithProductOptionByRolePlayer(roleplayerId: number): Observable<Policy[]> {
    return this.commonService.get<Policy[]>(roleplayerId, `${this.policyApiUrl}/GetPoliciesWithProductOptionByRolePlayer`);
  }

  getPolicyWithProductOptionByPolicyId(policyId: number): Observable<Policy> {
    return this.commonService.get<Policy>(policyId, `${this.policyApiUrl}/GetPolicyWithProductOptionByPolicyId`);
  }
}
