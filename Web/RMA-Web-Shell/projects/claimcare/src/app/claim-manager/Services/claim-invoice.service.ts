import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { RegisterFuneralModel } from '../shared/entities/funeral/register-funeral.model';
import { ClaimInvoice } from '../shared/entities/claim-invoice.model';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { SundryInvoice } from '../shared/claim-care-shared/claim-invoice-container/invoice-sundry/sundry-invoice';
import { WidowLumpSumInvoice } from '../shared/claim-care-shared/claim-invoice-container/invoice-widow-lump-sum/widow-lump-sum-invoice';
import { FuneralExpenseInvoice } from '../shared/claim-care-shared/claim-invoice-container/invoice-funeral-expenses/funeral-expense-invoice';
import { FatalPDLumpSumInvoice } from '../shared/claim-care-shared/claim-invoice-container/invoice-partial-dependency-lump-sum/fatal-pd-lump-sum-invoice';
import { TravelAuthorisedParty } from '../shared/entities/personEvent/travel-authorised-Party';
import { TotalTemporaryDisability } from '../shared/claim-care-shared/claim-invoice-container/total-temporary-disability/totalTemporaryDisability';
import { ClaimBenefitType } from '../shared/entities/personEvent/claimBenefitType';
import { TravelRateType } from '../shared/entities/personEvent/travelRateType';
import { TravelAuthorisation } from '../shared/claim-care-shared/claim-authorisations-container/claim-travel-authorisations/claimTravelAuthorisations';
import { ClaimEstimate } from '../shared/entities/personEvent/claimEstimate';
import { PdAward } from '../shared/claim-care-shared/claim-disability-container/claim-pdlumpsum-award/PdAward';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { ClaimBenefit } from '../shared/entities/claim-benefit';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { ClaimBenefitFormula } from '../shared/entities/claim-benefit-formula';
import { PersonEventModel } from '../shared/entities/personEvent/personEvent.model';
import { TopRankedEstimateAmount } from '../shared/entities/top-ranked-estimate-amount';
import { FatalLumpSumInvoice } from '../shared/claim-care-shared/claim-invoice-container/invoice-fatal-lump-sum/fatal-lump-sum-invoice';
import { ClaimHearingAssessment } from '../shared/entities/claim-hearing-assessment';
import { ClaimDisabilityAssessment } from '../shared/entities/claim-disability-assessment';
import { ClaimDisabilityPension } from '../shared/entities/claim-disability-pension';
import { TravelExpenseInvoice } from '../shared/claim-care-shared/claim-invoice-container/invoice-travel-expense/travel-expense-invoice';

@Injectable({
  providedIn: 'root'
})
export class ClaimInvoiceService {
  private apiUrl = 'clm/api/ClaimInvoice';

  constructor(
    private readonly commonService: CommonService) {
  }

  createClaimInvoice(claimInvoice: ClaimInvoice): Observable<ClaimInvoice> {
    return this.commonService.postGeneric<ClaimInvoice, ClaimInvoice>(`${this.apiUrl}/CreateClaimInvoice`, claimInvoice);
  }

  createClaimInvoices(claimInvoices: ClaimInvoice[]): Observable<ClaimInvoice[]> {
    return this.commonService.postGeneric<ClaimInvoice[], ClaimInvoice[]>(`${this.apiUrl}/CreateClaimInvoices`, claimInvoices);
  }

  updateClaimInvoiceV2(claimInvoice: ClaimInvoice): Observable<ClaimInvoice> {
    return this.commonService.postGeneric<ClaimInvoice, ClaimInvoice>(`${this.apiUrl}/UpdateClaimInvoiceV2`, claimInvoice);
  }

  executeFuneralClaimRegistrationRules(registerFuneral: RegisterFuneralModel): Observable<RegisterFuneralModel> {
    return this.commonService.postGeneric<RegisterFuneralModel, RegisterFuneralModel>(`${this.apiUrl}/ExecuteFuneralClaimRegistrationRules`, registerFuneral);
  }

