import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { PolicyPayment } from '../../shared/models/PolicyPayment';
import { CoverTypeModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/cover-type-model';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/EmailAudit';
import { PagedPaymentResponse } from '../../shared/models/paged-payment-response';
import { FilterPaymentsRequest } from '../models/filter-payments-request';
import { EstimatePaymentResponse } from '../models/estimate-payments';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Payment } from '../../shared/models/payment.model';
import { PaymentPoolSearchParams } from '../models/payment-pool-search-params';
import { AllocationPaymentModel } from '../../shared/models/allocation-payment.model';
import { ManageFinanceUser } from '../models/manager-finance-user';
import { BankBalance } from '../models/bank-balance';
import { EmailCommissionStatementRequest } from '../models/emailCommissionStatementRequest';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { GetRemittanceTransactionsList } from '../models/get-remittance-transactions-list-model';
import { GetRemittanceTransactionsListParams } from '../models/get-remittance-transactions-list-params';
import { GetRemittanceTransactionsListDetails } from '../models/get-remittance-transactions-list-details-model';
import { GetMSPGroups } from '../models/get-msp-groups-model';
import { PolicyBasedPayments } from '../../shared/models/PolicyBasedPayments';
import { PaymentEstimate } from '../../shared/models/payment-estimates.model';
import { PaymentsOverview } from '../../shared/models/payments-overview';
import { PaymentsProductOverview } from '../../shared/models/payments-product-overview';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'fin/api/payment';
  private auditApiUrl = 'fin/api/auditlog';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPayments(paymentType: number, paymentStatus: number, claimType: number,
    startDate: string, endDate: string, productType: number, pageSize: number, pageIndex: number): Observable<PagedPaymentResponse> {
    const paymentTypeParam = encodeURIComponent(paymentType.toString());
    const paymentStatusParam = encodeURIComponent(paymentStatus.toString());
    const claimTypeParam = encodeURIComponent(claimType.toString());
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);
    const pageSizeParam = encodeURIComponent(pageSize.toString());
    const pageIndexParam = encodeURIComponent(pageIndex.toString());
    let productTypeParam = '';
    if (productType) {
      productTypeParam = encodeURIComponent(productType.toString());
    }


    let url = `${this.apiUrl}/GetPayments?startDate=${startDateParam}&endDate=${endDateParam}&pageSize=${pageSizeParam}&pageIndex=${pageIndexParam}`;

    if (paymentType !== 0) {
      url = url + `&paymentType=${paymentTypeParam}`;
    }

    if (paymentStatus !== 0) {
      url = url + `&paymentStatus=${paymentStatusParam}`;
    }

    if (claimType !== 0) {
      url = url + `&claimType=${claimTypeParam}`;
    }

    if (productType) {
      url = url + `&entityType=${productTypeParam}`;
    }

    return this.commonService.getAll<PagedPaymentResponse>(url);
  }

  search(query: string, filter: number): Observable<Payment[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Payment[]>(`${this.apiUrl}/Search/${urlQuery}/${filter}`);
  }

  updateFsbAccreditation(payment: any): Observable<Payment> {
    // BUG, oly send what is required to server
    return this.commonService.editReturnsModel<Payment>(payment.payment, `${this.apiUrl}/UpdateFsbAccreditation`);
  }

  updateEmailAddress(paymentId: number,emailAddress: string): Observable<boolean> {
    return this.commonService.edit<string>(emailAddress, `${this.apiUrl}/updateEmailAddress/${paymentId}`);
  }

  submitPayment(paymentId: number): Observable<Payment> {
    return this.commonService.postWithNoData<Payment>(`${this.apiUrl}/SubmitPayment/${paymentId}`);
  }
  submitPayments(payments: Payment[]): Observable<Payment[]> {
    return this.commonService.editReturnsModel<Payment[]>(payments, `${this.apiUrl}/SubmitPayments`);
  }

  processTaxPayments(payments: Payment[]): Observable<Payment[]> {
    return this.commonService.editReturnsModel<Payment[]>(payments, `${this.apiUrl}/ProcessTaxPayments`);
  }

  reversePayment(payment: any): Observable<Payment> {
    return this.commonService.editReturnsModel<Payment>(payment, `${this.apiUrl}/ReversePayment`);
  }

  sendPaymentNotification(paymentId: number): Observable<Payment> {
    return this.commonService.postWithNoData<Payment>(`${this.apiUrl}/SendPaymentNotification/${paymentId}`);
  }

  getAuditLogs(itemId: string): Observable<AuditResult[]> {
    const urlQuery2 = encodeURIComponent(itemId.toString());
    const urlQuery1 = 5;

    return this.commonService.getAll<AuditResult[]>(`${this.auditApiUrl}/ByType/${urlQuery1}/${urlQuery2}`);
  }

  getPayment(id: number): Observable<Payment> {
    return this.commonService.get<Payment>(id, `${this.apiUrl}`);
  }

  addPayment(payment: Payment): Observable<number> {
    return this.commonService.postGeneric<Payment, number>(`${this.apiUrl}`, payment);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.commonService.getAll<Payment[]>(`${this.apiUrl}/AllSubmitted`);
  }

  recallMultiplePayments(payments: Payment[]): Observable<number[]> {
    return this.commonService.postGeneric<Payment[], number[]>(`${this.apiUrl}/PaymentRecall`, payments);
  }

  getPaymentByPolicyId(id: number): Observable<Payment> {
    return this.commonService.get<Payment>(id, `${this.apiUrl}/GetByPolicyId`);
  }

  getPaymentByClaimId(id: number): Observable<Payment> {
    return this.commonService.get<Payment>(id, `${this.apiUrl}/GetPaymentByClaimId`);
  }

  getPaymentsByPolicyId(id: number): Observable<Payment[]> {
    return this.commonService.getAll<Payment[]>(`${this.apiUrl}/GetPaymentsByPolicyId/${id}`);
  }

  recallBatchPayments(batchReference: string): Observable<number> {
    return this.commonService.addMultipleReturnsString<string>(batchReference, `${this.apiUrl}/BatchPaymentRecall`);
  }

  addMultiplePayments(payments: Payment[]): Observable<number[]> {
    return this.commonService.postGeneric<Payment[], number[]>(`${this.apiUrl}/Multiple`, payments);
  }

  checkBankResponses() {
    return this.commonService.postWithNoData(`${this.apiUrl}/ProcessBankResponses`);
  }

  checkBankStatements() {
    return this.commonService.postWithNoData(`${this.apiUrl}/ProcessBankStatements`);
  }

  submitAll() {
    return this.commonService.postWithNoData(`${this.apiUrl}/SubmitPendingPayments`);
  }

  getDailyEstimates(startDate: string, endDate: string): Observable<PolicyPayment> {
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);
    return this.commonService.getAll<PolicyPayment>(`${this.apiUrl}/GetDailyEstimates?startDate=${startDateParam}&endDate=${endDateParam}`);
  }

  dailyPaymentEstimates(startDate: string, endDate: string): Observable<PaymentEstimate[]> {
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);
    return this.commonService.getAll<PaymentEstimate[]>(`${this.apiUrl}/GetDailyPaymentEstimates?startDate=${startDateParam}&endDate=${endDateParam}`);
  }

  GetGoldWagePayments(): Observable<PolicyPayment> {
    return this.commonService.getAll<PolicyPayment>(`${this.apiUrl}/GetGoldWagePayments`);
  }
  
  GetEstimatedPayments(): Observable<EstimatePaymentResponse> {
    return this.commonService.getAll<EstimatePaymentResponse>(`${this.apiUrl}/GetEstimatePayment`);
  }

  GetSchemePaymentsByProductOptionId(productOptionId: number, paymentType: PaymentTypeEnum): Observable<PolicyPayment> {
    return this.commonService.getAll<PolicyPayment>(`${this.apiUrl}/GetSchemePaymentsByProductOptionId/${productOptionId}/${paymentType}`);
  }

  GetPaymentsOverview(coverTypemodel: CoverTypeModel): Observable<PolicyPayment> {
    return this.commonService.postGeneric<CoverTypeModel, PolicyPayment>(`${this.apiUrl}/GetPaymentsOverview`, coverTypemodel);
  }

  getPaymentsOverviewByPaymentType(paymentType: PaymentTypeEnum): Observable<PolicyPayment> {
    return this.commonService.postGeneric<PaymentTypeEnum, PolicyPayment>(`${this.apiUrl}/GetPaymentsOverviewByPaymentType`, paymentType);
  }

  GetCorporateClaimPayments(coverTypemodel: CoverTypeModel): Observable<PolicyPayment> {
    return this.commonService.postGeneric<CoverTypeModel, PolicyPayment>(`${this.apiUrl}/GetCorporateClaimPayments`, coverTypemodel);
  }

  GetPaymentNotificationAudit(paymentId: number): Observable<EmailAudit[]> {
    return this.commonService.getAll<EmailAudit[]>(`${this.apiUrl}/GetPaymentNotificationAudit/${paymentId}`);
  }

  getCoidPayments(filterPaymentsRequest: FilterPaymentsRequest): Observable<PagedRequestResult<Payment>> {
    return this.commonService.postGeneric<FilterPaymentsRequest, PagedRequestResult<Payment>>(`${this.apiUrl}/GetCoidPayments`, filterPaymentsRequest);
  }

  searchPaymentsPaged(paymentStatusId: number, paymentTypes: PaymentTypeEnum[], pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Payment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.postGeneric<PaymentTypeEnum[],PagedRequestResult<Payment>>(`${this.apiUrl}/SearchPaymentsPaged/${paymentStatusId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`, paymentTypes);
  }

  searchPolicyPaymentsPaged(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Payment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Payment>>(`${this.apiUrl}/SearchPaymentsPaged/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPaymentsPaged(paymentType: number, paymentStatus: number,startDate: string, endDate: string, productType: number, paymentFilter:number,
    pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string  ): Observable<PagedRequestResult<Payment>> {

      const startDateParam = encodeURIComponent(startDate);
      const endDateParam = encodeURIComponent(endDate);
      const pageNumberParam = encodeURIComponent(pageNumber.toString());
      const pageSizeParam = encodeURIComponent(pageSize.toString());
      const orderByParam = encodeURIComponent(orderBy);
      const sortDirectionParam = encodeURIComponent(sortDirection);

      let url = `${this.apiUrl}/GetPaymentsPaged?startDate=${startDateParam}&endDate=${endDateParam}&page=${pageNumberParam}&pageSize=${pageSizeParam}&orderBy=${orderByParam}&sortDirection=${sortDirectionParam}`;

      if (paymentType !== null)
      {
        const paymentTypeParam = encodeURIComponent(paymentType.toString());     
        url = url + `&paymentType=${paymentTypeParam}`;
      } 
        
      if (paymentStatus !== null)
      {
        const paymentStatusParam = encodeURIComponent(paymentStatus.toString());
        url = url + `&paymentStatus=${paymentStatusParam}`;
      } 
       
      if (productType !== 0)
      {
        const entityTypeParam = encodeURIComponent(productType.toString());
        url = url + `&entityType=${entityTypeParam}`;
      } 
        
      
      if (paymentFilter !== null)
      {
        const paymentFilterParam = encodeURIComponent(paymentFilter.toString());
        url = url + `&paymentFilter=${paymentFilterParam}`;
      } 
        
  
      if (query.length !== 0)
      {
        const queryParam = encodeURIComponent(query);
        url = url + `&query=${queryParam}`;
      }
        
    return this.commonService.getAll<PagedRequestResult<Payment>>(url);
  }

  paymentPoolSearch(params: PaymentPoolSearchParams): Observable<PagedRequestResult<Payment>> {
    return this.commonService.postGeneric<PaymentPoolSearchParams, PagedRequestResult<Payment>>(`${this.apiUrl}/GetPaymentsPaged`, params);
  }
  
   getPaymentWorkPool(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, reAllocate: boolean, userLoggedIn: number, workPoolId: number): Observable<PagedRequestResult<Payment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Payment>>(`${this.apiUrl}/GetPaymentWorkPool/${reAllocate}/${userLoggedIn}/${workPoolId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  GetAllocationsByMedicalInvoiceId(medicalInvoiceId: number, paymentTypeEnum:PaymentTypeEnum): Observable<AllocationPaymentModel> {
    return this.commonService.getAll<AllocationPaymentModel>(`${this.apiUrl}/GetAllocationsByMedicalInvoiceId/${medicalInvoiceId}/${paymentTypeEnum}`);
  }

  GetAllocationsByClaimInvoiceId(claimInvoiceId: number): Observable<AllocationPaymentModel> {
    return this.commonService.getAll<AllocationPaymentModel>(`${this.apiUrl}/GetAllocationsByClaimInvoiceId/${claimInvoiceId}`);
  }

  addManageUser(manageUser: ManageFinanceUser): Observable<number> {
    return this.commonService.postGeneric<ManageFinanceUser, number>(`${this.apiUrl}/AddManageUser`,manageUser);
  }

  getPagedPaymentsAssignedToUser(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Payment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Payment>>(`${this.apiUrl}/getPagedPaymentsAssignedToUser/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getBankBalances(): Observable<BankBalance[]> {
    return this.commonService.getAll<BankBalance[]>(`${this.apiUrl}/GetBankBalances`);
  }

  emailCommissionStatementToBroker(emailCommissionStatementRequest: EmailCommissionStatementRequest): Observable<number> {
    return this.commonService.postGeneric<EmailCommissionStatementRequest, number>(`${this.apiUrl}/EmailCommissionStatementToBroker`, emailCommissionStatementRequest);
  }

  GetRemittanceTransactionsList(getRemittanceTransactionsListParams: GetRemittanceTransactionsListParams): Observable<GetRemittanceTransactionsList[]> {
    return this.commonService.postGeneric<GetRemittanceTransactionsListParams, GetRemittanceTransactionsList[]>(`${this.apiUrl}/GetRemittanceTransactionsList`, getRemittanceTransactionsListParams);
  }

  GetRemittanceTransactionsListDetails(batchReference: string): Observable<GetRemittanceTransactionsListDetails[]> {
    return this.commonService.get<GetRemittanceTransactionsListDetails[]>(batchReference, `${this.apiUrl}/GetRemittanceTransactionsListDetails`);
  }

  getMSPGroups(): Observable<GetMSPGroups[]> {
    return this.commonService.getAll<GetMSPGroups[]>(`${this.apiUrl}/GetMSPGroups`);
  }

  getPolicyPaymentDetails(policyId: number, startDate: string, endDate: string): Observable<PolicyBasedPayments> {
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);    
    
    return this.commonService.getAll<PolicyBasedPayments>(`${this.apiUrl}/GetPolicyPaymentDetails?policyId=${policyId}&startDate=${startDateParam}&endDate=${endDateParam}`);
  } 
  
  submitAllPayments(params: PaymentPoolSearchParams): Observable<void> {
    return this.commonService.postGeneric<PaymentPoolSearchParams, void>(`${this.apiUrl}/SubmitAllPayments`, params);
  }
  
  getPaymentsOverviewPaged(startDate: string, endDate: string, page: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<PaymentsOverview>> {
    return this.commonService.getAll<PagedRequestResult<PaymentsOverview>>(`${this.apiUrl}/GetPaymentsOverviewPaged/${startDate}/${endDate}/${page}/${pageSize}/${orderBy}/${sortDirection}`);
  }
  
  getPaymentsProductOverview(startDate: string, endDate: string, paymentStatusId: number, product: string, query: string): Observable<PaymentsProductOverview[]> {
    const urlProduct = encodeURIComponent(product);
    const urlQuery= encodeURIComponent(query);

    return this.commonService.getAll<PaymentsProductOverview[]>(`${this.apiUrl}/GetPaymentsProductOverview/${startDate}/${endDate}/${paymentStatusId}/${urlProduct}/${urlQuery}`);
  }
}
