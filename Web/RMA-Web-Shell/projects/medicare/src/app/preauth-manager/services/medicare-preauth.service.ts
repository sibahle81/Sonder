import { TreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-protocol.interface';
import { PreAuthLevelOfCare } from 'projects/medicare/src/app/preauth-manager/models/preauth-levelofcare';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TariffSearch } from 'projects/medicare/src/app/preauth-manager/models/tariff-search';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { PreAuthRejectReason } from 'projects/medicare/src/app/medi-manager/models/preAuthRejectReason';
import { AdmissionCode } from 'projects/medicare/src/app/preauth-manager/models/admission-code';
import { PreAuthPractitionerTypeSetting } from 'projects/medicare/src/app/preauth-manager/models/preAuth-PractitionerType-Setting';
import { MutualInclusiveExclusiveCode } from 'projects/medicare/src/app/medi-manager/models/mutual-inclusive-exclusive-code';
import { MedicalWorkPoolModel } from 'projects/medicare/src/app/medi-manager/models/medical-work-pool.model';
import { PreAuthSearchModel } from 'projects/medicare/src/app/preauth-manager/models/preauth-search-model';
import { PreauthCodeLimit } from 'projects/medicare/src/app/medi-manager/models/preauth-code-limit';
import { PreauthBreakdownUnderassessreason } from '../models/preauth-breakdown-underassessreason';
import { SearchPreAuthCriteria } from 'projects/medicare/src/app/preauth-manager/models/search-preauth-criteria';
import { ProstheticItemCategory } from '../models/ProstheticItemCategory';
import { ProstheticItem } from '../models/ProstheticItem';
import { ProsthetistType } from '../models/ProsthetistType';
import { QuotationType } from '../models/QuotationType';
import { ProsthetistQuote } from '../models/prosthetistquote';
import { PreAuthChronicMedicationList } from '../models/preauth-chronicmedicationlist';
import { TariffTypes } from 'projects/medicare/src/app/preauth-manager/models/tariff-types';
import { MedicareWorkPool } from '../../medi-manager/models/medicare-workpool';
import { PreAuthorisationUnderAssessReason } from '../models/preauthorisation-underassessreason';

@Injectable({
  providedIn: 'root'
})
export class MediCarePreAuthService {
  private apiUrlAuth = 'med/api/Preauthorisation';
  private apiUrl = 'clm/api/PreAuthClaim';
  private apiUrlMedical = 'med/api/Medical';  
  preAuthClaimDetail: PreAuthClaimDetail;
  constructor(
    private readonly commonService: CommonService) {
  }

  setCurrentCLaimDetails(preAuthClaimDetail: PreAuthClaimDetail): void {
    this.preAuthClaimDetail = preAuthClaimDetail;
  }

  getCurrentCLaimDetails(): PreAuthClaimDetail {
    return this.preAuthClaimDetail;
  }

  searchPreAuthClaimDetail(claimReferenceNumber: string): Observable<PreAuthClaimDetail> {
    return this.commonService.getAll<PreAuthClaimDetail>(this.apiUrl + `/GetPreAuthClaimDetail/${claimReferenceNumber}`);
  }

  getPreAuthClaimDetailByPersonEventId(personEventId: number): Observable<PreAuthClaimDetail> {
    return this.commonService.getAll<PreAuthClaimDetail>(this.apiUrl + `/GetPreAuthClaimDetailByPersonEventId/${personEventId}`);
  }

  GetPersonEventIdByClaimReferenceNumber(claimReferenceNumber: string): Observable<number> {
    return this.commonService.getAll<number>(this.apiUrl + `/GetPersonEventIdByClaimReferenceNumber/${claimReferenceNumber}`);
  }

