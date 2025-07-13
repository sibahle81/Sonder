import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { RuleRequestResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result';
import { MedicalInvoiceValidationModel } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-validation-model';
import { InvoiceReportMapDetail } from '../models/invoice-medical-report-map-details';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { SearchInvoiceCriteria } from '../../shared/models/search-invoice-criteria';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { InvoiceAssessAllocateData } from '../models/medical-invoice-assess-allocate-data';
import { MedicalInvoiceSearchRequest } from 'projects/medicare/src/app/shared/models/medical-invoice-search-request';

@Injectable({
  providedIn: 'root'
})
export class MedicareMedicalInvoiceCommonService {
  private apiUrlInvoiceCommon = 'med/api/InvoiceCommon';

  constructor(
    private readonly commonService: CommonService) {
  }

  getInvoiceDetails(invoiceId: number): Observable<InvoiceDetails> {
    return this.commonService.get<InvoiceDetails>(invoiceId, `${this.apiUrlInvoiceCommon}/GetInvoiceDetails`);
  }

  editInvoice(invoiceModel: Invoice): Observable<boolean> {
    return this.commonService.edit(invoiceModel, this.apiUrlInvoiceCommon + `/EditInvoice`);
  }

  getMappedInvoicePreAuthDetails(invoiceId: number): Observable<PreAuthorisation[]> {
    return this.commonService.getAll<PreAuthorisation[]>(this.apiUrlInvoiceCommon + `/getMappedInvoicePreAuthDetails/${invoiceId}`);
  }

  assessAllocationSubmit(medicalInvoiceAssessAllocateData: InvoiceAssessAllocateData): Observable<number> {
    return this.commonService.postGeneric<InvoiceAssessAllocateData,number>(this.apiUrlInvoiceCommon + `/AssessAllocationSubmit`, medicalInvoiceAssessAllocateData);
  }

  validatePaymentRequest(invoiceDetails: InvoiceDetails): Observable<RuleRequestResult[]> {
    return this.commonService.postGeneric<InvoiceDetails, RuleRequestResult[]>(this.apiUrlInvoiceCommon + `/ValidatePaymentRequest`, invoiceDetails);
  }

  checkForMedicalReport(healthCareProviderId: number, invoiceId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrlInvoiceCommon}/CheckForMedicalReport/${healthCareProviderId}/${invoiceId}`);
  }

  ExecuteInvoiceValidations(invoiceDetails: InvoiceDetails): Observable<MedicalInvoiceValidationModel> {
    return this.commonService.postGeneric<InvoiceDetails, MedicalInvoiceValidationModel>(this.apiUrlInvoiceCommon + `/ExecuteInvoiceValidations`, invoiceDetails);
  }

  ExecuteInvoiceLineValidations(invoiceDetails: InvoiceDetails): Observable<MedicalInvoiceValidationModel> {
    return this.commonService.postGeneric<InvoiceDetails, MedicalInvoiceValidationModel>(this.apiUrlInvoiceCommon + `/ExecuteInvoiceLineValidations`, invoiceDetails);
  }

  isDuplicateLineItem(currentInvoiceLineItemId: number, personEventId: number, healthCareProviderId: number, tariffId: number, serviceDate: string): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrlInvoiceCommon}/CheckForDuplicateLineItem/${currentInvoiceLineItemId}/${personEventId}/${healthCareProviderId}/${tariffId}/${serviceDate}`);
  }

  getMappedInvoiceMedicalReports(invoiceId: number): Observable<MedicalReportForm[]> {
    return this.commonService.getAll<MedicalReportForm[]>(this.apiUrlInvoiceCommon + `/GetMappedInvoiceMedicalReports/${invoiceId}`);
  }

  listMedicalInvoices(pageNumber: number, pageSize: number, orderBy: string = 'invoiceId', sortDirection: string = 'asc', query: string): Observable<any> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<InvoiceDetails>>(`${this.apiUrlInvoiceCommon}/GetPagedInvoiceList/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchMedicalInvoice(pageNumber: number, pageSize: number, orderBy: string = 'invoiceId', sortDirection: string = 'asc', query: string): Observable<any> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<InvoiceDetails>>(`${this.apiUrlInvoiceCommon}/SearchMedicalInvoice/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchMedicalInvoiceV2(searchRequest: MedicalInvoiceSearchRequest): Observable<any> {
    return this.commonService.postGeneric<MedicalInvoiceSearchRequest, PagedRequestResult<InvoiceDetails>>(`${this.apiUrlInvoiceCommon}/SearchMedicalInvoiceV2/`, searchRequest);
  }


  SearchMedicalInvoiceV2

  deleteAllocatedInvoice(invoiceId: number): Observable<number> {
    return this.commonService.postGeneric<number, number>(this.apiUrlInvoiceCommon + `/DeleteAllocatedInvoice`, invoiceId);
  }

  getInvoiceDetailsByPersonEventId(personEventId: number): Observable<InvoiceDetails[]> {
    return this.commonService.getAll<InvoiceDetails[]>(`${this.apiUrlInvoiceCommon}/GetInvoiceDetailsByPersonEventId/${personEventId}`);
  }

  isPreauthInvoiceProcessed(preAuthId: number): Observable<boolean> {
    return this.commonService.get<boolean>(preAuthId, `${this.apiUrlInvoiceCommon}/IsPreauthInvoiceProcessed`);
  }

  searchForInvoices(searchPreAuthCriteria: SearchInvoiceCriteria): Observable<PagedRequestResult<InvoiceDetails>> {    
    const url = `${this.apiUrlInvoiceCommon}/SearchForInvoices`;
    return this.commonService.postGeneric<SearchInvoiceCriteria, PagedRequestResult<InvoiceDetails>>(url, searchPreAuthCriteria);
  }

  listMedicalInvoicesByPersonEventId(personEventId: number, pageNumber: number, pageSize: number, orderBy: string = 'invoiceId', sortDirection: string = 'asc'): Observable<any> {
    return this.commonService.getAll<PagedRequestResult<InvoiceDetails>>(`${this.apiUrlInvoiceCommon}/GetPagedInvoiceDetailsByPersonEventId/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }
  
  getDuplicateInvoiceDetails(invoiceId:number, personEventId: number,healthCareProviderId : number, hcpInvoiceNumber: string, hcpAccountNumber: string): Observable<InvoiceDetails> {
    return this.commonService.getAll<InvoiceDetails>(`${this.apiUrlInvoiceCommon}/GetDuplicateInvoiceDetails/${invoiceId}/${personEventId}/${healthCareProviderId}/${hcpInvoiceNumber}/${hcpAccountNumber}`);
  }

  updateMedicalInvoicePaymentStatus(payment: Payment): Observable<boolean> {
    return this.commonService.postGeneric<Payment, boolean>(this.apiUrlInvoiceCommon + `/UpdateMedicalInvoicePaymentStatus`, payment);
  }
}
