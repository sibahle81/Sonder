import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InvoicePaymentAllocation } from '../models/invoicePaymentAllocation';
import { ManualPaymentAllocation } from '../models/manualPaymentAllocation';
import { UnallocatedBankImportPayment } from '../models/unallocatedBankImportPayment';
import { Collection } from '../models/collection';
import { Transaction } from '../models/transaction';
import { InterDebtorTransfer } from '../models/interDebtorTransfer';
import { RefundHeader } from '../models/refund-header';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CollectionsAgeing } from '../../shared/models/collections-ageing';
import { BulkManualAllocation } from '../models/bulk-manual-allocation';
import { BulkAllocationFile } from '../models/bulk-allocation-file';
import { InvoiceAllocation } from '../../shared/models/invoice-allocation';
import { ExcptionAllocationFile } from '../models/exception-allocation-file';
import { ExceptionAllocation } from '../models/exception-allocation';
import { AdhocPaymentInstruction } from '../models/adhoc-payment-instruction';
import { AdhocPaymentInstructionsTermArrangementSchedule } from '../models/adhoc-payment-instructions-termArrangement-schedule';
import { FinPayee } from '../../shared/models/finpayee';
import { LegalHandOverDetail } from '../models/legal-hand-over-detail';


@Injectable({
  providedIn: 'root'
})
export class CollectionsService {
  private paymentAllocationApi = 'bill/api/billing/PaymentAllocation';
  private invoiceApi = 'bill/api/billing/Invoice';
  private collectionApi = 'bill/api/Collection';

  constructor(private readonly commonService: CommonService) { }

  getUnallocatedBankImport(): Observable<InvoicePaymentAllocation[]> {
    return this.commonService.getAll<InvoicePaymentAllocation[]>(`${this.paymentAllocationApi}/GetUnAllocatedPayments`);
  }

  getUnpaidInvoices(roleplayerId: number, isClaimRecovery: boolean): Observable<any[]> {
    return this.commonService.getAll<any[]>(`${this.invoiceApi}/GetUnPaidInvoices/${roleplayerId}/${isClaimRecovery}`);
  }

  getUnallocatedPaymentsForBankImport(): Observable<UnallocatedBankImportPayment[]> {
    return this.commonService.getAll<UnallocatedBankImportPayment[]>(`${this.paymentAllocationApi}/GetUnAllocatedPayments`);
  }

  SearchUnallocatedPaymentsForBankImport(query: string): Observable<UnallocatedBankImportPayment[]> {
    const search = query === '' ? null : query;
    return this.commonService.getAll<UnallocatedBankImportPayment[]>(`${this.paymentAllocationApi}/SearchUnAllocatedPayments/${search}`);
  }

  allocatePayments(manualPaymentAllocations: ManualPaymentAllocation[]): Observable<any> {
    return this.commonService.postGeneric<any, any>(`${this.paymentAllocationApi}/ManualAllocations/`, manualPaymentAllocations);
  }

  getPayment(paymentId: number): Observable<UnallocatedBankImportPayment> {
    return this.commonService.get<UnallocatedBankImportPayment>(paymentId, `${this.paymentAllocationApi}/GetUnAllocatedPaymentById`);
  }

  getCollections(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, collectionType: number, collectionStatus: number, startDate: string, endDate: string): Observable<PagedRequestResult<Collection>> {
    const collectionTypeParam = encodeURIComponent(collectionType.toString());
    const collectionStatusParam = encodeURIComponent(collectionStatus.toString());
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);

    let url = `${this.collectionApi}/GetCollections?startDate=${startDateParam}&endDate=${endDateParam}&page=${pageNumber}&pageSize=${pageSize}&orderBy=${orderBy}&sortDirection=${sortDirection}`;

    if (collectionType !== 0) {
      url = url + `&collectionType=${collectionTypeParam}`;
    }

    if (collectionStatus !== 0) {
      url = url + `&collectionStatus=${collectionStatusParam}`;
    }