  getPagedClaimInvoices(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<ClaimInvoice>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimInvoice>>(`${this.apiUrl}/GetPagedClaimInvoices/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedClaimInvoiceAllocations(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<ClaimInvoice>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimInvoice>>(`${this.apiUrl}/GetPagedClaimInvoiceAllocations/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getSundryInvoice(claimInvoiceId: number): Observable<SundryInvoice> {
    return this.commonService.getAll<SundryInvoice>(`${this.apiUrl}/GetSundryInvoice/${claimInvoiceId}`);
  }

  getPartialDependencyLumpSumInvoice(claimInvoiceId: number): Observable<FatalPDLumpSumInvoice> {
    return this.commonService.getAll<FatalPDLumpSumInvoice>(`${this.apiUrl}/GetPartialDependencyLumpSumInvoice/${claimInvoiceId}`);
  }

  getWidowLumpSunInvoice(claimInvoiceId: number): Observable<WidowLumpSumInvoice> {
    return this.commonService.getAll<WidowLumpSumInvoice>(`${this.apiUrl}/GetWidowLumpSumInvoice/${claimInvoiceId}`);
  }

  getFuneralExpenseInvoice(claimInvoiceId: number): Observable<FuneralExpenseInvoice> {
    return this.commonService.getAll<FuneralExpenseInvoice>(`${this.apiUrl}/GetFuneralExpenseInvoice/${claimInvoiceId}`);
  }

  GetDaysOffInvoicInvoice(claimInvoiceId: number): Observable<TotalTemporaryDisability> {
    return this.commonService.getAll<TotalTemporaryDisability>(`${this.apiUrl}/GetDaysOffInvoicInvoice/${claimInvoiceId}`);
  }

  addSundryInvoice(sundryInvoice: SundryInvoice): Observable<boolean> {
    return this.commonService.postGeneric<SundryInvoice, boolean>(`${this.apiUrl}/AddSundryInvoice`, sundryInvoice);
  }

  AddDaysOffInvoice(daysOffInvoice: TotalTemporaryDisability): Observable<boolean> {
    return this.commonService.postGeneric<TotalTemporaryDisability, boolean>(`${this.apiUrl}/AddDaysOffInvoice`, daysOffInvoice);
  }

  addPartialDependencyLumpSumInvoice(fatalPDLumpSumInvoice: FatalPDLumpSumInvoice): Observable<boolean> {
    return this.commonService.postGeneric<FatalPDLumpSumInvoice, boolean>(`${this.apiUrl}/AddFatalPDLumpsumInvoice`, fatalPDLumpSumInvoice);
  }

  addWidowLumpSumInvoice(widowLumpSum: WidowLumpSumInvoice): Observable<boolean> {
    return this.commonService.postGeneric<WidowLumpSumInvoice, boolean>(`${this.apiUrl}/AddWidowLumpsumInvoice`, widowLumpSum);
  }

  addFuneralExpenseInvoice(funeralExpense: FuneralExpenseInvoice): Observable<boolean> {
    return this.commonService.postGeneric<FuneralExpenseInvoice, boolean>(`${this.apiUrl}/AddFuneralExpenseInvoice`, funeralExpense);
  }

  addTravelExpenseInvoice(travelExpense: TravelExpenseInvoice): Observable<boolean> {
    return this.commonService.postGeneric<TravelExpenseInvoice, boolean>(`${this.apiUrl}/AddTravelExpenseInvoice`, travelExpense);
  }

  addClaimDisabilityAssessment(claimDisabilityAssessment: ClaimDisabilityAssessment): Observable<number> {
    return this.commonService.postGeneric<ClaimDisabilityAssessment, number>(`${this.apiUrl}/AddClaimDisabilityAssessment`, claimDisabilityAssessment);
  }

  getClaimDisabilityAssessment(personEventId: number): Observable<ClaimDisabilityAssessment[]> {
    return this.commonService.getAll<ClaimDisabilityAssessment[]>(`${this.apiUrl}/GetClaimDisabilityAssessment/${personEventId}`);
  }

  getClaimDisabilityAssessmentById(claimDisabilityAssessmentId: number): Observable<ClaimDisabilityAssessment> {
    return this.commonService.getAll<ClaimDisabilityAssessment>(`${this.apiUrl}/GetClaimDisabilityAssessmentById/${claimDisabilityAssessmentId}`);
  }

  getClaimHearingAssessment(personEventId: number): Observable<ClaimHearingAssessment[]> {
    return this.commonService.getAll<ClaimHearingAssessment[]>(`${this.apiUrl}/GetClaimHearingAssessment/${personEventId}`);
  }

  getClaimDisabilityPensionByPersonEventId(personEventId: number): Observable<ClaimDisabilityPension[]> {
    return this.commonService.getAll<ClaimDisabilityPension[]>(`${this.apiUrl}/GetClaimDisabilityPensionByPersonEventId/${personEventId}`);
  }

  addClaimDisabilityPension(claimDisabilityPension: ClaimDisabilityPension): Observable<number> {
    return this.commonService.postGeneric<ClaimDisabilityPension, number>(`${this.apiUrl}/AddClaimDisabilityPension`, claimDisabilityPension);
  }

  updateClaimDisabilityPension(claimDisabilityPension: ClaimDisabilityPension): Observable<boolean> {
    return this.commonService.postGeneric<ClaimDisabilityPension, boolean>(`${this.apiUrl}/UpdateClaimDisabilityPension`, claimDisabilityPension);
  }

  GetTravelAuthorisedParties(): Observable<TravelAuthorisedParty[]> {
    return this.commonService.getAll<TravelAuthorisedParty[]>(`${this.apiUrl}/GetTravelAuthorisedParties/`);
  }

  GetTravelRateTypes(): Observable<TravelRateType[]> {
    return this.commonService.getAll<TravelRateType[]>(`${this.apiUrl}/GetTravelRateTypes/`);
  }

  addTravelAuthorisation(travelAuthorisation: TravelAuthorisation): Observable<boolean> {
    return this.commonService.postGeneric<TravelAuthorisation, boolean>(`${this.apiUrl}/AddTravelAuthorisation`, travelAuthorisation);
  }

  GetClaimBenefitTypes(): Observable<ClaimBenefitType> {
    return this.commonService.getAll<ClaimBenefitType>(`${this.apiUrl}/GetClaimBenefitTypes/`);
  }

  GetClaimEstimateByPersonEvent(personEventId: number): Observable<ClaimEstimate[]> {
    return this.commonService.getAll<ClaimEstimate[]>(`${this.apiUrl}/GetClaimEstimateByPersonEventId/${personEventId}`);
  }

  getClaimInvoiceByClaimInvoiceId(claimInvoiceId: number): Observable<ClaimInvoice> {
    return this.commonService.getAll<ClaimInvoice>(`${this.apiUrl}/GetClaimInvoiceByClaimInvoiceId/${claimInvoiceId}`);
  }

  getClaimInvoicesByClaimId(claimId: number): Observable<ClaimInvoice[]> {
    return this.commonService.getAll<ClaimInvoice[]>(`${this.apiUrl}/GetClaimInvoicesByClaimId/${claimId}`);
  }

  sendPdPaidCloseletter(personEventId: number): Observable<boolean> {
    return this.commonService.postGeneric<number, boolean>(`${this.apiUrl}/SendPdPaidCloseletter`, personEventId);
  }

  createInvoiceAllocation(data: ClaimInvoice): Observable<boolean> {
    return this.commonService.postGeneric<ClaimInvoice, boolean>(`${this.apiUrl}/CreateInvoiceAllocation`, data);
  }

  AddClaimEstimate(data: ClaimEstimate): Observable<ClaimEstimate> {
    return this.commonService.postGeneric<ClaimEstimate, ClaimEstimate>(`${this.apiUrl}/AddClaimEstimate`, data);
  }

  addClaimEstimates(benefits: Benefit[], personEventId: number): Observable<boolean> {
    return this.commonService.postGeneric<Benefit[], boolean>(`${this.apiUrl}/AddClaimEstimates/${personEventId}`, benefits);
  }

  updateSundryInvoice(sundry: SundryInvoice): Observable<boolean> {
    return this.commonService.postGeneric<SundryInvoice, boolean>(`${this.apiUrl}/UpdateSundryInvoice`, sundry);
  }

  updateWidowLumpSumInvoice(widowLumpSum: WidowLumpSumInvoice): Observable<boolean> {
    return this.commonService.postGeneric<WidowLumpSumInvoice, boolean>(`${this.apiUrl}/UpdateWidowLumpsumInvoice`, widowLumpSum);
  }

  updateDaysOffInvoice(daysOffInvoice: TotalTemporaryDisability): Observable<boolean> {
    return this.commonService.postGeneric<TotalTemporaryDisability, boolean>(`${this.apiUrl}/UpdateDaysOffInvoice`, daysOffInvoice);
  }

  updateFuneralExpInvoice(funeralExpInvoice: FuneralExpenseInvoice): Observable<boolean> {
    return this.commonService.postGeneric<FuneralExpenseInvoice, boolean>(`${this.apiUrl}/UpdateFuneralExpInvoice`, funeralExpInvoice);
  }

  updateTravelExpInvoice(travelExpInvoice: TravelExpenseInvoice): Observable<boolean> {
    return this.commonService.postGeneric<TravelExpenseInvoice, boolean>(`${this.apiUrl}/UpdateTravelExpInvoice`, travelExpInvoice);
  }

  updatePartialDependencyLumpsumInvoice(fatalPDLumpSumInvoice: FatalPDLumpSumInvoice): Observable<boolean> {
    return this.commonService.postGeneric<FatalPDLumpSumInvoice, boolean>(`${this.apiUrl}/UpdatePartialDependencyLumpsumInvoice`, fatalPDLumpSumInvoice);
  }

  updateClaimDisabilityAssessmentStatus(claimDisabilityAssessment: ClaimDisabilityAssessment): Observable<boolean> {
    return this.commonService.edit(claimDisabilityAssessment, `${this.apiUrl}/UpdateClaimDisabilityAssessmentStatus`);
  }

  approveClaimDisabilityAssessmentStatus(claimDisabilityAssessment: ClaimDisabilityAssessment): Observable<boolean> {
    return this.commonService.edit(claimDisabilityAssessment, `${this.apiUrl}/ApproveClaimDisabilityAssessmentStatus`);
  }

  deleteClaimInvoice(claimInvoiceId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/DeleteClaimInvoice/${claimInvoiceId}`);
  }

  GetPagedPdLumpSumAwards(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<PdAward>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PdAward>>(`${this.apiUrl}/GetPagedPdLumpSumAwards/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedClaimTravelAuthorisation(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<TravelAuthorisation>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<TravelAuthorisation>>(`${this.apiUrl}/GetPagedClaimTravelAuthorisation/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updateClaimDisabilityAssessment(claimDisabilityAssessment: ClaimDisabilityAssessment): Observable<boolean> {
    return this.commonService.edit(claimDisabilityAssessment, `${this.apiUrl}/UpdateClaimDisabilityAssessment`);
  }

  deleteClaimDisabilityAssessment(claimDisabilityAssessment: ClaimDisabilityAssessment): Observable<boolean> {
    return this.commonService.edit(claimDisabilityAssessment, `${this.apiUrl}/DeleteClaimDisabilityAssessment`);
  }

  addClaimPdLumpsumAward(pdAward: PdAward): Observable<boolean> {
    return this.commonService.postGeneric<PdAward, boolean>(`${this.apiUrl}/AddClaimPdLumpsumAward`, pdAward);
  }

  approvePDLumpsumAward(pdLumpsumAward: PdAward): Observable<boolean> {
    return this.commonService.edit(pdLumpsumAward, `${this.apiUrl}/ApprovePDLumpsumAward`);
  }

  reinstateClaimInvoice(claimInvoiceId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/ReinstateClaimInvoice/${claimInvoiceId}`);
  }

  updateClaimInvoice(claimInvoice: ClaimInvoice): Observable<boolean> {
    return this.commonService.postGeneric<ClaimInvoice, boolean>(`${this.apiUrl}/UpdateClaimInvoice`, claimInvoice);
  }

  getPagedClaimEstimates(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<ClaimEstimate>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimEstimate>>(`${this.apiUrl}/GetPagedClaimEstimates/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getDaysOffInvoiceByClaimId(claimId: number): Observable<ClaimInvoice[]> {
    return this.commonService.getAll<ClaimInvoice[]>(`${this.apiUrl}/GetDaysOffInvoiceByClaimId/${claimId}`);
  }

  getWidowLumpsumInvoiceByClaimId(claimId: number): Observable<ClaimInvoice[]> {
    return this.commonService.getAll<ClaimInvoice[]>(`${this.apiUrl}/GetWidowLumpsumInvoiceByClaimId/${claimId}`);
  }

  getTTDBenefit(industryClass: IndustryClassEnum, daysOff: number, personEventId: number): Observable<number> {
    return this.commonService.getAll<number>(this.apiUrl + `/GetTTDBenefit/${industryClass}/${daysOff}/${personEventId}`);
  }

  getClaimEstimateByPersonEventAndEstimateType(estimateType: EstimateTypeEnum, personEventId: number): Observable<ClaimEstimate[]> {
    return this.commonService.getAll<ClaimEstimate[]>(this.apiUrl + `/GetClaimEstimateByPersonEventAndEstimateType/${personEventId}/${estimateType}`);
  }

  daysOffInvoiceRejectCommunication(personEventId: number, claimInvoiceId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/DaysOffInvoiceRejectCommunication/${personEventId}/${claimInvoiceId}`);
  }

  getFuneralExpenseInvoiceByClaimId(claimId: number): Observable<ClaimInvoice[]> {
    return this.commonService.getAll<ClaimInvoice[]>(`${this.apiUrl}/GetFuneralExpenseInvoiceByClaimId/${claimId}`);
  }

  getSundryInvoiceByClaimId(claimId: number): Observable<ClaimInvoice[]> {
    return this.commonService.getAll<ClaimInvoice[]>(`${this.apiUrl}/GetSundryInvoiceByClaimId/${claimId}`);
  }

  updateClaimEstimate(claimEstimate: ClaimEstimate): Observable<boolean> {
    return this.commonService.postGeneric<ClaimEstimate, boolean>(`${this.apiUrl}/UpdateEstimate`, claimEstimate);
  }

  updateClaimEstimates(claimEstimates: ClaimEstimate[]): Observable<ClaimEstimate[]> {
    return this.commonService.postGeneric<ClaimEstimate[], ClaimEstimate[]>(`${this.apiUrl}/UpdateClaimEstimatesV2`, claimEstimates);
  }

  getClaimBenefitsByClaimId(claimId: number): Observable<ClaimBenefit[]> {
    return this.commonService.getAll<ClaimBenefit[]>(`${this.apiUrl}/GetClaimBenefitsByClaimId/${claimId}`);
  }

  addClaimBenefit(claimBenefit: ClaimBenefit): Observable<number> {
    return this.commonService.postGeneric<ClaimBenefit, number>(`${this.apiUrl}/AddClaimBenefit`, claimBenefit);
  }

  getClaimBenefitFormulaByEstimateType(estimateType: EstimateTypeEnum): Observable<ClaimBenefitFormula> {
    return this.commonService.getAll<ClaimBenefitFormula>(this.apiUrl + `/GetClaimBenefitFormulaByEstimateType/${estimateType}`);
  }

  getTopRankedEstimatesFromMedicalReport(personEventModel: PersonEventModel): Observable<TopRankedEstimateAmount> {
    return this.commonService.postGeneric<PersonEventModel, TopRankedEstimateAmount>(this.apiUrl + `/GetTopRankedEstimatesFromMedicalReport`, personEventModel);
  }

  recalculateAllClaimEstimates(personEvent: PersonEventModel, isMedicalReportOverride: boolean): Observable<ClaimEstimate[]> {
    return this.commonService.postGeneric<PersonEventModel, ClaimEstimate[]>(this.apiUrl + `/ReCalculateAllClaimEstimates/${isMedicalReportOverride}`, personEvent);
  }

  recalculateClaimEstimates(claimEstimates: ClaimEstimate[]): Observable<ClaimEstimate[]> {
    return this.commonService.postGeneric<ClaimEstimate[], ClaimEstimate[]>(this.apiUrl + `/ReCalculateClaimEstimates`, claimEstimates);
  }

  getDaysOffInvoiceByPersonEventId(personEventId: number): Observable<TotalTemporaryDisability[]> {
    return this.commonService.getAll<TotalTemporaryDisability[]>(`${this.apiUrl}/GetDaysOffInvoiceByPersonEventId/${personEventId}`);
  }

  addFatalLumpSumInvoice(fatalLumpSum: FatalLumpSumInvoice): Observable<boolean> {
    return this.commonService.postGeneric<FatalLumpSumInvoice, boolean>(`${this.apiUrl}/AddFatalLumpsumInvoice`, fatalLumpSum);
  }

  updateFatalLumpSumInvoice(fatalLumpSum: FatalLumpSumInvoice): Observable<boolean> {
    return this.commonService.postGeneric<FatalLumpSumInvoice, boolean>(`${this.apiUrl}/UpdateFatalLumpsumInvoice`, fatalLumpSum);
  }

  getFatalLumpSunInvoice(claimInvoiceId: number): Observable<FatalLumpSumInvoice> {
    return this.commonService.getAll<FatalLumpSumInvoice>(`${this.apiUrl}/GetFatalLumpSumInvoice/${claimInvoiceId}`);
  }

  getTravelExpenseInvoice(claimInvoiceId: number): Observable<TravelExpenseInvoice> {
    return this.commonService.getAll<TravelExpenseInvoice>(`${this.apiUrl}/GetTravelExpenseInvoice/${claimInvoiceId}`);
  }

  AutoGenerateInvoices(personEventId: number): Observable<boolean> {
    return this.commonService.postGeneric<number, boolean>(`${this.apiUrl}/AutoGenerateInvoices`, personEventId);
  }
}
