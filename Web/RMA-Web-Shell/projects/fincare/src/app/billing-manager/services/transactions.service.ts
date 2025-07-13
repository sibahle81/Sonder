import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Transaction } from '../models/transaction';
import { Observable } from 'rxjs';
import { TransactionTypeEnum } from '../../shared/enum/transactionTypeEnum';
import { TransactionsReversalRequest } from '../models/transactions-reversal-request';
import { Statement } from '../../shared/models/statement';
import { PendingInterestDate } from '../models/pending-interest-date';
import { BadDebtWriteOffRequest } from '../models/bad-debt-writeoff-request';
import { PremiumReinstate } from '../models/premium-reinstate';
import { InterestReinstate } from '../models/interest-reinstate';
import { BadDebtReinstateRequest } from '../models/bad-debt-reinstate-request';
import { DebtorStatusEnum } from '../../shared/enum/debtor-status.enum';
import { SearchAccountResults } from '../../shared/models/search-account-results';
import { TransactionTransfer } from '../models/transactionTransfer';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { DebtorProductCategoryBalance } from '../models/debtor-product-category-balance';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TransactionSearchRequest } from 'projects/shared-models-lib/src/lib/referrals/transaction-search-request';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private apiUrl = 'bill/api/billing/Transaction';

  constructor(private readonly commonService: CommonService) { }

  getTransactionByRoleplayerId(roleplayerId: number): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionByRoleplayerId/${roleplayerId}`);
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.commonService.get<Transaction>(id, `${this.apiUrl}`);
  }

  getTransactionByRoleplayerIdAndTransactionType(roleplayerId: number, transactionType: TransactionTypeEnum): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionByRoleplayerIdAndTransactionType/${roleplayerId}/${transactionType}`);
  }

  createPaymentTransactionReversals(request: TransactionsReversalRequest): Observable<number> {
    return this.commonService.postGeneric<TransactionsReversalRequest, number>(`${this.apiUrl}/CreatePaymentTransactionReversals`, request);
  }

  getTransactionsForTransfer(debtorNumber: string): Observable<Transaction[]> {
    const urlQuery = encodeURIComponent(debtorNumber);
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionsForTransfer/${urlQuery}`);
  }

  getCurrentPeriodDebtorBalance(roleplayerId: number): Observable<number> {
    return this.commonService.get(roleplayerId, `${this.apiUrl}/GetCurrentPeriodDebtorBalance`);
  }

  getDebtorNetBalance(roleplayerId: number): Observable<number> {
    return this.commonService.get(roleplayerId, `${this.apiUrl}/GetDebtorNetBalance`);
  }

  getTransactionsForReAllocation(roleplayerId: number, transactionType: TransactionTypeEnum): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionsForReAllocation/${roleplayerId}/${transactionType}`);
  }

  getTransactionsForReAllocationByPolicy(policyId: number, transactionType: TransactionTypeEnum): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionsForReAllocationByPolicy/${policyId}/${transactionType}`);
  }

  getTransactionsForReversal(roleplayerId: number, transactionType: TransactionTypeEnum): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionsForReversal/${roleplayerId}/${transactionType}`);
  }

  getDebitTransactionsForAllocation(roleplayerId: number, amount: number): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetDebitTransactionsForAllocation/${roleplayerId}/${amount}`);
  }

  getTransactionsForRefund(roleplayerId: number, policyIds: number[]): Observable<Transaction[]> {
    return this.commonService.postGeneric<any, Transaction[]>(`${this.apiUrl}/GetTransactionsForRefund`, { roleplayerId, policyIds });
  }

  getPaymentsForReturnAllocation(roleplayerId: number, paymentReturnAmount: number): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetPaymentsForReturnAllocation/${roleplayerId}/${paymentReturnAmount}`);
  }

  getTransactionByRoleplayerIdAndDate(roleplayerId: number, transactonTpe: TransactionTypeEnum, startDate: Date, endDate: Date): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetTransactionByRoleplayerIdAndDate/${roleplayerId}/${transactonTpe}/${startDate.toISOString()}/${endDate.toISOString()}`);
  }

  reverseDebitTransactionsForOpenPeriod(transactionIds: number[]): Observable<number> {
    return this.commonService.postGeneric<number[], number>(`${this.apiUrl}/ReverseDebitTransactionsForOpenPeriod`, transactionIds);
  }

  backDateTransactions(transactionIds: number[], backdatedDate: Date): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/BackDateTransactions`, { transactionIds, backdatedDate });
  }

  sendInterestReversalsForApproval(transactionIds: number[], note: string): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/SendInterestReversalsForApproval`, { transactionIds, note });
  }
  getTransactionsByIds(transactionIds: number[]): Observable<Transaction[]> {
    return this.commonService.postGeneric<number[], Transaction[]>(`${this.apiUrl}/GetTransactionsByIds/`, transactionIds);
  }

  interestCalculationTransactions(transactionIds: number[]): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/InterestCalculationTransactions`, { transactionIds });
  }

  downwardAdjustment(transactionId: number, adjustmentAmount: number, roleplayerId: number): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/DownwardAdjustment`, { transactionId, adjustmentAmount, roleplayerId });
  }

  upwardAdjustment(transactionId: number, adjustmentAmount: number, roleplayerId: number): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/UpwardAdjustment`, { transactionId, adjustmentAmount, roleplayerId });
  }

  openPeriodInterestAdjustment(transactionId: number, adjustmentAmount: number, roleplayerId: number, isUpwardAdjustment: boolean): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/OpenPeriodInterestAdjustment`, { transactionId, adjustmentAmount, roleplayerId, isUpwardAdjustment });
  }

  createAdhocInterestForSpecifiedDates(transactionId: number, interestDates: Date[]): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/CreateAdhocInterestForSpecifiedDates`, { transactionId, interestDates });
  }

  getDatesPendingInterest(transactionId: number): Observable<PendingInterestDate[]> {
    return this.commonService.getAll<PendingInterestDate[]>(`${this.apiUrl}/GetInvoiceMonthsPendingInterest/${transactionId}`);
  }

  getDebtorInvoiceTransactionHistory(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetDebtorInvoiceTransactionHistory/${rolePlayerId}`);
  }

  getDebtorInterestTransactionHistory(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetDebtorInterestTransactionHistory/${rolePlayerId}`);
  }

  writeOffBadDebt(badDebtWriteOffRequest: BadDebtWriteOffRequest): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/WriteOffBadDebt`, badDebtWriteOffRequest);
  }

  reinstateInterest(interestReinstatements: InterestReinstate[]): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/ReinstateInterest`, { interestReinstatements });
  }

  reinstatePremium(premiumReinstatements: PremiumReinstate[]): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/ReinstatePremium`, { premiumReinstatements });
  }

  getDebtorInvoiceTransactionHistoryByPolicy(roleplayerId: number, policyIds: number[]): Observable<Statement[]> {
    return this.commonService.postGeneric<any, Statement[]>(`${this.apiUrl}/GetDebtorInvoiceTransactionHistoryByPolicy`, { roleplayerId, policyIds });
  }

  getDebtorInterestTransactionHistoryByPolicy(roleplayerId: number, policyIds: number[]): Observable<Statement[]> {
    return this.commonService.postGeneric<any, Statement[]>(`${this.apiUrl}/GetDebtorInterestTransactionHistoryByPolicy`, { roleplayerId, policyIds });
  }

  getInvoiceTransactionsWrittenOffByPolicy(roleplayerId: number, policyIds: number[]): Observable<Statement[]> {
    return this.commonService.postGeneric<any, Statement[]>(`${this.apiUrl}/GetInvoiceTransactionsWrittenOffByPolicy`, { roleplayerId, policyIds });
  }

  getTransactionsWrittenOffByRolePlayer(roleplayerId: number, policyIds: number[]): Observable<Statement[]> {
    return this.commonService.postGeneric<any, Statement[]>(`${this.apiUrl}/GetTransactionsWrittenOffByRolePlayer`, { roleplayerId, policyIds });
  }

  getInterestTransactionsWrittenOffByPolicy(roleplayerId: number, policyIds: number[]): Observable<Statement[]> {
    return this.commonService.postGeneric<any, Statement[]>(`${this.apiUrl}/GetInterestTransactionsWrittenOffByPolicy`, { roleplayerId, policyIds });
  }

  reinstateBadDebt(badDebtReinstateRequest: BadDebtReinstateRequest): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.apiUrl}/ReinstateBadDebt`, badDebtReinstateRequest);
  }

  getDebtorInvoiceTransactionHistoryForAdhocInterest(rolePlayerId: number): Observable<Statement[]> {
    return this.commonService.getAll<Statement[]>(`${this.apiUrl}/GetDebtorInvoiceTransactionHistoryForAdhocInterest/${rolePlayerId}`);
  }

  updateDebtorStatus(roleplayerId: number, debtorStatus: DebtorStatusEnum): Observable<DebtorStatusEnum> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/UpdateDebtorStatus/${roleplayerId}`, debtorStatus);
  }

  getDebitTransactionsForAllocationByPolicies(roleplayerId: number, amount: number): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetDebitTransactionsForAllocation/${roleplayerId}/${amount}`);
  }

  getTransactionsForTransferByAccountNumber(roleplayerId: number, rmaBankAccount: string, period: PeriodStatusEnum): Observable<Transaction[]> {
    return this.commonService.postGeneric<any, Transaction[]>(`${this.apiUrl}/GetTransactionsForTransferByAccountNumber`, { roleplayerId, rmaBankAccount, period });
  }

  getDebtorsByAccountNumber(searchText: string, rmaBankAccount: string): Observable<SearchAccountResults[]> {
    return this.commonService.postGeneric<any, SearchAccountResults[]>(`${this.apiUrl}/GetDebtorsByAccountNumber`, { searchText, rmaBankAccount });
  }

  reallocateCredit(transactionTransfer: TransactionTransfer): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.apiUrl}/ReallocateCredit`, transactionTransfer);
  }

  getDebtorOpenTransactions(roleplayerId: number, transactionTypeId: number, policyIds: number[], transactionStartDate: Date, transactionEndDate: Date): Observable<Statement[]> {
    return this.commonService.postGeneric<any, Statement[]>(`${this.apiUrl}/GetDebtorOpenTransactions`, { roleplayerId, transactionTypeId, policyIds, transactionStartDate, transactionEndDate });
  }

  getHistoryDebtorBalance(roleplayerId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetHistoryDebtorBalance/${roleplayerId}`);
  }

  reallocateDebtorBalance(fromRoleplayerId: number, toRoleplayerId: number, period: PeriodStatusEnum, documentUniqueId: string, amountRealllocated: number): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.apiUrl}/ReallocateDebtorBalance`, { fromRoleplayerId, toRoleplayerId, period, documentUniqueId, amountRealllocated });
  }

  getDebtorReclassficationRefundBreakDown(roleplayerId: number): Observable<DebtorProductCategoryBalance[]> {
    return this.commonService.getAll<DebtorProductCategoryBalance[]>(`${this.apiUrl}/GetDebtorReclassficationRefundBreakDown/${roleplayerId}`);
  }

  getDebtorCreditBalance(roleplayerId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetDebtorCreditBalance/${roleplayerId}`);
  }

  getDebtorCancellationRefundBreakDown(roleplayerId: number): Observable<DebtorProductCategoryBalance[]> {
    return this.commonService.getAll<DebtorProductCategoryBalance[]>(`${this.apiUrl}/GetDebtorCancellationRefundBreakDown/${roleplayerId}`);
  }

  getDebtorClaimRecoveriesBalance(roleplayerId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetDebtorClaimRecoveriesBalance/${roleplayerId}`);
  }

  getBouncedTransactionsForTransfer(roleplayerId: number, rmaBankAccount: string, period: PeriodStatusEnum): Observable<Transaction[]> {
    return this.commonService.postGeneric<any, Transaction[]>(`${this.apiUrl}/getBouncedTransactionsForTransfer`, { roleplayerId, rmaBankAccount, period });
  }

  getPremiumAllocatedTransactionsByRoleplayer(roleplayerId: number, transactonTpe: TransactionTypeEnum, startDate: Date, endDate: Date): Observable<Transaction[]> {
    return this.commonService.getAll<Transaction[]>(`${this.apiUrl}/GetPremiumAllocatedTransactionsByRoleplayer/${roleplayerId}/${transactonTpe}/${startDate.toISOString()}/${endDate.toISOString()}`);
  }

  getPagedTransactions(transactionSearchRequest: TransactionSearchRequest): Observable<PagedRequestResult<Transaction>> {
    return this.commonService.postGeneric<TransactionSearchRequest, PagedRequestResult<Transaction>>(`${this.apiUrl}/GetPagedTransactions/`, transactionSearchRequest);
  }
}