    return this.commonService.getAll<PagedRequestResult<Collection>>(url);
  }

  getCollectionByTermArrangementSchedule(termArrangementScheduleId: number) : Observable<Collection>
  {
    return this.commonService.getAll<Collection>(`${this.collectionApi}/GetCollection/ByTermArrangementSchedule/${termArrangementScheduleId}`);
  }

  getAdhocPaymentInstructionsTermArrangementSchedules(termArrangementId: number): Observable<AdhocPaymentInstructionsTermArrangementSchedule[]> {
    return this.commonService.getAll<AdhocPaymentInstructionsTermArrangementSchedule[]>(`${this.collectionApi}/GetAdhocPaymentInstructionsTermArrangementSchedules/ByTermArrangementId/${termArrangementId}`);
  }

  searchCollections(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, filter: number): Observable<PagedRequestResult<Collection>> {
    const urlQuery = encodeURIComponent(query);
    if (sortDirection === '') {
      sortDirection = 'asc';
    }
    return this.commonService.getAll<PagedRequestResult<Collection>>(`${this.collectionApi}/Search/${urlQuery}/${filter}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }

  submitCollection(collection: any): Observable<Collection> {
    return this.commonService.editReturnsModel<Collection>(collection.collection, `${this.collectionApi}/SubmitCollection`);
  }

  submitPendingCollections(startDate: string, endDate: string) {
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);

    return this.commonService.postWithNoData(
      `${this.collectionApi}/SubmitPendingCollections?startDate=${startDateParam}&endDate=${endDateParam}`);
  }

  getTransactionAllocatedToDebtorAccount(transactionId: number): Observable<Transaction> {
    return this.commonService.getAll<Transaction>(`${this.paymentAllocationApi}/GetTransactionAllocatedToDebtorAccount/${transactionId}`);
  }

  getPaymentTransactionsAllocatedToDebtorAccount(roleplayerId: number): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.paymentAllocationApi}/GetPaymentTransactionsAllocatedToDebtorAccount/${roleplayerId}`);
  }

  getTransaction(transactionId: number): Observable<Transaction> {
    return this.commonService.get<Transaction>(transactionId, `${this.paymentAllocationApi}/GetTransaction`);
  }

  getDebtorRefunds(rolePlayerId: number): Observable<RefundHeader[]> {
    return this.commonService.getAll<RefundHeader[]>(`${this.paymentAllocationApi}/GetDebtorRefunds/${rolePlayerId}`);
  }

  getDebtorInterDebtorTransfers(rolePlayerId: number): Observable<InterDebtorTransfer[]> {
    return this.commonService.getAll<InterDebtorTransfer[]>(`${this.paymentAllocationApi}/GetDebtorInterDebtorTransfers/${rolePlayerId}`);
  }

  getCollectionsAgeing(balanceTypeId: number, clientTypeId: number, debtorStatus: number, endDate: string, industryId: number, productId: number): Observable<CollectionsAgeing[]> {
    return this.commonService.getAll<CollectionsAgeing[]>(`${this.collectionApi}/GetCollectionsAgeing/${balanceTypeId}/${clientTypeId}/${debtorStatus}/${endDate}/${industryId}/${productId}`);
  }

  bulkManualAllocations(content: any, fileName: string): Observable<number> {
    const url = `${this.paymentAllocationApi}/BulkManualAllocations`;
    return this.commonService.postGeneric<any, number>(url, { data: content.data, fileName });
  }


  getBulkPaymentFileDetails(fileId: number): Observable<BulkManualAllocation[]> {
    return this.commonService.getAll<BulkManualAllocation[]>(`${this.paymentAllocationApi}/GetBulkPaymentFileDetails/${fileId}`);
  }


  getBulkPaymentFiles(): Observable<BulkAllocationFile[]> {
    return this.commonService.getAll<BulkAllocationFile[]>(`${this.paymentAllocationApi}/GetBulkPaymentFiles`);
  }

  editBulkAllocations(allocations: BulkManualAllocation[]): Observable<any> {
    return this.commonService.postGeneric<any, any>(`${this.paymentAllocationApi}/EditBulkAllocations/`, allocations);
  }

  deleteBulkAllocations(allocations: number[]): Observable<any> {
    return this.commonService.postGeneric<any, any>(`${this.paymentAllocationApi}/DeleteBulkAllocations/`, allocations);
  }

  allocateParentPremiumPayments(manualPaymentAllocations: ManualPaymentAllocation[], source: number): Observable<any> {
    return this.commonService.postGeneric<any, any>(`${this.paymentAllocationApi}/AllocatePremiumPaymentToDebtorAndInvoice/`, { manualPaymentAllocations, source });
  }

  getTransactionInvoiceAllocations(transactionId: number): Observable<InvoiceAllocation[]> {
    return this.commonService.getAll<InvoiceAllocation[]>(`${this.paymentAllocationApi}/GetTransactionInvoiceAllocations/${transactionId}`);
  }
  exceptionFileAllocations(content: any, fileName: string): Observable<number> {
    const url = `${this.paymentAllocationApi}/ExceptionFailedlAllocations`;
    return this.commonService.postGeneric<any, number>(url, { data: content.data, fileName });
  }

  getExceptionFileAllication(): Observable<ExcptionAllocationFile[]> {
    return this.commonService.getAll<ExcptionAllocationFile[]>(`${this.paymentAllocationApi}/GetExceptionAllocationFiles`);
  }

  getExceptionFileDetails(fileId: number): Observable<ExceptionAllocation[]> {
    return this.commonService.getAll<ExceptionAllocation[]>(`${this.paymentAllocationApi}/GetExceptionAllocationDetails/${fileId}`);
  }

  createAdhocDebit(adhocPaymentInstruction: AdhocPaymentInstruction): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.collectionApi}/CreateAdhocDebit`, adhocPaymentInstruction);
  }

  getUnpaidInvoicesByPolicies(roleplayerId: number, isClaimRecovery: boolean, policyIds: number[]): Observable<any[]> {
    return this.commonService.postGeneric<any, any[]>(`${this.invoiceApi}/GetUnPaidInvoicesForPolicies`, { roleplayerId,isClaimRecovery, policyIds });
  } 
  
  getBulkPaymentAllocationFiles(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string,  startDate: Date, endDate: Date):Observable<PagedRequestResult<BulkAllocationFile>> {
    let url = `${this.paymentAllocationApi}/GetBulkPaymentAllocationFiles/${startDate.toISOString()}/${endDate.toISOString()}/${pageNumber}/${pageSize}/${orderBy}
    /${sortDirection}`;
    return this.commonService.getAll<PagedRequestResult<BulkAllocationFile>>(url);
  } 
}
