import { Statement } from './../models/statement';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from '../../../../../shared-services-lib/src/lib/services/common/common.service';
import { Invoice } from '../models/invoice';
import { InvoiceSearchResult } from '../models/invoice-search-result';
import { AdhocCollectionWizard } from '../../billing-manager/wizards/adhoc-collection-wizard';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { SearchAccountResults } from '../models/search-account-results';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { DebitOrder } from '../models/debit-order';
import { UnallocatedPayment } from '../models/unallocated-payment';
import { AllocatedPayment } from '../models/allocated-payment';
import { StatementAnalysis } from '../models/statement-analysis';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { InvoiceAllocation } from '../models/invoice-allocation';
import { Transaction } from '../../billing-manager/models/transaction';
import { TransactionTypeEnum } from '../enum/transactionTypeEnum';
import { InvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-type-enum';
import { InvoicePaymentAllocation } from '../../billing-manager/models/invoicePaymentAllocation';
import { CreditNoteSearchResult } from '../models/credit-note-search-result';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'bill/api/billing/invoice';
  private apiClaimUrl = 'clm/api/claim';
  private auditApiUrl = 'bill/api/billing/AuditLog';
  constructor(
    private readonly commonService: CommonService) {
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.commonService.get<Invoice>(id, `${this.apiUrl}/GetInvoice`);
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.commonService.get<Invoice>(id, `${this.apiUrl}/GetInvoiceById`);
  }

  getInvoiceByInvoiceNumber(invoiceNumber: string): Observable<Invoice> {
    return this.commonService.get<Invoice>(invoiceNumber, `${this.apiUrl}/GetInvoiceByInvoiceNumber`);
  }

  sendInvoice(invoiceSearchResult: InvoiceSearchResult) {
    return this.commonService.edit(invoiceSearchResult, `${this.apiUrl}/SendInvoice`);
  }

  sendStatement(invoiceSearchResult: InvoiceSearchResult) {
    return this.commonService.edit(invoiceSearchResult, `${this.apiUrl}/SendStatement`);
  }

  sendTransactional(invoiceSearchResult: InvoiceSearchResult) {
    return this.commonService.edit(invoiceSearchResult, `${this.apiUrl}/SendTransactional`);
  }

  getInvoiceByPolicy(policyId: number): Observable<Invoice> {
    return this.commonService.get<Invoice>(policyId, `${this.apiUrl}/GetInvoiceByPolicy`);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.commonService.getAll<Invoice[]>(`${this.apiUrl}`);
  }

  addInvoice(invoice: Invoice): Observable<number> {
    return this.commonService.postGeneric<Invoice, number>(`${this.apiUrl}`, invoice);
  }

  editInvoice(invoice: Invoice): Observable<boolean> {
    return this.commonService.edit(invoice, `${this.apiUrl}`);
  }

  removeInvoice(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${this.apiUrl}`);
  }

  searchInvoices(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<InvoiceSearchResult[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<InvoiceSearchResult[]>(`${this.apiUrl}/SearchInvoices/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  searchAccounts(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<SearchAccountResults[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<SearchAccountResults[]>(`${this.apiUrl}/SearchAccounts/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }

  getStatement(transactionType: TransactionTypeEnum, query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, policyId: number, startDate: string, endDate: string): Observable<PagedRequestResult<Transaction>> {
    let url = `${this.apiUrl}/GetStatement?policyId=${policyId}&startDate=${startDate}&endDate=${endDate}&page=${pageNumber}&pageSize=${pageSize}&orderBy=${orderBy}&sortDirection=${sortDirection}&transactionType=${transactionType}`;
    if (query !== '') {
      url = url + `&query=${query}`;
    }

    return this.commonService.getAll<PagedRequestResult<Transaction>>(url);
  }

  getInvoiceAudit(invoiceId: number): Observable<AuditResult[]> {
    const urlQuery = encodeURIComponent('invoice');
    return this.commonService.getAll<AuditResult[]>(`${this.auditApiUrl}/ByType/${urlQuery}/${invoiceId}`);
  }

  getStatementAudit(invoiceId: number): Observable<AuditResult[]> {
    const urlQuery = encodeURIComponent('statement');
    return this.commonService.getAll<AuditResult[]>(`${this.auditApiUrl}/ByType/${urlQuery}/${invoiceId}`);
  }

  addAuditLog(auditResult: AuditResult): Observable<number> {
    return this.commonService.postGeneric<AuditResult, number>(`${this.auditApiUrl}`, auditResult);
  }

  getStatementByRolePlayer(rolePlayerId: number): Observable<Statement[]> {
    // const urlQuery = encodeURIComponent(policyId);
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetStatementByRolePlayer/${rolePlayerId}`);
  }

  getStatementByPolicy(policyId: number): Observable<Statement[]> {
    // const urlQuery = encodeURIComponent(policyId);
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetStatementByPolicy/${policyId}`);
  }

  getStatementByPolicyPaged(policyId: number, page: number, pageSize: number): Observable<PagedRequestResult<Statement>> {
    // const urlQuery = encodeURIComponent(policyId);
    return this.commonService.getAll<PagedRequestResult<Statement>>(`${this.apiUrl}/GetStatementByPolicyPaged/${policyId}/${page}/${pageSize}`);
  }

  getUnpaidInvoices(paymentMethodId: number): Observable<AdhocCollectionWizard[]> {
    return this.commonService.getAll<AdhocCollectionWizard[]>(`${this.apiUrl}/GetUnpaidInvoicesByPaymentMethodPaged/${paymentMethodId}`);
  }

  getUnpaidInvoicesByPolicyId(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Invoice>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Invoice>>(`${this.apiUrl}/GetUnpaidInvoicesByPolicyId/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchDebtors(query: string): Observable<SearchAccountResults[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<SearchAccountResults[]>(`${this.apiUrl}/SearchDebtors/${urlQuery}`);
  }

  getClaimByPolicy(policyId: number): Observable<Claim[]> {
    return this.commonService.getAll<Claim[]>(`${this.apiClaimUrl}/GetClaimByPolicy/${policyId}`);
  }

  getUnPaidInvoicesByPolicy(policyId: number): Observable<InvoicePaymentAllocation[]> {
    return this.commonService.getAll<InvoicePaymentAllocation[]>(`${this.apiUrl}/GetUnPaidInvoicesByPolicy/${policyId}`);
  }

  getPendingInvoicesByPolicy(policyId: number): Observable<Invoice[]> {
    return this.commonService.getAll<Invoice[]>(`${this.apiUrl}/GetPendingInvoicesByPolicy/${policyId}`);
  }

  getDebtorPendingInvoices(policyId: number): Observable<Invoice[]> {
    return this.commonService.getAll<Invoice[]>(`${this.apiUrl}/GetDebtorPendingInvoices/${policyId}`);
  }

  getPaidInvoicesByPolicyId(policyId: number): Observable<Invoice[]> {
    return this.commonService.getAll<Invoice[]>(`${this.apiUrl}/GetPaidInvoicesByPolicyId/${policyId}`);
  }

  getDebitOrderReport(periodYear: number, periodMonth: number, startDate: string, endDate: string, industryId: number, productId: number, debitOrderTypeId: number, accountNumber: string): Observable<DebitOrder[]> {
    return this.commonService.getAll<DebitOrder[]>(`${this.apiUrl}/GetDebitOrderReport/${periodYear}/${periodMonth}/${startDate}/${endDate}/${industryId}/${productId}/${debitOrderTypeId}/${accountNumber}`);
  }

  GetUnallocatedPaymentsPaged(dateType: number, dateFrom: Date, dateTo: Date, bankAccNumber: string, page: number, pageSize: number, orderBy: string, sortDirection: string, query: string = '1'): Observable<PagedRequestResult<UnallocatedPayment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<UnallocatedPayment>>(`${this.apiUrl}/GetUnallocatedPaymentsPaged/${dateType}/${dateFrom.toISOString()}/${dateTo.toISOString()}/${bankAccNumber}/${page}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  GetUnallocatedPayments(dateType: number, dateFrom: Date, dateTo: Date, query: string, bankAccNumber: string): Observable<UnallocatedPayment[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<UnallocatedPayment[]>(`${this.apiUrl}/GetUnallocatedPayments/${dateType}/${dateFrom.toISOString()}/${dateTo.toISOString()}/${bankAccNumber}/${urlQuery}`);
  }

  getAllocatedPayments(startDate: string, endDate: string, dateType: number, bankAccNumber: string, productId: number, periodYear: number, periodMonth: number): Observable<AllocatedPayment[]> {
    return this.commonService.getAll<AllocatedPayment[]>(`${this.apiUrl}/GetAllocatedPayments/${startDate}/${endDate}/${dateType}/${bankAccNumber}/${productId}/${periodYear}/${periodMonth}`);
  }

  getAllocatedEuropeAssistPremiums(): Observable<AllocatedPayment[]> {
    return this.commonService.getAll<AllocatedPayment[]>(`${this.apiUrl}/GetEuropeAssistPremiums`);
  }

  getStatementForRefund(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetStatementForRefund/${rolePlayerId}`);
  }

  bankStatementAnalysis(): Observable<StatementAnalysis[]> {
    return this.commonService.getAll<StatementAnalysis[]>(`${this.apiUrl}/BankStatementAnalysis`);
  }

  getTransactionHistoryForRefund(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetTransactionHistoryForRefund/${rolePlayerId}`);
  }

  getStatementForReversal(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetStatementForReversal/${rolePlayerId}`);
  }

  getPartiallyAndUnpaidInvoicesByPolicyId(rolePlayerPolicyId: number): Observable<Invoice[]> {
    return this.commonService.getAll<Invoice[]>(`${this.apiUrl}/GetPartiallyAndUnpaidInvoicesByPolicyId/${rolePlayerPolicyId}`);
  }

  getTotalPendingRaisedForReinstatement(rolePlayerPolicyId: number, effectiveDate: string): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetTotalPendingRaisedForReinstatement/${rolePlayerPolicyId}/${effectiveDate}`);
  }

  getTotalPendingRaisedForContinuation(rolePlayerPolicyId: number, effectiveDate: string): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetTotalPendingRaisedForReinstatement/${rolePlayerPolicyId}/${effectiveDate}`);
  }

  reverseAllocation(allocation: InvoiceAllocation): Observable<boolean> {
    const invoiceAllocationId = allocation.invoiceAllocationId;
    return this.commonService.postWithNoData<boolean>(`${this.apiUrl}/ReverseAllocation/${invoiceAllocationId}`);
  }

  getUnpaidInvoicesByRolePlayer(roleplayerId: number, isClaimRecovery: boolean): Observable<InvoicePaymentAllocation[]> {
    return this.commonService.getAll<InvoicePaymentAllocation[]>(`${this.apiUrl}/GetUnPaidInvoices/${roleplayerId}/${isClaimRecovery}`);
  }

  getPolicyInvoices(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<Invoice>> {
    return this.commonService.getAll<PagedRequestResult<Invoice>>(`${this.apiUrl}/GetPolicyInvoices/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }

  getInvoiceType(id: number): Observable<InvoiceTypeEnum> {
    return this.commonService.get<InvoiceTypeEnum>(id, `${this.apiUrl}/GetInvoiceType`);
  }

  getStatementsForInterestReversals(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetStatementsForInterestReversals/${rolePlayerId}`);
  }

  searchDebtorInvoices(roleplayerId: number, statusId: number, searchString: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<Invoice>> {
    return this.commonService.getAll<PagedRequestResult<Invoice>>(`${this.apiUrl}/SearchDebtorInvoices/${roleplayerId}/${statusId}/${searchString}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }

  GetDebtorsActiveDebitTransactions(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetDebtorsActiveDebitTransactions/${rolePlayerId}`);
  }

  GetCreditTransactionsWithBalances(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetCreditTransactionsWithBalances/${rolePlayerId}`);
  }

  searchRolePlayerInvoices(rolePlayerId: number, invoiceStatusId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Invoice>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Invoice>>(`${this.apiUrl}/SearchRolePlayerInvoices/${rolePlayerId}/${invoiceStatusId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  emailDebtorCreditNote(roleplayerId: number,  transactionIds: number[], creditNoteNumber: string, toAddress: string): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.apiUrl}/EmailDebtorCreditNote`, {  transactionIds, roleplayerId, creditNoteNumber, toAddress });
  }

  emailDebtorInvoice(roleplayerId: number, invoiceIds: number[], invoiceNumber: string, toAddress: string): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.apiUrl}/EmailDebtorInvoice`, { invoiceIds, roleplayerId, invoiceNumber, toAddress });
  }

  searchCreditNotes(query: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, showActive: boolean): Observable<CreditNoteSearchResult[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<CreditNoteSearchResult[]>(`${this.apiUrl}/SearchCreditNotes/${urlQuery}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${showActive}`);
  }
}
