import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CommonService } from '../../../../../shared-services-lib/src/lib/services/common/common.service';
import { TermArrangement } from '../../billing-manager/models/term-arrangement';
import { TermsArrangementNote } from '../../billing-manager/models/term-arrangement-note';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { DebtorProductBalance } from '../../billing-manager/models/debtor-product-balance';
import { EditTermArrangementSchedules } from '../../billing-manager/models/edit-term-arrangement-schedules';
import { TermsDebitOrderDetail } from '../../billing-manager/models/term-arrangement-debit-order-detail';
import { TermArrangementProductOption } from '../../billing-manager/models/term-arrangement-productoption';
import { TermScheduleRefundBreakDown } from '../../billing-manager/models/termschedule-refund-breakdown';

@Injectable({
  providedIn: 'root'
})
export class TermArrangementService {
  private apiUrl = 'bill/api/billing/termsArrangement';
  public termArrangementDetails$: BehaviorSubject<{ termArrangementId: number, balance: number, year: number, reportServerAudit: string, bankaccountId: number }> = new BehaviorSubject({ termArrangementId: 0, balance: 0, year: 0, reportServerAudit: '', bankaccountId :0 });
  constructor(
    private readonly commonService: CommonService) {
  }

  addUnsuccessfulInitiation(roleplayerId: number): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/AddUnsuccessfulInitiation`, { roleplayerId });
  }

  getTermArrangementsByRolePlayerId(roleplayerId: number): Observable<TermArrangement[]> {
    return this.commonService.getAll<TermArrangement[]>(`${this.apiUrl}/GetTermArrangementsByRolePlayerId/${roleplayerId}`);
  }

  sendMemoOfAgreement(emailAddress: string, termArrangementId: number): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/SendMemoOfAgreement`, { emailAddress, termArrangementId });
  }

  getDebtorNetBalance(roleplayerId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetDebtorNetBalance/${roleplayerId}`);
  }

  AddTermArrangementNote(arrangementNote: TermsArrangementNote): Observable<number> {
    return this.commonService.postGeneric<TermsArrangementNote, number>(`${this.apiUrl}/AddTermArrangementNote`, arrangementNote);
  }

  EditTermArrangementSechedulesCollectionFlags(editTermArrangementSchedules: EditTermArrangementSchedules): Observable<any> {
    return this.commonService.edit(editTermArrangementSchedules, `${this.apiUrl}/EditTermArrangementSechedulesCollectionFlags`);
  }

  AddTermArrangementNotes(arrangementNote: TermsArrangementNote): Observable<any> {
    return this.commonService.edit(arrangementNote, `${this.apiUrl}/AddTermArrangementNotes`);
  }

  GetAllTermNotesByTermArrangementId(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<TermsArrangementNote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<TermsArrangementNote>>(`${this.apiUrl}/GetAllTermNotesByTermArrangementId/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updateTermSignedMOAReceived(termArrangementId: number): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/updateTermSignedMOAReceived`, { termArrangementId });
  }
  
  getDebtorTermProductBalances(roleplayerId: number, termBillingCycleId: number): Observable<DebtorProductBalance[]> {
    return this.commonService.getAll<DebtorProductBalance[]>(`${this.apiUrl}/GetDebtorTermProductBalances/${roleplayerId}/${termBillingCycleId}`);
  }

  getActiveArrangementsByRoleplayer(roleplayerId: number, termBillingCycleId: number): Observable<TermArrangement[]> {
    return this.commonService.getAll<TermArrangement[]>(`${this.apiUrl}/GetActiveArrangementsByRoleplayer/${roleplayerId}/${termBillingCycleId}`);
  }
  
  getProductBalancesByPolicyIds(roleplayerId: number, termBillingCycleId: number, policyIds:number[]): Observable<DebtorProductBalance[]> {
    return this.commonService.postGeneric<any, DebtorProductBalance[]>(`${this.apiUrl}/GetProductBalancesByPolicyIds`, { roleplayerId,termBillingCycleId, policyIds});
  }
  getTermsDebitOrderDetailsByTermArrangementId(termArrangementId: number): Observable<TermsDebitOrderDetail> {
    return this.commonService.getAll<TermsDebitOrderDetail>(`${this.apiUrl}/GetTermsDebitOrderDetails/ByTermArrangementId/${termArrangementId}`);
  }

  getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId: number): Observable<TermArrangementProductOption[]> {
    return this.commonService.getAll<TermArrangementProductOption[]>(`${this.apiUrl}/GetActiveTermArrangementsProductOptionsByRolePlayerId/${roleplayerId}`);
  }

  getTermTransactionsToRefund(roleplayerId: number): Observable<TermScheduleRefundBreakDown[]> {
    return this.commonService.getAll<TermScheduleRefundBreakDown[]>(`${this.apiUrl}/GetTermScheduleRefundBreakDown/${roleplayerId}`);
  }  
}
