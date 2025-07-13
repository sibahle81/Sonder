import { Injectable } from '@angular/core';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../member-manager/models/industry-class-declaration-configuration';
import { ClientRate } from '../../policy-manager/shared/entities/client-rate';
import { ClientRateRequest } from '../../policy-manager/shared/entities/client-rate-request';
import { Company } from '../../policy-manager/shared/entities/company';
import { RateIndustry } from '../../policy-manager/shared/entities/rate-industry';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RatesUploadErrorAudit } from '../../policy-manager/shared/entities/upload-rates-summary';
import { RolePlayerPolicyTransaction } from '../../policy-manager/shared/entities/role-player-policy-transaction';
import { RolePlayerPolicyDeclaration } from '../../policy-manager/shared/entities/role-player-policy-declaration';
import { DatePipe } from '@angular/common';
import { Policy } from '../../policy-manager/shared/entities/policy';
import { ComplianceResult } from '../../policy-manager/shared/entities/compliance-result';
import { LoadRate } from '../../policy-manager/shared/entities/load-rate';
import { RolePlayerPolicyOnlineSubmission } from '../../policy-manager/shared/entities/role-player-policy-online-submission';

@Injectable({ providedIn: 'root' })

export class DeclarationService {
  private api = 'clc/api/Member/Declaration';
  private rateIndustryApi = 'mdm/api/RateIndustry';

  datePipe = new DatePipe('en-US');

  constructor(
    private readonly commonService: CommonService
  ) {
  }

  getMemberComplianceStatus(rolePlayerId: number): Observable<ComplianceResult> {
    return this.commonService.getAll<ComplianceResult>(`${this.api}/GetMemberComplianceStatus/${rolePlayerId}`);
  }

  getPolicyComplianceStatus(policyId: number): Observable<ComplianceResult> {
    return this.commonService.getAll<ComplianceResult>(`${this.api}/GetPolicyComplianceStatus/${policyId}`);
  }

  getClientRate(clientRateRequest: ClientRateRequest): Observable<ClientRate> {
    return this.commonService.get<ClientRate>(clientRateRequest, `${this.api}`);
  }

  getClientRates(rolePlayerId: number): Observable<ClientRate[]> {
    return this.commonService.getAll<ClientRate[]>(`${this.api}/GetClientRates/${rolePlayerId}`);
  }

  getIndustryClassDeclarationConfigurations(): Observable<IndustryClassDeclarationConfiguration[]> {
    return this.commonService.getAll<IndustryClassDeclarationConfiguration[]>(`${this.api}/GetIndustryClassDeclarationConfigurations`);
  }

  getIndustryClassDeclarationConfiguration(industryClass: IndustryClassEnum): Observable<IndustryClassDeclarationConfiguration> {
    return this.commonService.get<IndustryClassDeclarationConfiguration>(industryClass, `${this.api}/GetIndustryClassDeclarationConfiguration`);
  }

  createIndustryClassDeclarationConfigurations(industryClassDeclarationConfigurations: IndustryClassDeclarationConfiguration[]): Observable<number> {
    return this.commonService.postGeneric<IndustryClassDeclarationConfiguration[], number>(this.api + '/CreateIndustryClassDeclarationConfigurations', industryClassDeclarationConfigurations);
  }

  updateIndustryClassDeclarationConfigurations(industryClassDeclarationConfigurations: IndustryClassDeclarationConfiguration[]): Observable<boolean> {
    return this.commonService.edit<IndustryClassDeclarationConfiguration[]>(industryClassDeclarationConfigurations, this.api + '/UpdateIndustryClassDeclarationConfigurations');
  }

  getIndustryRates(industryName: string, industryGroup: string, ratingYear: number): Observable<RateIndustry[]> {
    return this.commonService.getAll<RateIndustry[]>(`${this.rateIndustryApi}/GetRates/${industryName}/${industryGroup}/${ratingYear}`);
  }

  getRatesForIndustry(industryName: string, industryGroup: string): Observable<RateIndustry[]> {
    return this.commonService.getAll<RateIndustry[]>(`${this.rateIndustryApi}/GetRatesForIndustry/${industryName}/${industryGroup}`);
  }

  getMemberWhatsappList(industryClassEnum: number) {
    return this.commonService.getAll<Company[]>(`${this.api}/GenerateWhatsAppCompanyList/${industryClassEnum}`);
  }