  searchPreAuthorisations(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PreAuthorisation>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PreAuthorisation>>(`${this.apiUrlAuth}/SearchPreAuthorisations/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchPreAuthorisation(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PreAuthorisation>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PreAuthorisation>>(`${this.apiUrlAuth}/SearchPreAuthorisation/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPreAuthorisationById(preAuthorisationId: number): Observable<PreAuthorisation> {
    return this.commonService.getAll<PreAuthorisation>(this.apiUrlAuth + `/GetPreAuthorisationById/${preAuthorisationId}`);
  }

  getPreAuthorisationsByUser(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PreAuthorisation>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PreAuthorisation>>(`${this.apiUrlAuth}/GetPreAuthorisationsByUser/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getAuthorisedPreAuths(personEventId: number, includeTreatingDoctor: boolean): Observable<PagedRequestResult<PreAuthorisation>> {
    return this.commonService.getAll<PagedRequestResult<PreAuthorisation>>(`${this.apiUrlAuth}/GetAuthorisedPreAuths/${personEventId}/${includeTreatingDoctor}`);
  }

  getPreAuthsForPractitionerTypeTreatmentBasket(personEventId: number, practitionerTypeId: number, invoiceTreatmentFromDate: string): Observable<PreAuthorisation[]> {
    return this.commonService.getAll<PreAuthorisation[]>(`${this.apiUrlAuth}/GetPreAuthsForPractitionerTypeTreatmentBasket/${personEventId}/${practitionerTypeId}/${invoiceTreatmentFromDate}`);
  }

  getPreAuthorisationsByPersonEvent(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PreAuthorisation>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PreAuthorisation>>(`${this.apiUrlAuth}/GetPreAuthorisationsByPersonEvent/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addPreAuthorisation(preAuthorisation: PreAuthorisation): Observable<number> {
    return this.commonService.postGeneric<PreAuthorisation, number>(this.apiUrlAuth + `/AddPreAuthorisation`, preAuthorisation);
  }

  editPreAuthorisation(preAuthorisation: PreAuthorisation): Observable<PreAuthorisation> {
    return this.commonService.postGeneric<PreAuthorisation, PreAuthorisation>(this.apiUrlAuth + `/EditPreAuthorisation`, preAuthorisation);
  }

  getLevelOfCareList(): Observable<PreAuthLevelOfCare[]> {
    return this.commonService.getAll<PreAuthLevelOfCare[]>(this.apiUrlMedical + `/GetLevelOfCare`);
  }

  getTariffTypes(): Observable<TariffTypes[]> {
    return this.commonService.getAll<TariffTypes[]>(this.apiUrlMedical + `/GetTariffTypes`);
  }

  getTreatmentBaskets(): Observable<PreAuthTreatmentBasket[]> {
    return this.commonService.getAll<PreAuthTreatmentBasket[]>(`${this.apiUrlMedical}/GetTreatmentBaskets`);
  }

  getTreatmentBasketForICD10CodeId(icd10CodeId: number): Observable<PreAuthTreatmentBasket> {
    return this.commonService.getAll<PreAuthTreatmentBasket>(`${this.apiUrlMedical}/GetTreatmentBasketForICD10CodeId/${icd10CodeId}`);
  }

  searchTariff(tariffCode: string, tariffTypeIds: string, practitionerTypeId: number, tariffDate: string): Observable<TariffSearch> {
    return this.commonService.getAll<TariffSearch>(`${this.apiUrlMedical}/SearchTariff/${tariffCode}/${tariffTypeIds}/${practitionerTypeId}/${tariffDate}`);
  }

  getTariffDetails(medicalTariffs: TariffSearch[]): Observable<TariffSearch[]> {
    return this.commonService.postGeneric<TariffSearch[], TariffSearch[]>(this.apiUrlMedical + `/GetTariffDetails`, medicalTariffs);
  }

  searchAllTariffs(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<TariffSearch>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<TariffSearch>>(`${this.apiUrlMedical}/SearchAllTariffs/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getTariff(tariffId: number): Observable<TariffSearch> {
    return this.commonService.getAll<TariffSearch>(`${this.apiUrlMedical}/GetTariffSearchForTariffId/${tariffId}`);
  }

  checkIfDuplicateLineItem(personEventId: number, healthCareProviderId: number, tariffId: number, preAuthFromDate: string, preAuthToDate: string): any {
    return this.commonService.getAll<any>(`${this.apiUrlAuth}/CheckIfDuplicateLineItem/${personEventId}/${healthCareProviderId}/${tariffId}/${preAuthFromDate}/${preAuthToDate}`);
  }

  isDuplicatePreAuth(personEventId: number, healthCareProviderId: number, preAuthFromDate: string, preAuthToDate: string): any {
    return this.commonService.getAll<any>(`${this.apiUrlAuth}/IsDuplicatePreAuth/${personEventId}/${healthCareProviderId}/${preAuthFromDate}/${preAuthToDate}`);
  }

  getPreAuthRejectReasonList(): Observable<PreAuthRejectReason[]> {
    return this.commonService.getAll<PreAuthRejectReason[]>(this.apiUrlAuth + `/GetPreAuthRejectReasonList/`);
  }

  checkAdmissionCode(itemCode: string, practitionerTypeId: number): Observable<AdmissionCode> {
    return this.commonService.getAll<AdmissionCode>(`${this.apiUrlMedical}/CheckAdmissionCode/${itemCode}/${practitionerTypeId}`);
  }

  getTreatmentProtocols(): Observable<TreatmentProtocol[]> {
    return this.commonService.getAll<TreatmentProtocol[]>(`${this.apiUrlMedical}/GetTreatmentProtocols`);
  }

  getPreAuthorisationByPreAuthNumber(preAuthNumber: string): Observable<PreAuthorisation> {
    return this.commonService.getAll<PreAuthorisation>(this.apiUrlAuth + `/GetPreAuthorisationByPreAuthNumber/${preAuthNumber}`);
  }

  IsAuthorisationCodeLimitValid(requestedQuantity: string, itemCode: string, preAuthFromDate: string, practitionerTypeId: number, personEventId: number): any {
    return this.commonService.getAll<any>(`${this.apiUrlMedical}/IsAuthorisationCodeLimitValid/${requestedQuantity}/${itemCode}/${preAuthFromDate}/${practitionerTypeId}/${personEventId}`);
  }

  getPreAuthPractitionerTypeSetting(preAuthTypeId: number, practitionerTypeId: number): Observable<PreAuthPractitionerTypeSetting> {
    return this.commonService.getAll<PreAuthPractitionerTypeSetting>(this.apiUrlAuth + `/GetPreAuthPractitionerTypeSetting/${preAuthTypeId}/${practitionerTypeId}`);
  }

  getMutualExclusiveCodes(itemCode: string): Observable<MutualInclusiveExclusiveCode[]> {
    return this.commonService.getAll<MutualInclusiveExclusiveCode[]>(this.apiUrlMedical + `/GetMutualExclusiveCodes/${itemCode}`);
  }

  checkIfMedicalBenifitExists(claimId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/CheckIfMedicalBenifitExists/${claimId}`);
  }

  getMedicalWorkPoolForLoggedInUser(workPoolId: number, userId: number, pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Wizard.Id', sortDirection: string = 'asc', query: string = ''): Observable<PagedRequestResult<MedicalWorkPoolModel>> {
    return this.commonService.getAll<PagedRequestResult<MedicalWorkPoolModel>>(`${this.apiUrlAuth}/GetMedicalBusinessProcesses/${workPoolId}/${userId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${query}`);
  }

  lockOrUnlockWorkflow(workPool: MedicalWorkPoolModel): Observable<number> {
    return this.commonService.postGeneric<MedicalWorkPoolModel, number>(this.apiUrlAuth + `/LockOrUnlockWorkflow`, workPool);
  }

  assignWorkflow(workPool: MedicalWorkPoolModel): Observable<number> {
    return this.commonService.postGeneric<MedicalWorkPoolModel, number>(this.apiUrlAuth + `/AssignWorkflow`, workPool);
  }

  reAssignWorkflow(workPool: MedicalWorkPoolModel): Observable<number> {
    return this.commonService.postGeneric<MedicalWorkPoolModel, number>(this.apiUrlAuth + `/ReAssignWorkflow`, workPool);
  }

  searchForPreAuthorisation(preAuthSearchModel: PreAuthSearchModel): Observable<PreAuthorisation[]> {
    const url = `${this.apiUrlAuth}/SearchForPreAuthorisation`;
    return this.commonService.postGeneric<PreAuthSearchModel, PreAuthorisation[]>(url, preAuthSearchModel);
  }

  searchForPreAuthorisations(searchPreAuthCriteria: SearchPreAuthCriteria): Observable<PagedRequestResult<PreAuthorisation>> {
    const url = `${this.apiUrlAuth}/SearchForPreAuthorisations`;
    return this.commonService.postGeneric<SearchPreAuthCriteria, PagedRequestResult<PreAuthorisation>>(url, searchPreAuthCriteria);
  }

  getPreAuthCodeLimit(medicalItemCode: string, practitionerTypeId: number): Observable<PreauthCodeLimit> {
    return this.commonService.getAll<PreauthCodeLimit>(this.apiUrlMedical + `/GetPreAuthCodeLimit/${medicalItemCode}/${practitionerTypeId}`);
  }

  executePreauthBreakdownUnderAssessReasonValidations(preAuthorisation: PreAuthorisation): Observable<PreauthBreakdownUnderassessreason[]> {
    return this.commonService.postGeneric<PreAuthorisation, PreauthBreakdownUnderassessreason[]>(this.apiUrlAuth + `/ExecutePreauthBreakdownUnderAssessReasonValidations`, preAuthorisation);
  }

  getInvoicePreAuthNumbers(treatmentFromDate, healthCareProviderId: number, personEventId: number): Observable<PreAuthorisation[]> {
    return this.commonService.getAll<PreAuthorisation[]>(this.apiUrlAuth + `/GetInvoicePreAuthNumbers/${treatmentFromDate}/${healthCareProviderId}/${personEventId}`);
  }

  getQuotationTypeList(): Observable<QuotationType[]> {
    return this.commonService.getAll<QuotationType[]>(this.apiUrlAuth + `/GetQuotationTypeList`);
  }

  getProsthetistTypeList(): Observable<ProsthetistType[]> {
    return this.commonService.getAll<ProsthetistType[]>(this.apiUrlAuth + `/GetProsthetistTypeList`);
  }

  getProstheticItemList(): Observable<ProstheticItem[]> {
    return this.commonService.getAll<ProstheticItem[]>(this.apiUrlAuth + `/GetProstheticItemList`);
  }

  getProstheticItemCategoryList(): Observable<ProstheticItemCategory[]> {
    return this.commonService.getAll<ProstheticItemCategory[]>(this.apiUrlAuth + `/GetProstheticItemCategoryList`);
  }

  searchProsthetistQuotations(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'prosthetistQuoteId', sortDirection: string = 'asc', query: string = ''): Observable<PagedRequestResult<ProsthetistQuote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ProsthetistQuote>>(`${this.apiUrlAuth}/SearchProsthetistQuotations/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getProsthetistQuotationsById(prosthetistQuoteId: number): Observable<ProsthetistQuote> {
    return this.commonService.getAll<ProsthetistQuote>(this.apiUrlAuth + `/GetProsthetistQuotationsById/${prosthetistQuoteId}`);
  }

  getPreAuthsByClaimId(claimId: number): Observable<PreAuthorisation[]> {
    return this.commonService.getAll<PreAuthorisation[]>(this.apiUrlAuth + `/GetPreAuthsByClaimId/${claimId}`);
  }

  getChronicMedicationList(): Observable<PreAuthChronicMedicationList[]> {
    return this.commonService.getAll<PreAuthChronicMedicationList[]>(this.apiUrlMedical + `/GetChronicMedicationList`);
  }

  getMedicareWorkPool(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, assignedToUserId: string, userLoggedIn: number, workPoolId: number, isUserBox: boolean): Observable<PagedRequestResult<MedicareWorkPool>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<MedicareWorkPool>>(`${this.apiUrlAuth}/GetMedicalWorkPool/${assignedToUserId}/${userLoggedIn}/${isUserBox}/${workPoolId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  deletePreauthorisation(preAuthorisationId: number) {
    return this.commonService.remove(preAuthorisationId, `${this.apiUrlAuth}/DeletePreAuthorisation`);
  }

  addPreAuthorisationUnderAssessReason(preAuthorisationUnderAssessReason: PreAuthorisationUnderAssessReason): Observable<number> {
    return this.commonService.postGeneric<PreAuthorisationUnderAssessReason,number>(`${this.apiUrlAuth}/AddPreAuthorisationUnderAssessReason`, preAuthorisationUnderAssessReason);
  }
 
  createProstheticReviewWizard(wizardId: number, roleId: number): Observable<boolean> {
    return this.commonService.postWithNoData<boolean>(`${this.apiUrlAuth}/CreateProstheticReviewWizard/${wizardId}/${roleId}`);
  }
}
