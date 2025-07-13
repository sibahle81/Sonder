import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { Policy } from '../entities/policy';
import { UploadDocument } from '../entities/upload-documents';
import { PolicyScheduleRequest } from '../entities/policy-schedule-request';
import { Status } from '../entities/status';
import { PolicyCancellationRequest } from '../entities/policyCancellationRequest';
import { Commission } from '../entities/commission';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { PagedResult } from 'projects/shared-models-lib/src/lib/pagination/paged-result';
import { SendScheduleRequest } from '../entities/send-schedule-request';
import { FormLetterResponse } from '../entities/form-letter-response';
import { RequiredDocument } from 'projects/admin/src/app/configuration-manager/shared/required-document';
import { PremiumListing } from '../entities/premium-listing';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ImportInsuredLivesRequest } from '../entities/import-insured-lives-request';
import { InsuredLivesSummary } from '../entities/insured-lives-summary';
import { RolePlayerPolicy } from '../entities/role-player-policy';
import { ProductPolicy } from 'projects/claimcare/src/app/claim-manager/shared/entities/product-policy';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { OneTimePinModel } from 'projects/shared-models-lib/src/lib/security/onetimepinmodel';
import { PolicyStatusEnum } from '../enums/policy-status.enum';
import { EuropAssistPremiumMatrix } from '../entities/europ-assist-premium-matrix';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PolicyGroupMember } from '../entities/policy-group-member';
import { PolicyNote } from 'projects/shared-models-lib/src/lib/policy/policy-note';
import { PolicyStatusChangeAudit } from '../entities/policy-status-change-audit';
import { Cover } from '../entities/cover';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { Benefit } from '../../../product-manager/models/benefit';
import { DatePipe } from '@angular/common';
import { Company } from '../entities/company';
import { QlinkRequest } from '../entities/qlink-request';
import { QlinkTransaction } from '../entities/qlink-transaction';
import { ExternalPartnerPolicyData } from '../entities/external-partner-policy-data';
import { QlinkSearchRequest } from '../entities/qlink-search-request';
import { PolicyTemplates } from '../entities/policy-templates'

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private apiPolicy = 'clc/api/Policy/Policy';
  private apiPolicyNote = 'clc/api/Policy/PolicyNotes';
  private apiPolicyStatus = 'clc/api/Policy/PolicyStatus';
  private apiPolicyCanceleationRequest = 'clc/api/Policy/PolicyCancelationRequest';
  private apiPolicyDocument = 'clc/api/Policy/PolicyDocument';
  private apiPolicySchedule = 'clc/api/Policy/PolicySchedule';
  private apiRequiredDocument = 'mdm/api/RequiredDocument';
  private apiPolicyPremium = 'clc/api/Policy/Premium';
  private apiRolePlayerPolicy = 'clc/api/RolePlayer/RolePlayerPolicy';
  private apiPremiumListing = 'clc/api/Policy/PremiumListing';
  private apiEuropAssistPremiumMatrix = 'mdm/api/EuropAssistPremiumMatrix';
  private apiConsolidatedFuneral = 'clc/api/Policy/ConsolidatedFuneral';
  private apiMyValuePlus = 'clc/api/Policy/MyValuePlus';

  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
    private readonly datePipe: DatePipe) {
  }

  getLastViewedPolicies(): Observable<Policy[]> {
    const user = this.authService.getUserEmail();
    return this.commonService.getAll<Policy[]>(`${this.apiPolicy}/LastViewed`);
  }

  getNames(): Observable<string[]> {
    return this.commonService.getAll('UniqueName');
  }

  getRequiredDocuments(): Observable<RequiredDocument[]> {
    const moduleId = 2;
    const documentCategoryId = 2;
    return this.commonService.getAll(`${this.apiRequiredDocument}/${moduleId}/${documentCategoryId}`);
  }

  getPolicy(id: number): Observable<Policy> {
    return this.commonService.get<Policy>(id, `${this.apiPolicy}`);
  }

  getPolicyNumber(policyId: number): Observable<string> {
    return this.commonService.get<string>(policyId, `${this.apiPolicy}/GetPolicyNumber`);
  }

  getPolicyIdsByRolePlayerId(rolePlayerId: number): Observable<number[]> {
    return this.commonService.get<number[]>(rolePlayerId, `${this.apiPolicy}/GetPolicyIdsByRolePlayerId`);
  }

  getPolicies(): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.apiPolicy}`);
  }

  getPoliciesInDateRange(startDate: string, endDate: string): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.apiPolicy}/GetPoliciesInDateRange/${startDate}/${endDate}`);
  }

  getEuropAssistPremiumMatrices(): Observable<EuropAssistPremiumMatrix[]> {
    return this.commonService.getAll<EuropAssistPremiumMatrix[]>(`${this.apiEuropAssistPremiumMatrix}`);
  }

  getPoliciesByPolicyIds(productPolicy: ProductPolicy): Observable<Policy[]> {
    return this.commonService.postGeneric<ProductPolicy, Policy[]>(`${this.apiPolicy}/GetPoliciesByPolicyIds`, productPolicy);
  }

  getPoliciesForRoleplayer(roleplayerId: number): Observable<Policy[]> {
    return this.commonService.get<Policy[]>(roleplayerId, `${this.apiPolicy}/GetPoliciesForRoleplayer`);
  }

  getPoliciesByPolicyOwner(rolePlayerId: number): Observable<RolePlayerPolicy[]> {
    return this.commonService.get<RolePlayerPolicy[]>(rolePlayerId, `${this.apiPolicy}/GetPoliciesByPolicyOwner`);
  }

  getProductIdsByPolicyIds(productPolicy: ProductPolicy): Observable<number[]> {
    return this.commonService.postGeneric<ProductPolicy, number[]>(`${this.apiPolicy}/GetProductIdsByPolicyIds`, productPolicy);
  }

  getPolicyStatuses(): Observable<Status[]> {
    return this.commonService.getAll<Status[]>(`${this.apiPolicyStatus}`);
  }

  addPolicy(policy: Policy): Observable<number> {
    return this.commonService.postGeneric<Policy, number>(`${this.apiPolicy}`, policy);
  }

  editPolicy(policy: Policy): Observable<boolean> {
    return this.commonService.edit(policy, `${this.apiPolicy}`);
  }

  editRolePlayerPolicy(policy: RolePlayerPolicy): Observable<boolean> {
    return this.commonService.edit(policy, `${this.apiRolePlayerPolicy}`);
  }

  sendPolicyCancellNotification(policyCancellationRequest: PolicyCancellationRequest): Observable<number> {
    return this.commonService.postGeneric<PolicyCancellationRequest, number>(`${this.apiPolicyCanceleationRequest}`, policyCancellationRequest);
  }

  removePolicy(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${this.apiPolicy}`);
  }

  doesPolicyExistForLeadQuote(quoteId: number): Observable<boolean> {
    return this.commonService.get(quoteId, 'Policy/DoesPolicyExistForLead');
  }

  addDocument(document: UploadDocument): Observable<number> {
    return this.commonService.postGeneric<UploadDocument, number>(`${this.apiPolicyDocument}`, document);
  }

  deleteDocuments(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${this.apiPolicyDocument}`);
  }

  sendPolicySchedule(policyScheduleRequest: PolicyScheduleRequest): Observable<number> {
    return this.commonService.postGeneric<PolicyScheduleRequest, number>(`${this.apiPolicySchedule}`, policyScheduleRequest);
  }

  getPoliciesByClientId(id: number): Observable<Policy[]> {
    return this.commonService.get<Policy[]>(id, `${this.apiPolicy}/ByClientId`);
  }

  getCommissionablePolicies(): Observable<Commission[]> {
    return this.commonService.getAll<Commission[]>(`${this.apiPolicy}/Commissionable`);
  }

  getPolicyScheduleData(policyId: number): Observable<FormLetterResponse> {
    return this.commonService.postGeneric<number, FormLetterResponse>(`${this.apiPolicySchedule}`, policyId);
  }

  sendGeneratedPolicyData(request: SendScheduleRequest): Observable<boolean> {
    return this.commonService.postGeneric<SendScheduleRequest, boolean>(`${this.apiPolicySchedule}/Send`, request);
  }

  searchPoliciesWithPaging(query: string, pagination: Pagination): Observable<PagedResult<Policy>> {
    const searchTerm = encodeURIComponent(query);
    // New method update to route params
    const params = `&pageSize=${pagination.pageSize}&isAscending=${pagination.isAscending}&orderBy=${pagination.orderBy}&pageNumber=${pagination.pageNumber}`;
    const encodedParams = encodeURI(params);
    return this.commonService.getAll<PagedResult<Policy>>(`${this.apiPolicy}/Search/Paged?query=${searchTerm}${encodedParams}`);
  }

  searchPoliciesWithPagingPagedRequestResult(query: string, pagination: Pagination): Observable<PagedRequestResult<Policy>> {
    const searchTerm = encodeURIComponent(query);
    // New method update to route params
    const params = `&pageSize=${pagination.pageSize}&isAscending=${pagination.isAscending}&orderBy=${pagination.orderBy}&pageNumber=${pagination.pageNumber}`;
    const encodedParams = encodeURI(params);
    return this.commonService.getAll<PagedRequestResult<Policy>>(`${this.apiPolicy}/Search/Paged?query=${searchTerm}${encodedParams}`);
  }

  searchRolePlayerPolicies(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Policy>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Policy>>(`${this.apiRolePlayerPolicy}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchExternalPartnerPolicies(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<ExternalPartnerPolicyData>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ExternalPartnerPolicyData>>(`${this.apiPolicy}/GetExternalPartnerPolicyData/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updatePolicyPremiums(policy: Policy): Observable<boolean> {
    return this.commonService.edit(policy.policyId, `${this.apiPolicy}/UpdatePremiums`);
  }

  getPremiumListingByCompanyAndDate(companyname: string, date: Date, pagination: Pagination, query: string): Observable<PagedResult<PremiumListing>> {
    const searchTerm = encodeURIComponent(query);
    // New method update to route params
    const params = `&pageSize=${pagination.pageSize}&isAscending=${pagination.isAscending}&orderBy=${pagination.orderBy}&pageNumber=${pagination.pageNumber}`;
    const encodedParams = encodeURI(params);
    return this.commonService.getAll<PagedResult<PremiumListing>>(`${this.apiPolicyPremium}/GetPremiumListingByCompanyAndDate/?companyname=${companyname}&date=${date}&query=${searchTerm}${encodedParams}`);
  }

  getNewPolicyByNumber(policyNumber: string): Observable<Policy> {
    return this.commonService.get<Policy>(policyNumber, `${this.apiPolicy}/GetPolicyByNumber`);
  }

  updatePolicyStatus(policyStatusChangeAudit: PolicyStatusChangeAudit): Observable<boolean> {
    return this.commonService.edit(policyStatusChangeAudit, `${this.apiPolicy}/UpdatePolicyStatus`);
  }

  getPremiumListingByFileIdentifier(request: ImportInsuredLivesRequest): Observable<InsuredLivesSummary> {
    const api = `${this.apiPremiumListing}/ImportInsuredLives`;
    return this.commonService.postGeneric<ImportInsuredLivesRequest, InsuredLivesSummary>(api, request);
  }

  clientReferenceExists(clientReference: string): Observable<boolean> {
    return this.commonService.get<boolean>(clientReference, `${this.apiPolicy}/ClientReferenceExists`);
  }

  getPoliciesByRolePlayer(id: number): Observable<RolePlayerPolicy[]> {
    return this.commonService.get<RolePlayerPolicy[]>(id, `${this.apiPolicy}/GetPoliciesByRolePlayer`);
  }

  uploadPremiumListing(createPolicies: boolean, fileName: string, content: any): Observable<string[]> {
    const url = `${this.apiPolicy}/UploadPremiumListing/${fileName}/${createPolicies}`;
    return this.commonService.postGeneric<string, string[]>(url, content);
  }

  uploadExternalPartnerPolicyData(fileName: string, content: any): Observable<string[]> {
    const url = `${this.apiPolicy}/UploadExternalPartnerPolicyData/${fileName}`;
    return this.commonService.postGeneric<string, string[]>(url, content);
  }

  uploadConsolidatedFuneral(fileName: string, content: any, policyOption: number, policyNumber: string): Observable<string[]> {
    const url = `${this.apiPolicy}/UploadConsolidatedFuneral/${fileName}/${policyOption}/${policyNumber}`;
    return this.commonService.postGeneric<string, string[]>(url, content);
  }

  // MFT Check Endpoint
  uploadMyValuePlus(fileName: string, content: any, policyOption: number, policyNumber: string): Observable<string[]> {
    const url = `${this.apiPolicy}/UploadMyValuePlus/${fileName}/${policyOption}/${policyNumber}`;
    return this.commonService.postGeneric<string, string[]>(url, content);
  }

  getOneTimePinByPolicyNumber(policyNumber: string): Observable<OneTimePinModel> {
    return this.commonService.get<OneTimePinModel>(policyNumber, `${this.apiPolicy}/GetOneTimePinByPolicyNumber`);
  }

  getPolicyDocumentsByPolicyNumber(policyNumber: string, oneTimePin: number): Observable<MailAttachment[]> {
    return this.commonService.getAll<MailAttachment[]>(`${this.apiPolicy}/GetPolicyDocumentsByPolicyNumber/${policyNumber}/${oneTimePin}`);
  }

  getCompaniesWithPolicy(): Observable<string[]> {
    const results = this.commonService.getAll<string[]>(`${this.apiPolicy}/GetCompaniesWithPolicy`);
    return results;
  }

  getFuneralPolicyCompanies(): Observable<Company[]> {
    const results = this.commonService.getAll<Company[]>(`${this.apiPolicy}/GetFuneralPolicyCompanies`);
    return results;
  }
  
  getCompaniesWithPolicyForBroker(brokerName: string): Observable<string[]> {
    const results = this.commonService.getAll<string[]>(`${this.apiPolicy}/GetCompaniesWithPolicyForBroker/${brokerName}`);
    return results;
  }

  getPoliciesWithStatus(status: PolicyStatusEnum): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.apiPolicy}/GetPoliciesWithStatus/${status}`);
  }

  uploadInsuredLives(content: any): Observable<InsuredLivesSummary> {
    return this.commonService.postGeneric<InsuredLivesSummary, null>(`${this.apiRolePlayerPolicy}/UploadInsuredLives`, content);
  }

  getPolicyInsurers(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiPolicy}/GetPolicyInsurerLookup`);
  }

  getPagedChildPolicies(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PolicyGroupMember>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PolicyGroupMember>>(`${this.apiPolicy}/GetPagedChildPolicies/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedPolicyInsuredLives(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PolicyGroupMember>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PolicyGroupMember>>(`${this.apiPolicy}/GetPagedPolicyInsuredLives/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addPolicyNote(policyNote: PolicyNote): Observable<number> {
    return this.commonService.postGeneric<PolicyNote, number>(`${this.apiPolicyNote}/AddPolicyNote`, policyNote);
  }

  editPolicyNote(policyNote: PolicyNote): Observable<any> {
    return this.commonService.edit(policyNote, `${this.apiPolicyNote}/EditPolicyNote`);
  }

  getPagedPolicyNotes(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PolicyNote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PolicyNote>>(`${this.apiPolicy}/GetPagedPolicyNotes/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPoliciesWithProductOptionByRolePlayer(roleplayerId: number): Observable<Policy[]> {
    return this.commonService.get<Policy[]>(roleplayerId, `${this.apiPolicy}/GetPoliciesWithProductOptionByRolePlayer`);
  }

  getPolicyWithProductOptionByPolicyId(policyId: number): Observable<Policy> {
    return this.commonService.get<Policy>(policyId, `${this.apiPolicy}/GetPolicyWithProductOptionByPolicyId`);
  }

  getPolicyCover(policyId: number): Observable<Cover[]> {
    return this.commonService.get<Cover[]>(policyId, `${this.apiPolicy}/GetPolicyCover`);
  }

  getPolicyStatusChangeAudits(policyId: number): Observable<PolicyStatusChangeAudit[]> {
    return this.commonService.getAll<PolicyStatusChangeAudit[]>(`${this.apiPolicy}/GetPolicyStatusChangeAudits/${policyId}`);
  }

  getPagedPolicyStatusChangeAudit(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PolicyStatusChangeAudit>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PolicyStatusChangeAudit>>(`${this.apiPolicy}/GetPagedPolicyStatusChangeAudit/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getNumberOfChildPolicies(policyId: number): Observable<number> {
    const url = `${this.apiPolicy}/GetChildPolicyCount`;
    return this.commonService.get<number>(policyId, url);
  }

  getDependentPolicies(parentPolicyId: number): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.apiPolicy}/GetDependentPolicies/${parentPolicyId}`);
  }

  searchPolicies(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Policy>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Policy>>(`${this.apiPolicy}/SearchPolicies/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedPolicyCovers(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Cover>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Cover>>(`${this.apiPolicy}/GetPagedPolicyCovers/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getUnderwriterByPolicyId(policyId: number): Observable<UnderwriterEnum> {
    return this.commonService.getAll<UnderwriterEnum>(`${this.apiPolicy}/GetUnderwriterByPolicyId/${policyId}`);
  }

  overrideRolePlayerVopd(dateOfDeath: Date, idNumber: string, firstName: string, surname: string, deceasedStatus: string, vopdDatetime: Date, fileIdentifier: string): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiConsolidatedFuneral}/OverrideCfpMemberVopd`, { dateOfDeath, idNumber, firstName, surname, deceasedStatus, vopdDatetime, fileIdentifier });
  }
  
 // MFT Check Endpoints
  overrideRolePlayerVopd_MVP(dateOfDeath: Date, idNumber: string, firstName: string, surname: string, deceasedStatus: string, vopdDatetime: Date, fileIdentifier: string): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiMyValuePlus}/OverrideMvpMemberVopd`, { dateOfDeath, idNumber, firstName, surname, deceasedStatus, vopdDatetime, fileIdentifier });
  }

  uploadDiscountListing(fileName: string, content: any): Observable<string[]> {
    const url = `${this.apiPolicy}/UploadDiscountFileListing/${fileName}`;
    return this.commonService.postGeneric<string, string[]>(url, content);
  }

  getPoliciesByPolicyOwnerId(rolePlayerId: number): Observable<RolePlayerPolicy[]> {
    const url = `${this.apiRolePlayerPolicy}/GetPoliciesByPolicyOwnerIdNoRefData/${rolePlayerId}`;
    return this.commonService.getAll<RolePlayerPolicy[]>(url);
  }

  getBenefitsForProductOptionAtEffectiveDate(productOptionId: number, effectiveDate: Date): Observable<Benefit[]> {
    const date = this.datePipe.transform(effectiveDate, 'yyyy-MM-dd')
    return this.commonService.getAll<Benefit[]>(`${this.apiPolicy}/GetBenefitsForProductOptionAtEffectiveDate/${productOptionId}/${date}`);
  }

  processManualQadd(policyNumber: string, transactionType: number): any {
    return this.commonService.getAll(`${this.apiPolicy}/ProcessQlinkTransactions/${policyNumber}/${transactionType}`);
  }

   processManualQadds(qlinkRequest: QlinkRequest): any {
    return this.commonService.postGeneric(`${this.apiPolicy}/ProcessQlinkPolicyTransactions`, qlinkRequest);
  }

  getSuccessfulQLinkTransactions(policyNumber: string): Observable<QlinkTransaction[]> {
    return this.commonService.getAll<QlinkTransaction[]>(`${this.apiPolicy}/GetSuccesssfulQlinkTransactions/${policyNumber}`);
  }

  getSuccessfulPoliciesQLinkTransactions(policyNumbers: string[]): Observable<PagedRequestResult<QlinkTransaction>> {
    return this.commonService.postGeneric(`${this.apiPolicy}/QlinkTransactionPolicies`, policyNumbers);
  }

  getPagedQlinkTransactions(qlinkSearchRequest: QlinkSearchRequest): Observable<PagedRequestResult<QlinkTransaction>> {
    return this.commonService.postGeneric<QlinkSearchRequest, PagedRequestResult<QlinkTransaction>>(`${this.apiPolicy}/GetPagedQlinkTransactions/`, qlinkSearchRequest);
  }

  getPolicyTemplatesByPolicyId(policyId: number): Observable<PolicyTemplates[]> {
    return this.commonService.getAll<PolicyTemplates[]>(`${this.apiPolicy}/GetPolicyTemplatesByPolicyId/${policyId}`);
  }

  getMainMemberFuneralPremium(policyId: number, spouseCount: number, childCount: number): Observable<number> {
    const url = `${this.apiPolicy}/GetMainMemberFuneralPremium/${policyId}/${spouseCount}/${childCount}`;
    return this.commonService.getAll<number>(url);
  }
}
