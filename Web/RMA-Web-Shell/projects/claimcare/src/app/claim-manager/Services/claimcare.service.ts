import { Claim } from '../shared/entities/funeral/claim.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { SearchResultModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/search-result.model';
import { WorkPoolModel, ManageUser, WorkPoolUpdateStatus, PersonEventUpdateStatus, ClaimEmailAction } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { Document } from '../../../../../shared-components-lib/src/lib/document-management/document';
import { DocumentType } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/document-type.model';
import { ClaimPaymentModel, StillbornBenefit } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-payment.model';
import { RegisterFuneralModel } from '../shared/entities/funeral/register-funeral.model';
import { AdditionalDocument } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/additional-document.model';
import { BankAccount, BeneficiaryBankDetail } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { DocumentManagementHeader } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/document-management-header';
import { CauseOfDeathModel } from '../shared/entities/funeral/cause-of-death.model';
import { ValidationResultModel } from '../shared/entities/ValidationResult.model';
import { ClaimCancellationReasonsModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-cancellation-reasons.model';
import { ClaimReOpenReasonsModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-cancellation-reasons.model';
import { DeathTypeEnum } from '../shared/enums/deathType.enum';
import { FuneralClaimReportResult } from '../shared/entities/funeral/funeral-claim-results.model';
import { PersonEventModel } from '../shared/entities/personEvent/personEvent.model';
import { ManageClaim } from '../shared/entities/funeral/manage-claim.model';
import { ClaimRuleAuditModel } from '../shared/entities/claimRuleAudit.model';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayerSearchResult } from '../shared/entities/funeral/roleplayer-search-result';
import { EligiblePolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/eligible-policy';
import { ClaimInvoice } from 'projects/claimcare/src/app/claim-manager/shared/entities/claim-invoice.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PolicyClaim } from '../shared/entities/policy-claim.model';
import { AssessorClaims } from '../shared/entities/assessor-claims';
import { CoverTypeModel } from '../shared/entities/cover-type-model';
import { PolicyInsuredLife } from '../shared/entities/funeral/policy-insured-life';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { ClaimRepayReasonsModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-cancellation-reasons.model';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { SmsAudit } from 'projects/shared-models-lib/src/lib/common/sms-audit';
import { Item } from 'projects/fincare/src/app/shared/models/item';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { ClaimNote } from '../shared/entities/claim-note';
import { ClaimsRecoveryModel } from '../../recovery-manager/shared/entities/claims-recovery-model';
import { ClaimRecoveryView } from '../../recovery-manager/shared/entities/claim-recovery-view';
import { TracerModel } from '../shared/entities/tracer-model';
import { ClaimTracerPaymentModel } from '../shared/entities/tracer-model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { CorporateResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/corporate-result';
import { ParentInsuranceType } from '../shared/entities/parentInsuranceType';
import { DiseaseType } from '../shared/entities/diseaseType';
import { EventCause } from '../shared/entities/eventCause';
import { InjurySeverity } from '../shared/entities/injury-severity';
import { PatersonGrading } from '../shared/entities/paterson-grading';
import { ClaimBucketClassModel } from '../shared/entities/personEvent/claimBucketClass.model';
import { RejectDocument } from '../shared/entities/reject-document';
import { EventModel } from '../shared/entities/personEvent/event.model';
import { PersonEventSearch } from '../shared/entities/personEvent/person-event-search';
import { CadPool } from '../shared/entities/funeral/cad-pool.model';
import { EventSearch } from '../shared/entities/personEvent/event-search';
import { VopdDash } from '../shared/entities/vopd-dash';
import { StmDash } from '../shared/entities/stm-dash';
import { VopdOverview } from '../shared/entities/vopd-overview';
import { StmDashboardFields } from '../shared/entities/stm-dashboard-fields';
import { ExitReasonDashboardFields } from '../shared/entities/exit-reason-dashboard-fields';
import { StpDash } from '../shared/entities/stp-dash';
import { PersonEventSearchParams } from '../shared/entities/personEvent/person-event-search-parameters';
import { EventSearchParams } from '../shared/entities/personEvent/event-search-parameters';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ExitReasonSearchParams } from '../shared/entities/personEvent/exit-reason-search-parameters';
import { PersonEventExitReason } from '../shared/entities/personEvent/personEventExitReason.model';
import { PhysicalDamage } from '../shared/entities/physical-damage';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { PersonEventDeathDetailModel } from '../shared/entities/personEvent/personEventDeathDetail.model';
import { AdditionalDocumentRequest } from '../shared/entities/additional-document-request';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { ClaimPool } from '../shared/entities/funeral/ClaimPool';
import { MonthlyScheduledWorkPoolUser } from '../shared/entities/personEvent/monthly-scheduled-work-pool-user';
import { SundryServiceProviderTypeEnum } from '../shared/claim-care-shared/claim-invoice-container/invoice-sundry/sundry-service-provider-type-enum';
import { SundryProvider } from '../shared/claim-care-shared/claim-invoice-container/invoice-sundry/sundry-provider';
import { ClaimReferralTypeLimitGroupEnum } from '../shared/claim-care-shared/claim-referral/claim-referral-type-limit-group-enum';
import { ReferralTypeLimitConfiguration } from '../shared/claim-care-shared/claim-referral/referral-type-limit-configuration';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { ClaimsBenefitsAmount } from 'projects/admin/src/app/configuration-manager/shared/claims-benefits-amount';
import { ClaimAdditionalRequiredDocument } from '../shared/entities/claim-additional-required-document';
import { PersonEventQuestionnaire } from '../shared/entities/personEvent/personEventQuestionnaire.model';
import { ClaimReferralQueryType } from '../shared/entities/claim-referral-query-type';
import { ClaimReferralDetail } from '../shared/entities/claim-referral-detail';
import { claimReferralLegal } from '../shared/entities/claim-referral-legal';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { InjurySeverityTypeEnum } from '../shared/enums/injury-severity-type-enum';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { ClaimSearchResult } from 'projects/shared-components-lib/src/lib/searches/claim-search/claim-search-result.model';
import { ClaimNotificationRequest } from '../shared/entities/personEvent/claim-notification-request';

@Injectable({
  providedIn: 'root'
})
export class ClaimCareService {
  private apiUrl = 'clm/api/claim';
  private accidentapiUrl = 'clm/api/Accident';
  private DocumentApiUrl = 'clm/api/Document';
  private DocumentIndexApiUrl = 'scn/api/Document/Document';
  private apiClient = 'clc/api/Client';
  private apiEvent = 'clm/api/event';
  private fatalUrl = 'clm/api/claim/fatal';
  private apiPolicy = 'clc/api/policy/policy';
  private apiEligibility = 'clc/api/policy/Eligibility';
  private diseaseapiUrl = 'clm/api/Disease';
  private scheduleUserUrl = 'mdm/api/WorkpoolUserSchedule';
  private legalUrl = 'legal/api/LegalCareRecovery'

  EmployeeListChange$ = new BehaviorSubject<boolean>(false);
  constructor(
    private readonly commonService: CommonService) {
  }

  updateEmployeeDetails(change: boolean) {
    if (change) {
      this.EmployeeListChange$.next(change);
    }
  }

  search(query: string, filter: number, showActive: boolean): Observable<SearchResultModel[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<SearchResultModel[]>(`${this.apiUrl}/Search/${urlQuery}/${filter}/${showActive}`);
  }

  searches(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<SearchResultModel[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<SearchResultModel[]>(`${this.apiUrl}/Search/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  searchPolicy(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<SearchResultModel[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<SearchResultModel[]>(`${this.apiEvent}/SearchPolicies/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  searchInsuredLives(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<PagedRequestResult<RolePlayerSearchResult>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerSearchResult>>(`${this.apiEvent}/SearchInsuredLives/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  searchClaimantInsuredLives(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<PagedRequestResult<RolePlayerSearchResult>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerSearchResult>>(`${this.apiEvent}/SearchClaimantInsuredLives/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  getMemberInsuredLives(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<PagedRequestResult<RolePlayerSearchResult>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerSearchResult>>(`${this.apiEvent}/GetPagedMemberInsuredLives/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  searchEvents(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<EventModel>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<EventModel>>(`${this.apiEvent}/GetEventList/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addDeceasedInfo(registerFuneral: RegisterFuneralModel): Observable<RegisterFuneralModel> {
    return this.commonService.postGeneric<RegisterFuneralModel, RegisterFuneralModel>(`${this.apiUrl}/RegisterFuneral`, registerFuneral);
  }

  duplicateClaimCheck(registerFuneral: RegisterFuneralModel): Observable<RegisterFuneralModel> {
    return this.commonService.postGeneric<RegisterFuneralModel, RegisterFuneralModel>(`${this.apiUrl}/DuplicateClaimCheck`, registerFuneral);
  }

  getWorkPoolsForUser(filter: number): Observable<WorkPoolsAndUsersModel[]> {
    return this.commonService.getAll<WorkPoolsAndUsersModel[]>(`${this.apiUrl}/GetWorkPoolsForUser/${filter}`);
  }

  getUsersForWorkPool(filter: number, roleName: string, userId: number): Observable<WorkPoolsAndUsersModel[]> {
    return this.commonService.getAll<WorkPoolsAndUsersModel[]>(`${this.apiUrl}/GetUsersForWorkPool/${filter}/${roleName}/${userId}`);
  }

  getFuneralClaimsForLoggedInUser(): Observable<WorkPoolModel[]> {
    return this.commonService.getAll<WorkPoolModel[]>(`${this.apiUrl}/GetClaimsForLoggedInUser`);
  }

  getUsersToAllocate(userId: number, lastWorkedOnUsers: any, claimId: any, personEventId: any): Observable<WorkPoolsAndUsersModel[]> {
    return this.commonService.getAll<WorkPoolsAndUsersModel[]>(`${this.apiUrl}/GetUsersToAllocate/${userId}/${lastWorkedOnUsers}/${claimId}/${personEventId}`);
  }

  getUsersToReAllocate(userId: number): Observable<WorkPoolsAndUsersModel[]> {
    return this.commonService.getAll<WorkPoolsAndUsersModel[]>(`${this.apiUrl}/GetUsersToReAllocate/${userId}`);
  }

  updateClaimWithWorkPool(claimId: number, personEventId: number, workPoolId: number, wizardId: number, claimStatusId: number, userId: any): Observable<WorkPoolModel[]> {
    if (userId === null) {
      return this.commonService.getAll<WorkPoolModel[]>(`${this.apiUrl}/UpdateClaimWithWorkPool/${claimId}/${personEventId}/${workPoolId}/${wizardId}/${claimStatusId}`);
    } else {
      return this.commonService.getAll<WorkPoolModel[]>(`${this.apiUrl}/UpdateClaimWithWorkPool/${claimId}/${personEventId}/${workPoolId}/${wizardId}/${claimStatusId}/${userId}`);
    }
  }

  ReAllocateEventToAssessor(eventReference: number, eventCreatedBy: string, wizardId: number, userName: string, workPoolId: number, claimStatusId: number, userId: any): Observable<WorkPoolModel[]> {
    return this.commonService.getAll<WorkPoolModel[]>(`${this.apiUrl}/ReAllocateEventToAssessor/${eventReference}/${eventCreatedBy}/${wizardId}/${userName}/${workPoolId}/${claimStatusId}/${userId}`);
  }

  addManageUser(manageUser: ManageUser): Observable<number> {
    return this.commonService.postGeneric<ManageUser, number>(`${this.apiUrl}/AddManageUser`, manageUser);
  }

  updateClaimWizard(registerFuneralResponseModel: RegisterFuneralModel): Observable<boolean> {
    return this.commonService.edit(registerFuneralResponseModel, `${this.apiUrl}/UpdateClaimWizard`);
  }

  updateClaim(claim: Claim): Observable<boolean> {
    return this.commonService.edit(claim, `${this.apiUrl}/UpdateClaim`);
  }

  updateEventWizard(event: EventModel): Observable<boolean> {
    return this.commonService.edit(event, `${this.apiEvent}/UpdateEventWizard`);
  }

  GetDocumentsByClaimId(id: number): Observable<Document[]> {
    return this.commonService.getAll<Document[]>(`${this.DocumentApiUrl}/GetDocumentsWithClaimId/${id}`);
  }

  GetDocumentTypesWithClaimId(id: number): Observable<DocumentType[]> {
    return this.commonService.getAll<DocumentType[]>(`${this.DocumentApiUrl}/GetDocumentTypesWithClaimId/${id}`);
  }

  GetDocumentTypesNotUploaded(id: number): Observable<DocumentType[]> {
    return this.commonService.getAll<DocumentType[]>(`${this.DocumentApiUrl}/GetDocumentTypesNotUploaded/${id}`);
  }

  GetDocumentManagementHeader(id: number): Observable<DocumentManagementHeader> {
    return this.commonService.getAll<DocumentManagementHeader>(`${this.DocumentApiUrl}/GetDocumentManagementHeader/${id}`);
  }

  UpdateDocument(documents: Document[]): Observable<boolean> {
    return this.commonService.editMultiple<Document>(documents, `${this.DocumentApiUrl}/UpdateDocument`);
  }

  UploadDocument(claimId: number, documentType: number, documentToken: string): Observable<string> {
    return this.commonService.AddInDocumentToken<string>(``, `${this.DocumentApiUrl}/AddInDocumentToken/${claimId}/${documentType}/${documentToken}`);
  }

  UploadDocumentIndex(document: Document): Observable<Document> {
    return this.commonService.postGeneric<Document, Document>(`${this.DocumentIndexApiUrl}/SaveUpload`, document);
  }

  GetBeneficiaryBankingDetail(claimId: number): Observable<ClaimPaymentModel[]> {
    // BUG: same as method GetBeneficiaryAndBankingDetail but different return types
    return this.commonService.getAll<ClaimPaymentModel[]>(`${this.apiUrl}/GetBeneficiaryAndBankingDetail/${claimId}`);
  }

  AddAdditionalDocuments(additionalDocuments: AdditionalDocument): Observable<boolean> {
    return this.commonService.postGeneric<AdditionalDocument, boolean>(`${this.DocumentApiUrl}/AddAdditionalDocuments`, additionalDocuments);
  }

  GetClaimPaymentDetail(claimId: number, beneficiaryId: number, bankAccountId: number): Observable<ClaimInvoice> {
    return this.commonService.getAll<ClaimInvoice>(`${this.apiUrl}/GetClaimInvoice/${claimId}/${beneficiaryId}/${bankAccountId}`);
  }

  CreateClaimPayment(claimPayment: ClaimPaymentModel[]): Observable<ValidationResultModel> {
    return this.commonService.postGeneric<ClaimPaymentModel[], ValidationResultModel>(`${this.apiUrl}/CreateClaimPayment`, claimPayment);
  }

  GetBeneficiaryAndBankingDetail(claimId: number): Observable<BeneficiaryBankDetail[]> {
    // BUG: same as method GetBeneficiaryBankingDetail but different return types
    return this.commonService.getAll<BeneficiaryBankDetail[]>(`${this.apiUrl}/GetBeneficiaryBankingDetail/${claimId}`);
  }

  addBeneficiaryBankAccount(bankAccount: BankAccount): Observable<number> {
    return this.commonService.postGeneric<BankAccount, number>(`${this.apiClient}/BankAccount`, bankAccount);
  }

  AddClaimRuleAudit(claimRuleAudit: ClaimRuleAuditModel[]): Observable<number> {
    return this.commonService.postGeneric<ClaimRuleAuditModel[], number>(`${this.apiClient}/AddClaimRuleAudit`, claimRuleAudit);
  }

  UpdateClaimIsRuleOverridden(claimId: number): Observable<number> {
    return this.commonService.editIsresolved(claimId, `${this.apiUrl}/UpdateClaimWizard`);
  }

  GetDeceasedInfo(policyId: number, insuredLifeId: number, wizardId: number): Observable<RegisterFuneralModel> {
    return this.commonService.getAll<RegisterFuneralModel>(`${this.apiUrl}/GetDeceasedInfo/${policyId}/${insuredLifeId}/${wizardId}`);
  }

  GetCauseOfDeath(deathType: DeathTypeEnum): Observable<CauseOfDeathModel[]> {
    return this.commonService.getAll<CauseOfDeathModel[]>(`${this.apiUrl}/GetCauseOfDeaths/${deathType}`);
  }

  GetEligiblePolicies(eligiblePolicy: EligiblePolicy): Observable<Policy[]> {
    return this.commonService.postGeneric<EligiblePolicy, Policy[]>(`${this.apiEligibility}/GetEligiblePolicies/`, eligiblePolicy);
  }


  updateWorkPoolStatus(action: WorkPoolUpdateStatus): Observable<boolean> {
    return this.commonService.edit(action, `${this.apiUrl}/UpdateClaimStatus`);
  }

  GetBeneficiaryAndBankAccount(beneficiaryId: number, bankAccountId: number): Observable<ClaimPaymentModel> {
    return this.commonService.getAll<ClaimPaymentModel>(`${this.apiUrl}/GetBeneficiaryAndBankAccountById/${beneficiaryId}/${bankAccountId}`);
  }

  GetClaimPaymentForAuthorisation(claimId: number): Observable<ClaimPaymentModel[]> {
    return this.commonService.getAll<ClaimPaymentModel[]>(`${this.apiUrl}/GetClaimPaymentForAuthorisation/${claimId}`);
  }

  GetMigtratedClaimDetails(claimId: number): Observable<RegisterFuneralModel> {
    return this.commonService.getAll<RegisterFuneralModel>(`${this.apiUrl}/GetMigratedDetails/${claimId}`);
  }

  GetClaimAndPaymentDetailsForDecline(claimId: number): Observable<ClaimPaymentModel> {
    return this.commonService.getAll<ClaimPaymentModel>(`${this.apiUrl}/GetClaimAndPaymentDetailsForDecline/${claimId}`);
  }

  SendDeclineLetterToClaimant(registerFuneral: RegisterFuneralModel): Observable<boolean> {
    return this.commonService.postGeneric<RegisterFuneralModel, boolean>(`${this.apiUrl}/SendDeclineLetterToClaimant`, registerFuneral);
  }

  GetClaimsForUser(userId: any): Observable<WorkPoolModel[]> {
    return this.commonService.getAll<WorkPoolModel[]>(`${this.apiUrl}/GetClaimsForUser/${userId}`);
  }

  GetFuneralRegistyDetailByClaimId(claimId: number): Observable<WorkPoolModel> {
    return this.commonService.getAll<WorkPoolModel>(`${this.apiUrl}/GetClaimAndEventByClaimId/${claimId}`);
  }

  GetPersonEventByPersonEventId(personEventId: any): Observable<WorkPoolModel> {
    return this.commonService.getAll<WorkPoolModel>(`${this.apiUrl}/GetPersonEventByPersonEventId/${personEventId}`);
  }

  GetClaimCancellationReasons(): Observable<ClaimCancellationReasonsModel[]> {
    return this.commonService.getAll<ClaimCancellationReasonsModel[]>(`${this.apiUrl}/GetClaimCancellationReasons`);
  }

  GetClaimReOpenReasons(): Observable<ClaimReOpenReasonsModel[]> {
    return this.commonService.getAll<ClaimReOpenReasonsModel[]>(`${this.apiUrl}/GetClaimReOpenReasons`);
  }

  GetClaimCloseReasons(): Observable<ClaimReOpenReasonsModel[]> {
    return this.commonService.getAll<ClaimReOpenReasonsModel[]>(`${this.apiUrl}/GetClaimCloseReasons`);
  }

  addInsuredLifeDetail(rolePlayer: RolePlayer, parentRolePlayerId: number, relation: number): Observable<number> {
    return this.commonService.postGeneric<RolePlayer, number>(`${this.apiEvent}/AddMember/${parentRolePlayerId}/${relation}`, rolePlayer);
  }

  getRolePlayerPolicies(id: number): Observable<Policy[]> {
    return this.commonService.getAll<Policy[]>(`${this.apiPolicy}/GetPoliciesByRolePlayer/${id}`);
  }

  getClaimById(claimId: number): Observable<WorkPoolModel> {
    return this.commonService.getAll<WorkPoolModel>(`${this.apiUrl}/GetClaimAndEventByClaimId/${claimId}`);
  }

  GetClaim(claimId: number): Observable<Claim> {
    return this.commonService.getAll<Claim>(`${this.apiUrl}/GetClaim/${claimId}`);
  }

  getTracerDetails(claimId: number): Observable<TracerModel> {
    return this.commonService.getAll<TracerModel>(`${this.apiUrl}/GetTracerDetails/${claimId}`);
  }

  getTracerInvoices(claimId: number): Observable<TracerModel> {
    return this.commonService.getAll<TracerModel>(`${this.apiUrl}/GetTracerInvoices/${claimId}`);
  }

  AuthorizeTracerPayment(claimTracerPaymentModel: ClaimTracerPaymentModel): Observable<boolean> {
    return this.commonService.postGeneric<ClaimTracerPaymentModel, boolean>(`${this.apiUrl}/AuthorizeTracerPayment`, claimTracerPaymentModel);
  }

  GetClaimDetails(policyId: number, personEventId: number): Observable<Claim> {
    return this.commonService.getAll<Claim>(`${this.apiUrl}/GetClaimDetails/${policyId}/${personEventId}`);
  }

  GetClaimsByCoverTypeIds(dashboardCoverTypes: CoverTypeModel): Observable<PolicyClaim> {
    return this.commonService.postGeneric<CoverTypeModel, PolicyClaim>(`${this.apiUrl}/GetClaimsByCoverTypeIds`, dashboardCoverTypes);
  }

  GetCorporateClaims(dashboardCoverTypes: CoverTypeModel): Observable<PolicyClaim> {
    return this.commonService.postGeneric<CoverTypeModel, PolicyClaim>(`${this.apiUrl}/GetCorporateClaims`, dashboardCoverTypes);
  }

  getCorporateRoles(dashboardCoverTypes: CoverTypeModel): Observable<CorporateResult[]> {
    return this.commonService.postGeneric<CoverTypeModel, CorporateResult[]>(`${this.apiUrl}/GetCorporateRoles`, dashboardCoverTypes);
  }

  getSlaClaims(dashboardCoverTypes: CoverTypeModel): Observable<PolicyClaim> {
    return this.commonService.postGeneric<CoverTypeModel, PolicyClaim>(`${this.apiUrl}/GetSlaClaims`, dashboardCoverTypes);
  }

  getClaimsByProductOptionId(productOptionId: number): Observable<PolicyClaim> {
    return this.commonService.getAll<PolicyClaim>(`${this.apiUrl}/GetClaimsByProductOptionId/${productOptionId}`);
  }

  getClaimsByPolicyId(policyId: number): Observable<Claim[]> {
    return this.commonService.getAll<Claim[]>(`${this.apiUrl}/GetClaimsByPolicyId/${policyId}`);
  }

  getClaimsAssessors(): Observable<AssessorClaims> {
    return this.commonService.getAll<AssessorClaims>(`${this.apiUrl}/GetClaimsAssessors`);
  }
  getClaimAssessor(assessorId: number): Observable<User> {
    return this.commonService.getAll<User>(`${this.apiUrl}/getClaimAssessor/${assessorId}`);
  }

  getClaimDetailsById(claimId: number): Observable<Claim> {
    return this.commonService.getAll<Claim>(`${this.apiUrl}/GetClaimDetailsById/${claimId}`);
  }


  GetFuneralClaimReport(dateFrom: string, dateTo: string, statusId: number): Observable<FuneralClaimReportResult[]> {
    return this.commonService.getAll<FuneralClaimReportResult[]>(`${this.apiUrl}/funeralClaimsReports/${dateFrom}/${dateTo}/${statusId}`);
  }

  GetDocumentSetName(claimId: number): Observable<number> {
    return this.commonService.get<number>(claimId, `${this.apiUrl}/GetDocumentSetName`);
  }
  getClaimWorkPoolsPaged(workPoolId: number, userId: number, selectedUserId: number, pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'WizardId', sortDirection: string = 'asc', query: string = ''): Observable<PagedRequestResult<WorkPoolModel>> {
    return this.commonService.getAll<PagedRequestResult<WorkPoolModel>>(`${this.apiUrl}/GetClaimWorkPoolsPaged/${workPoolId}/${userId}/${selectedUserId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${encodeURIComponent(query)}`);
  }
  getClaimsForWorkPool(filter: number): Observable<WorkPoolModel[]> {
    return this.commonService.getAll<WorkPoolModel[]>(`${this.apiUrl}/GetClaimsForWorkPool/${filter}`);
  }

  getFatal(claimId: number): Observable<PersonEventModel> {
    return this.commonService.get<PersonEventModel>(claimId, `${this.fatalUrl}/getFatal`);
  }

  getEvent(id: any): Observable<EventModel> {
    return this.commonService.get<EventModel>(id, `${this.apiEvent}/GetEvent`);
  }

  checkIfStillbornBenefitExists(policyId: number): Observable<boolean> {
    return this.commonService.get<boolean>(policyId, `${this.apiUrl}/checkIfStillbornBenefitExists/`);
  }

  getPersonEventDeathDetail(id: any): Observable<PersonEventDeathDetailModel> {
    return this.commonService.get<PersonEventDeathDetailModel>(id, `${this.apiEvent}/GetPersonEventDeathDetail`);
  }

  approveRejectEvent(eventOccured: EventModel): Observable<boolean> {
    return this.commonService.edit(eventOccured, `${this.apiUrl}/ApproveRejectEvent`);
  }

  ExecuteFatalClaimRegistrationRules(personEvent: PersonEventModel): Observable<PersonEventModel> {
    return this.commonService.postGeneric<PersonEventModel, PersonEventModel>(`${this.fatalUrl}/ExecuteFuneralClaimRegistrationRules`, personEvent);
  }
  getManageClaimDetailsById(claimId: number): Observable<ManageClaim> {
    return this.commonService.getAll<ManageClaim>(`${this.apiUrl}/GetManageClaimDetailsById/${claimId}`);
  }

  getPersonEvent(personEventId: number): Observable<PersonEventModel> {
    return this.commonService.get<PersonEventModel>(personEventId, `${this.apiEvent}/GetPersonEvent`);
  }

  getPersonEventByPolicyId(personEventId: number, policyId: number): Observable<PersonEventModel> {
    return this.commonService.getByIds<PersonEventModel>(personEventId, policyId, `${this.apiEvent}/GetPersonEventByPolicyId`);
  }

  addEventDetails(event: EventModel): Observable<number> {
    return this.commonService.postGeneric<EventModel, number>(`${this.apiEvent}`, event);
  }

  addPolicyInsuredLife(policyInsuredLife: PolicyInsuredLife): Observable<number> {
    return this.commonService.postGeneric<PolicyInsuredLife, number>(`${this.apiPolicy}/AddInsuredLife`, policyInsuredLife);
  }

  getStillbornBenefitByPolicyId(policyId: number): Observable<number> {
    return this.commonService.get<number>(policyId, `${this.apiPolicy}/GetStillbornBenefitByPolicyId`);
  }

  getStillbornBenefit(sbBenefit: StillbornBenefit): Observable<StillbornBenefit> {
    return this.commonService.postGeneric<StillbornBenefit, StillbornBenefit>(`${this.apiPolicy}/GetStillbornBenefit`, sbBenefit);
  }

  getDuplicatePersonEventCheckByInsuredLifeId(id: number): Observable<PersonEventModel> {
    return this.commonService.get<PersonEventModel>(id, `${this.apiEvent}/GetDuplicatePersonEventCheckByInsuredLifeId`);
  }

  stillBornDuplicateCheck(person: Person): Observable<number> {
    return this.commonService.postGeneric<Person, number>(`${this.apiEvent}/StillBornDuplicateCheck`, person);
  }

  SendRecoveryEmail(claimPayment: ClaimPaymentModel[]): Observable<ValidationResultModel> {
    return this.commonService.postGeneric<ClaimPaymentModel[], ValidationResultModel>(`${this.apiUrl}/SendRecoveryEmail`, claimPayment);
  }

  GetClaimRepayReasons(): Observable<ClaimRepayReasonsModel[]> {
    return this.commonService.getAll<ClaimRepayReasonsModel[]>(`${this.apiUrl}/GetClaimRepayReasons`);
  }

  updatePersonEventStatus(action: PersonEventUpdateStatus): Observable<boolean> {
    return this.commonService.edit(action, `${this.apiUrl}/UpdatePersonEventStatus`);
  }

  claimActionEmailNotification(action: ClaimEmailAction): Observable<boolean> {
    return this.commonService.edit(action, `${this.apiUrl}/ClaimActionEmailNotification`);
  }

  getClaimEmailAudit(itemType: string, itemId: number): Observable<EmailAudit[]> {
    return this.commonService.getAll<EmailAudit[]>(`${this.apiUrl}/GetClaimNotificationAudit/${itemType}/${itemId}`);
  }

  GetClaimSmsAudit(itemType: string, itemId: number): Observable<SmsAudit[]> {
    return this.commonService.getAll<SmsAudit[]>(`${this.apiUrl}/GetClaimSmsAudit/${itemType}/${itemId}`);
  }

  getAssessorRecoveries(recoveryInvokedBy: string): Observable<ClaimsRecoveryModel[]> {
    return this.commonService.getAll<ClaimsRecoveryModel[]>(`${this.apiUrl}/GetAssessorRecoveries/${recoveryInvokedBy}`);
  }

  getLegalRecoveries(workPoolId: number): Observable<ClaimsRecoveryModel[]> {
    return this.commonService.getAll<ClaimsRecoveryModel[]>(`${this.apiUrl}/GetLegalRecoveries/${workPoolId}`);
  }

  referClaimToLegal(claimRecoveryId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/ReferClaimToLegal/${claimRecoveryId}`);
  }

  referRecoveryStatus(status: ClaimStatusEnum, claimRecoveryId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/ReferRecoveryStatus/${status}/${claimRecoveryId}`);
  }

  getRecoveryViewDetails(recoveryId: number): Observable<ClaimRecoveryView> {
    return this.commonService.get<ClaimRecoveryView>(recoveryId, `${this.apiUrl}/GetRecoveryViewDetails`);
  }

  isUnclaimedBenefit(claimId: number): Observable<boolean> {
    return this.commonService.get<boolean>(claimId, `${this.apiUrl}/IsUnclaimedBenefit`);
  }

  stillBornCheck(id: number): Observable<boolean> {
    return this.commonService.get<boolean>(id, `${this.apiEvent}/StillBornCheck`);
  }

  UpdatePolicyInsuredLife(item: Item): Observable<boolean> {
    return this.commonService.postGeneric<Item, boolean>(`${this.apiUrl}/UpdatePolicyInsuredLife`, item);
  }

  GetNotesByInsuredLife(insuredLifeId: number): Observable<ClaimNote[]> {
    return this.commonService.getAll<ClaimNote[]>(`${this.apiUrl}/GetNotesByInsuredLife/${insuredLifeId}`);
  }

  verifyBankAccount(accountNumber: string, accountType: BankAccountTypeEnum, branchCode: string, accountHolderName: string, initials: string, accountHolderIDNumber: string): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/BankAccountVerification/${accountNumber}/${accountType}/${branchCode}/${accountHolderName}/${initials}/${encodeURIComponent(accountHolderIDNumber)}`);
  }

  sendForInvestigation(personEventId: number): Observable<boolean> {
    return this.commonService.postGeneric<number, boolean>(`${this.apiUrl}/SendForInvestigation/`, personEventId);
  }

  getClaimManagers(): Observable<User[]> {
    return this.commonService.getAll<User[]>(`${this.apiUrl}/GetClaimManagers`);
  }

  getChannelsForClaims(brokerNames: string): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiUrl}/GetChannelsForClaims/${brokerNames}`);
  }

  getSchemesForClaims(channelNames: string): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiUrl}/GetSchemesForClaims/${channelNames}`);
  }

  getBrokersByProducstLinkedToClaims(productNames: string): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiUrl}/GetBrokersByProducstLinkedToClaims/${productNames}`);
  }

  getSchemesByBrokeragesLinkedToClaims(brokerageNames: string): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiUrl}/GetSchemesByBrokeragesLinkedToClaims/${brokerageNames}`);
  }

  getInsuranceTypesByEventTypeId(eventTypeId: number): Observable<ParentInsuranceType[]> {
    return this.commonService.getAll<ParentInsuranceType[]>(`${this.apiUrl}/GetInsuranceTypesByEventTypeId/${eventTypeId}`);
  }

  getTypeOfDiseasesByInsuranceTypeId(insuranceTypeId: number): Observable<DiseaseType[]> {
    return this.commonService.getAll<DiseaseType[]>(`${this.apiUrl}/GetTypeOfDiseasesByInsuranceTypeId/${insuranceTypeId}`);
  }

  getCausesOfDiseases(diseaseTypeId: number): Observable<EventCause[]> {
    return this.commonService.getAll<EventCause[]>(`${this.apiUrl}/GetCausesOfDisease/${diseaseTypeId}`);
  }

  getInjurySeverity(): Observable<InjurySeverity[]> {
    return this.commonService.getAll<InjurySeverity[]>(`${this.apiUrl}/GetInjurySeverity`);
  }

  getPatersonGradingsBySkill(isSkilled: boolean): Observable<PatersonGrading[]> {
    return this.commonService.getAll<PatersonGrading[]>(`${this.accidentapiUrl}/GetPatersonGradingsBySkill/${isSkilled}`);
  }

  generatePersonEventReferenceNumber(): Observable<string> {
    return this.commonService.getString(`${this.apiEvent}/GeneratePersonEventReferenceNumber`);
  }

  getClaimBucketClasses(): Observable<ClaimBucketClassModel[]> {
    return this.commonService.getAll<ClaimBucketClassModel[]>(`${this.accidentapiUrl}/GetClaimBucketClasses`);
  }

  getCoidPersonEvents(params: PersonEventSearchParams): Observable<PagedRequestResult<PersonEventSearch>> {
    return this.commonService.postGeneric<PersonEventSearchParams, PagedRequestResult<PersonEventSearch>>(`${this.apiEvent}/GetCoidPersonEvents`, params);
  }
  
  getExitReasonPersonEvents(params: ExitReasonSearchParams): Observable<PagedRequestResult<PersonEventSearch>> {
    return this.commonService.postGeneric<ExitReasonSearchParams, PagedRequestResult<PersonEventSearch>>(`${this.apiEvent}/GetExitReasonPersonEvents`, params);
  }

  sendDocumentRejectionEmail(rejectDocument: RejectDocument): Observable<number> {
    return this.commonService.postGeneric<RejectDocument, number>(`${this.apiEvent}/SendDocumentRejectionEmail`, rejectDocument);
  }

  checkIsPersonEvent(personEventId: number): Observable<boolean> {
    return this.commonService.get<boolean>(personEventId, `${this.apiEvent}/CheckIsPersonEvent`);
  }

  getPersonEventDetails(personEventId: number): Observable<EventModel> {
    return this.commonService.get<EventModel>(personEventId, `${this.apiEvent}/GetPersonEventDetails`);
  }

  getEventDetails(eventId: number): Observable<EventModel> {
    return this.commonService.get<EventModel>(eventId, `${this.apiEvent}/GetEventDetails`);
  }

  getNonStpCoidPersonEvents(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CadPool>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CadPool>>(`${this.apiEvent}/GetNonStpCoidPersonEvents/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getCmcPoolData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CadPool>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CadPool>>(`${this.apiEvent}/GetCmcPoolData/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getInvestigationPoolData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CadPool>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CadPool>>(`${this.apiEvent}/getInvestigationPoolData/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getAssesorPoolData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CadPool>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CadPool>>(`${this.apiEvent}/GetAssesorPoolData/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  UpdatePersonEventDetails(personEvent: PersonEventModel): Observable<boolean> {
    return this.commonService.edit(personEvent, `${this.apiEvent}/UpdatePersonEventDetails/`);
  }

  eventSearch(params: EventSearchParams): Observable<PagedRequestResult<EventSearch>> {
    return this.commonService.postGeneric<EventSearchParams, PagedRequestResult<EventSearch>>(`${this.apiEvent}/EventSearch`, params);
  }

  getVopdOverview(vopdFilter: VopdOverview): Observable<VopdDash> {
    return this.commonService.postGeneric<VopdOverview, VopdDash>(`${this.apiEvent}/GetVopdOverview`, vopdFilter);
  }

  getStmOverview(stmFilter: StmDashboardFields): Observable<StmDash> {
    return this.commonService.postGeneric<StmDashboardFields, StmDash>(`${this.apiEvent}/GetStmOverview`, stmFilter);
  }

  getExitReasonOverview(exitReasonFilter: ExitReasonDashboardFields): Observable<StpDash> {
    return this.commonService.postGeneric<ExitReasonDashboardFields, StpDash>(`${this.apiEvent}/GetStpOverview`, exitReasonFilter);
  }

  getInsuranceTypes(): Observable<ParentInsuranceType[]> {
    return this.commonService.getAll<ParentInsuranceType[]>(`${this.apiUrl}/GetInsuranceTypes`);
  }

  getClaimStatuses(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiUrl}/ClaimStatus`);
  }

  processBeneficiaryVopd(rolePlayerId: number): Observable<ClaimPaymentModel[]> {
    return this.commonService.getAll<ClaimPaymentModel[]>(`${this.apiUrl}/ProcessBeneficiaryVOPDResponse/${rolePlayerId}`);
  }

  getExitReasonsByEventNumber(personEventId: number): Observable<PersonEventExitReason[]> {
    return this.commonService.getAll<PersonEventExitReason[]>(`${this.apiEvent}/GetExitReasonsByEventNumber/${personEventId}`);
  }

  getPagedClaimsByPolicyId(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Claim>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Claim>>(`${this.apiUrl}/GetPagedClaimsByPolicyId/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedPersonEventsByEventId(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PersonEventModel>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PersonEventModel>>(`${this.apiEvent}/GetPagedPersonEvents/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPersonEventInjuryDetails(personEventId: number): Observable<PersonEventModel> {
    return this.commonService.getAll<PersonEventModel>(`${this.apiEvent}/GetPersonEventInjuryDetails/${personEventId}`);
  }

  getPhysicalDamage(personEventId: number): Observable<PhysicalDamage> {
    return this.commonService.getAll<PhysicalDamage>(`${this.apiEvent}/GetPhysicalDamage/${personEventId}`);
  }

  getPersonEventAddress(personEventId: number): Observable<RolePlayerAddress[]> {
    return this.commonService.getAll<RolePlayerAddress[]>(`${this.apiEvent}/GetPersonEventAddress/${personEventId}`);
  }

  getPersonEventClaims(personEventId: number): Observable<Claim[]> {
    return this.commonService.getAll<Claim[]>(`${this.apiUrl}/GetPersonEventClaims/${personEventId}`);
  }

  getPersonEventEarningsDetails(personEventId: number): Observable<EventModel> {
    return this.commonService.getAll<EventModel>(`${this.apiEvent}/GetPersonEventEarningsDetails/${personEventId}`);
  }

  getPagedPersonEventsByPersonEventId(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PersonEventModel>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PersonEventModel>>(`${this.apiEvent}/GetPagedPersonEventsByPersonEventId/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updatePersonEvent(personEvent: PersonEventModel): Observable<boolean> {
    return this.commonService.edit(personEvent, `${this.apiEvent}/UpdatePersonEvent/`);
  }

  getDiseaseById(diseaseTypeId: number): Observable<DiseaseType> {
    return this.commonService.getAll<DiseaseType>(`${this.apiUrl}/GetDiseaseType/${diseaseTypeId}`);
  }

  sendAdditionalDocumentsRequest(additionalDocumentRequest: AdditionalDocumentRequest): Observable<number> {
    return this.commonService.postGeneric<AdditionalDocumentRequest, number>(`${this.apiUrl}/SendAdditionalDocumentsRequest`, additionalDocumentRequest);
  }

  recaptureSectionNotification(additionalDocumentRequest: AdditionalDocumentRequest): Observable<number> {
    return this.commonService.postGeneric<AdditionalDocumentRequest, number>(`${this.apiUrl}/SendAdditionalDocumentsRequest`, additionalDocumentRequest);
  }

  getPagedClaimNotes(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<ClaimNote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimNote>>(`${this.apiUrl}/GetPagedClaimNotes/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedClaims(pagedRequest: PagedRequest): Observable<PagedRequestResult<ClaimSearchResult>> {
    return this.commonService.postGeneric<PagedRequest, PagedRequestResult<ClaimSearchResult>>(`${this.apiUrl}/GetPagedClaims`,pagedRequest );
  }

  addClaimNote(claimNote: ClaimNote): Observable<number> {
    return this.commonService.postGeneric<ClaimNote, number>(`${this.apiUrl}/Notes`, claimNote);
  }

  editClaimNote(claimNote: ClaimNote): Observable<any> {
    return this.commonService.edit(claimNote, `${this.apiUrl}/EditClaimNote`);
  }

  updatePersonEventWorkFlow(personEventId: number, workPool: WorkPoolEnum, claimStatusId: number, userId: any): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/UpdatePersonEventWorkFlow/${personEventId}/${workPool}/${claimStatusId}/${userId}`);
  }

  getPagedClaimsAssignedToUser(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Claim>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Claim>>(`${this.apiUrl}/getPagedClaimsAssignedToUser/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getClaimWorkPool(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, assignedToUserId: string, userLoggedIn: number, workPoolId: number, isUserBox: boolean): Observable<PagedRequestResult<ClaimPool>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimPool>>(`${this.apiEvent}/GetClaimWorkPool/${assignedToUserId}/${userLoggedIn}/${isUserBox}/${workPoolId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  sendScheduledMontlyUser(monthlyScheduledWorkPoolUsers: MonthlyScheduledWorkPoolUser[]): Observable<number> {
    return this.commonService.postGeneric<MonthlyScheduledWorkPoolUser[], number>(`${this.scheduleUserUrl}/AddMonthlyScheduleWorkpoolUser`, monthlyScheduledWorkPoolUsers);
  }

  liabilityAcceptanceNotification(personEventId: number): Observable<PersonEventModel> {
    return this.commonService.getAll<PersonEventModel>(`${this.apiUrl}/NotificationOfLiabilityAcceptance/${personEventId}`);
  }

  checkClaimMedicalBenefits(claimId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/CheckClaimMedicalBenefits/${claimId}`);
  }

  sendCommunication(claimId: number, emailTemplateId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/SendCommunication/${claimId}/${emailTemplateId}`);
  }

  requestDocumentsfromHCP(claimId: number, healthcareProviderId: number, emailTemplateId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/RequestDocumentsfromHCP/${claimId}/${healthcareProviderId}/${emailTemplateId}`);
  }

  getSundryServiceProvidersByType(sundryProviderType: SundryServiceProviderTypeEnum): Observable<SundryProvider[]> {
    return this.commonService.getAll<SundryProvider[]>(`${this.apiUrl}/GetSundryServiceProvidersByType/${sundryProviderType}`);
  }

  getSundryProviders(request: string): Observable<SundryProvider[]> {
    return this.commonService.getAll<SundryProvider[]>(`${this.apiUrl}/GetSundryProviders/${request}`);
  }

  getAuthorizationLimitsByReferralTypeLimitGroup(claimReferralTypeLimitGroup: ClaimReferralTypeLimitGroupEnum): Observable<ReferralTypeLimitConfiguration[]> {
    return this.commonService.getAll<ReferralTypeLimitConfiguration[]>(`${this.apiUrl}/GetAuthorisationLimitsByReferralTypeLimitGroup/${claimReferralTypeLimitGroup}`);
  }

  GetMonthlyScheduleWorkpoolUser(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<MonthlyScheduledWorkPoolUser>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<MonthlyScheduledWorkPoolUser>>(`${this.scheduleUserUrl}/GetMonthlyScheduleWorkpoolUser/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  closeAccidentClaim(personEvent: PersonEventModel): Observable<boolean> {
    return this.commonService.postGeneric<PersonEventModel, boolean>(`${this.accidentapiUrl}/CloseAccidentClaim/`, personEvent);
  }

  confirmEstimates(personEvent: PersonEventModel): Observable<boolean> {
    return this.commonService.postGeneric<PersonEventModel, boolean>(`${this.apiUrl}/ConfirmEstimates/`, personEvent);
  }

  deleteClaim(claimNote: Note): Observable<number> {
    return this.commonService.postGeneric<Note, number>(`${this.apiUrl}/DeleteClaim`, claimNote);
  }

  rejectClaimInvoicePayment(claimNote: Note): Observable<number> {
    return this.commonService.postGeneric<Note, number>(`${this.apiUrl}/RejectClaimInvoicePayment`, claimNote);
  }

  zeroPercentClosure(personEvent: PersonEventModel): Observable<boolean> {
    return this.commonService.postGeneric<PersonEventModel, boolean>(`${this.accidentapiUrl}/ZeroPercentClosureLetter/`, personEvent);
  }

  submitInvoicePayment(claimInvoice: ClaimInvoice): Observable<ValidationResultModel> {
    return this.commonService.postGeneric<ClaimInvoice, ValidationResultModel>(`${this.apiUrl}/SubmitInvoicePayment`, claimInvoice);
  }

  submitMultipleInvoicePayments(claimInvoices: ClaimInvoice[]): Observable<ValidationResultModel> {
    return this.commonService.postGeneric<ClaimInvoice[], ValidationResultModel>(`${this.apiUrl}/SubmitMultipleInvoicePayments`, claimInvoices);
  }

  recallInvoicePayment(claimInvoice: ClaimInvoice): Observable<boolean> {
    return this.commonService.postGeneric<ClaimInvoice, boolean>(`${this.apiUrl}/RecallClaimPayment`, claimInvoice);
  }

  GetICD10PDPercentageEstimates(icd10EstimateFilter: ICD10EstimateFilter[], estimateEnum: InjurySeverityTypeEnum): Observable<number> {
    return this.commonService.postGeneric<ICD10EstimateFilter[], number>(`${this.apiUrl}/GetICD10PDPercentageEstimates/${estimateEnum}`, icd10EstimateFilter);
  }

  sendClaimToPensions(claim: Claim): Observable<boolean> {
    return this.commonService.postGeneric<Claim, boolean>(`${this.apiUrl}/SendClaimToPensions`, claim);
  }
  GenerateClaimEstimates(icd10EstimateFilter: ICD10EstimateFilter[], estimateEnum: InjurySeverityTypeEnum, industryClass: IndustryClassEnum, personEventId: number): Observable<number> {
    return this.commonService.postGeneric<ICD10EstimateFilter[], number>(`${this.apiUrl}/GenerateClaimEstimates/${estimateEnum}/${industryClass}/ ${personEventId}`, icd10EstimateFilter);
  }

  updateClaimPD(claim: Claim): Observable<boolean> {
    return this.commonService.edit(claim, `${this.apiUrl}/UpdateClaimPD`);
  }

  addNewClaimsBenefitsAmounts(claimsBenefitsAmounts: ClaimsBenefitsAmount[]): Observable<number> {
    return this.commonService.postGeneric<ClaimsBenefitsAmount[], number>(`${this.apiUrl}/AddNewClaimsBenefitAmounts`, claimsBenefitsAmounts);

  }

  getClaimsBenefitsAmounts(activeBenefitsAmounts: boolean): Observable<ClaimsBenefitsAmount[]> {
    return this.commonService.getAll<ClaimsBenefitsAmount[]>(`${this.apiUrl}/GetClaimsBenefitAmounts/${activeBenefitsAmounts}`);
  }

  AddClaimAdditionalRequiredDocument(additionalDoc: ClaimAdditionalRequiredDocument[]): Observable<number> {
    return this.commonService.postGeneric<ClaimAdditionalRequiredDocument[], number>(`${this.apiUrl}/AddClaimAdditionalRequiredDocument`, additionalDoc);
  }

  GetClaimAdditionalRequiredDocument(personeventId: Number): Observable<ClaimAdditionalRequiredDocument[]> {
    return this.commonService.getAll<ClaimAdditionalRequiredDocument[]>(`${this.apiUrl}/GetClaimAdditionalRequiredDocument/${personeventId}`);
  }

  GetEstimatedEarning(industryClass: IndustryClassEnum, personEventId: number): Observable<number> {
    return this.commonService.getAll<number>(this.apiUrl + `/GetEstimatedEarning/${industryClass}/${personEventId}`);
  }

  GetReferralTypeLimitConfiguration(): Observable<ReferralTypeLimitConfiguration[]> {
    return this.commonService.getAll<ReferralTypeLimitConfiguration[]>(this.apiUrl + `/GetReferralTypeLimitConfiguration`);
  }

  saveReferralTypeLimitConfiguration(data: ReferralTypeLimitConfiguration): Observable<number> {
    return this.commonService.postGeneric<ReferralTypeLimitConfiguration, number>(this.apiUrl + `/SaveReferralTypeLimitConfiguration`, data);
  }

  updateClaimsBenefitsAmounts(claimsBenefitsAmount: ClaimsBenefitsAmount): Observable<boolean> {
    return this.commonService.edit(claimsBenefitsAmount, `${this.apiUrl}/UpdateClaimsBenefitAmounts`);
  }

  updatePersonEventQuestionnaire(personEventQuestionnaire: PersonEventQuestionnaire): Observable<boolean> {
    return this.commonService.edit(personEventQuestionnaire, `${this.apiUrl}/UpdatePersonEventQuestionnaire`);
  }

  GetClaimsReferralQueryType(): Observable<ClaimReferralQueryType[]> {
    return this.commonService.getAll<ClaimReferralQueryType[]>(`${this.apiUrl}/GetClaimsReferralQueryType`);
  }

  AddClaimReferralDetail(referralDetail: ClaimReferralDetail): Observable<number> {
    return this.commonService.postGeneric<ClaimReferralDetail, number>(`${this.apiUrl}/AddClaimReferralDetail`, referralDetail);
  }

  GetClaimReferralDetail(claimId: Number): Observable<ClaimReferralDetail[]> {
    return this.commonService.getAll<ClaimReferralDetail[]>(`${this.apiUrl}/GetClaimReferralDetail/${claimId}`);
  }

  GetClaimReferralQueryType(referralQueryTypeId: Number): Observable<ClaimReferralQueryType> {
    return this.commonService.getAll<ClaimReferralQueryType>(`${this.apiUrl}/GetClaimReferralQueryType/${referralQueryTypeId}`);
  }

  getPersonEventByClaimId(claimId: number): Observable<PersonEventModel> {
    return this.commonService.getAll<PersonEventModel>(`${this.apiUrl}/GetPersonEventByClaimId/${claimId}`);
  }

  addLegalcareRecoveryDetails(referralDetail: claimReferralLegal): Observable<string> {
    return this.commonService.postGeneric<claimReferralLegal, string>(`${this.legalUrl}/AddLegalcareRecovery`, referralDetail);
  }

  roundRobinByUserPermission(permissions: string[]): Observable<User> {
    return this.commonService.postGeneric<string[], User>(`${this.apiUrl}/RoundRobinByUserPermission`, permissions);
  }

  checkDocumentReceived(keyName: string, keyValue: string, documentTypeEnum: DocumentTypeEnum): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/GetDocumentReceived/${keyName}/${keyValue}/${documentTypeEnum}`);
  }

  updateClaimRequirementDocument(personEventId: number, documentTypeEnum: DocumentTypeEnum): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/UpdateClaimRequiredDocument/${personEventId}/${documentTypeEnum}`);
  }

  checkBankingDetailsInvoicePayment(claimInvoice: ClaimInvoice): Observable<ValidationResultModel> {
    return this.commonService.postGeneric<ClaimInvoice, ValidationResultModel>(`${this.apiUrl}/CheckBankingDetailsInvoicePayment`, claimInvoice);
  }

  unacknowledgeClaims(policies: Policy[], personEventId: number): Observable<PersonEventModel> {
    return this.commonService.postGeneric<Policy[], PersonEventModel>(`${this.apiUrl}/UnacknowledgeClaims/${personEventId}`, policies);
  }

  acknowledgeClaims(policies: Policy[], personEventId: number): Observable<PersonEventModel> {
    return this.commonService.postGeneric<Policy[], PersonEventModel>(`${this.apiUrl}/AcknowledgeClaims/${personEventId}`, policies);
  }

  getClaimBenefits(claimId: number): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(this.apiUrl + `/GetClaimBenefits/${claimId}`);
  }

  createDisabiltyToFatalDeathCaptured(personEvent:PersonEventModel): Observable<boolean> {
    return this.commonService.postGeneric<PersonEventModel, boolean>(`${this.accidentapiUrl}/CreateDisabiltyToFatalDeathCaptured`, personEvent);
  }

  notifyPersonEventOwnerOrDefault(claimNotificationRequest: ClaimNotificationRequest): Observable<boolean> {
    return this.commonService.postGeneric<ClaimNotificationRequest, boolean>(`${this.apiUrl}/NotifyPersonEventOwnerOrDefaultRole`,claimNotificationRequest);
  }
}