  getPagedRatesUploadErrorAudit(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RatesUploadErrorAudit>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RatesUploadErrorAudit>>(`${this.api}/GetPagedRatesUploadErrorAudit/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerPolicyTransactions(policyId: number, coverPeriod: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerPolicyTransaction>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerPolicyTransaction>>(`${this.api}/GetPagedRolePlayerPolicyTransactions/${policyId}/${coverPeriod}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerTransactions(rolePlayerId: number, coverPeriod: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerPolicyTransaction>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerPolicyTransaction>>(`${this.api}/GetPagedRolePlayerTransactions/${rolePlayerId}/${coverPeriod}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerPolicyDeclarations(policyId: number, coverPeriod: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerPolicyDeclaration>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerPolicyDeclaration>>(`${this.api}/GetPagedRolePlayerPolicyDeclarations/${policyId}/${coverPeriod}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getRolePlayerPolicyDeclarations(policyId: number): Observable<RolePlayerPolicyDeclaration[]> {
    return this.commonService.getAll<RolePlayerPolicyDeclaration[]>(`${this.api}/GetRolePlayerPolicyDeclarations/${policyId}`);
  }

  getRolePlayerDeclarations(rolePlayerId: number): Observable<RolePlayerPolicyDeclaration[]> {
    return this.commonService.getAll<RolePlayerPolicyDeclaration[]>(`${this.api}/GetRolePlayerDeclarations/${rolePlayerId}`);
  }

  getRolePlayerPolicyTransactions(policyId: number): Observable<RolePlayerPolicyTransaction[]> {
    return this.commonService.getAll<RolePlayerPolicyTransaction[]>(`${this.api}/GetRolePlayerPolicyTransactions/${policyId}`);
  }

  getRolePlayerTransactions(rolePlayerId: number): Observable<RolePlayerPolicyTransaction[]> {
    return this.commonService.getAll<RolePlayerPolicyTransaction[]>(`${this.api}/GetRolePlayerTransactions/${rolePlayerId}`);
  }

  getRolePlayerPolicyTransactionsForCoverPeriod(policyId: number, coverPeriod: number): Observable<RolePlayerPolicyTransaction[]> {
    return this.commonService.getAll<RolePlayerPolicyTransaction[]>(`${this.api}/GetRolePlayerPolicyTransactionsForCoverPeriod/${policyId}/${coverPeriod}`);
  }

  getRolePlayerTransactionsForCoverPeriod(rolePlayerId: number, coverPeriod: number): Observable<RolePlayerPolicyTransaction[]> {
    return this.commonService.getAll<RolePlayerPolicyTransaction[]>(`${this.api}/GetRolePlayerTransactionsForCoverPeriod/${rolePlayerId}/${coverPeriod}`);
  }

  sendInvoices(rolePlayerPolicyTransactions: RolePlayerPolicyTransaction[]): Observable<boolean> {
    return this.commonService.edit<RolePlayerPolicyTransaction[]>(rolePlayerPolicyTransactions, this.api + '/SendInvoices');
  }

  getDefaultRenewalPeriodStartDate(industryClass: IndustryClassEnum, date: Date): Observable<Date> {
    const _date = this.datePipe.transform(date, 'yyyy-MM-dd');
    return this.commonService.getAll<Date>(`${this.api}/GetDefaultRenewalPeriodStartDate/${industryClass}/${_date}`);
  }

  releaseBulkInvoices(industryClass: IndustryClassEnum, effectiveToDate: Date): Observable<number> {
    const _effectiveToDate = this.datePipe.transform(effectiveToDate, 'yyyy-MM-dd');
    return this.commonService.getAll<number>(`${this.api}/ReleaseBulkInvoices/${industryClass}/${_effectiveToDate}`);
  }

  getRequiredRenewalRolePlayerPolicyDeclarations(rolePlayerId: number): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.api}/GetRequiredRenewalRolePlayerPolicyDeclarations/${rolePlayerId}`);
  }

  renewPolicy(policy: Policy): Observable<boolean> {
    return this.commonService.edit<Policy>(policy, this.api + '/RenewPolicy');
  }

  renewPolicies(policies: Policy[]): Observable<boolean> {
    return this.commonService.edit<Policy[]>(policies, this.api + '/RenewPolicies');
  }

  closeRenewalPeriod(industryClass: IndustryClassEnum): Observable<number> {
    return this.commonService.getAll<number>(`${this.api}/CloseRenewalPeriod/${industryClass}`);
  }

  getRequiredDeclarations(policy: Policy): Observable<RolePlayerPolicyDeclaration[]> {
    return this.commonService.postGeneric<Policy, RolePlayerPolicyDeclaration[]>(`${this.api}/GetRequiredDeclarations`, policy);
  }

  getPagedStagedClientRates(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<LoadRate>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<LoadRate>>(`${this.api}/GetPagedStagedClientRates/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  startRenewalPeriod(industryClass: IndustryClassEnum): Observable<number> {
    return this.commonService.getAll<number>(`${this.api}/StartRenewalPeriod/${industryClass}`);
  }

  getAllRolePlayerPolicyDeclarations(policy: Policy): Observable<Policy> {
    return this.commonService.postGeneric<Policy, Policy>(`${this.api}/GetAllRolePlayerPolicyDeclarations`, policy);
  }

  createRolePlayerPolicyOnlineSubmissions(rolePlayerPolicyOnlineSubmissions: RolePlayerPolicyOnlineSubmission[]): Observable<number> {
    return this.commonService.postGeneric<RolePlayerPolicyOnlineSubmission[], number>(this.api + '/CreateRolePlayerPolicyOnlineSubmissions', rolePlayerPolicyOnlineSubmissions);
  }

  updateRolePlayerPolicyOnlineSubmissions(rolePlayerPolicyOnlineSubmissions: RolePlayerPolicyOnlineSubmission[]): Observable<boolean> {
    return this.commonService.edit<RolePlayerPolicyOnlineSubmission[]>(rolePlayerPolicyOnlineSubmissions, this.api + '/UpdateRolePlayerPolicyOnlineSubmissions');
  }

  getRolePlayerPolicyOnlineSubmissions(rolePlayerId: number, submissionYear: number): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.api}/GetRolePlayerPolicyOnlineSubmissions/${rolePlayerId}/${submissionYear}`);
  }
}
