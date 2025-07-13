import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Observable } from 'rxjs';
import { CommissionAccount } from '../models/commission-account';

import { CommissionHeader } from '../models/commission-header';
import { CommissionDetail } from '../models/commission-detail';
import { CommissionPaymentRequest } from '../models/commission-payment-request';
import { CommissionStatementModel } from '../models/commission-statement-model';
import { CommissionPeriod } from '../models/commission-period';
import { CommissionAuditTrailModel } from '../models/commission-audit-trail-model';
import { ReSendStatementRequest } from '../models/resend-statement-request';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { CommissionClawBackAccount } from '../models/commission-clawback-account';
import { CommissionClawBackAccountMovement } from '../models/commission-clawback-account-movement';
import { CommissionPoolSearchParams } from '../models/commission-pool-search-params';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private apiUrl = 'fin/api/Commissions/Commission';
  dialogData: any;
  constructor(private readonly commonService: CommonService) { }

  getDialogData() {
    return this.dialogData;
  }

  searchCommissionAccounts(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CommissionAccount>> {
    const urlQuery = encodeURIComponent(query);
    return this.
      commonService.getAll<PagedRequestResult<CommissionAccount>>(`${this.apiUrl}/SearchCommissionAccounts/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getCommissions(): Observable<CommissionHeader[]> {
    return this.commonService.getAll<CommissionHeader[]>(`${this.apiUrl}/GetCommissions`);
  }

  getPendingCommissions(): Observable<CommissionHeader[]> {
    return this.commonService.getAll<CommissionHeader[]>(`${this.apiUrl}/GetPendingCommissions`);
  }
  getCommissionDetailById(detailId: number): Observable<CommissionDetail> {
    return this.commonService.getAll<CommissionDetail>(`${this.apiUrl}/GetCommissionDetailById/${detailId}`);
  }

  getCommissionsByAccount(accountTypeId: number, accountId: number, headerStatusId: number): Observable<CommissionHeader[]> {
    return this.commonService.getAll<CommissionHeader[]>(`${this.apiUrl}/GetCommissionsByAccount/${accountTypeId}/${accountId}/${headerStatusId}`);
  }

  getCommissionAccounts(): Observable<CommissionAccount[]> {
    return this.commonService.getAll<CommissionAccount[]>(`${this.apiUrl}/GetCommissionAccounts`);
  }

  getCommissionDetailByHeaderId(headerId: number): Observable<CommissionDetail[]> {
    return this.commonService.getAll<CommissionDetail[]>(`${this.apiUrl}/GetCommissionDetailByHeaderId/${headerId}`);
  }

  getCommissionsPendingRelease(): Observable<CommissionHeader[]> {
    return this.commonService.getAll<CommissionHeader[]>(`${this.apiUrl}/GetPendingCommissions`);
  }
  getCommissionsCurrentlyWithheld(): Observable<CommissionHeader[]> {
    return this.commonService.getAll<CommissionHeader[]>(`${this.apiUrl}/GetCommissionsCurrentlyWithheld`);
  }
  getCommissionsRejected(): Observable<CommissionHeader[]> {
    return this.commonService.getAll<CommissionHeader[]>(`${this.apiUrl}/GetCommissionsCurrentlyRejected`);
  }
  releaseCommissions(headers: CommissionPaymentRequest): Observable<number> {
    return this.commonService.postGeneric<CommissionPaymentRequest, number>(`${this.apiUrl}/ReleaseCommission`, headers);
  }
  getCommissionStatement(accountTypeId: number, accountId: number, periodId: number): Observable<CommissionStatementModel[]> {
    return this.commonService.getAll<CommissionStatementModel[]>(`${this.apiUrl}/GetBrokerCommissionStatement/${accountTypeId}/${accountId}/${periodId}`);
  }
  getCommissionPeriodsByAccountAndType(accountTypeId: number, accountId: number): Observable<CommissionPeriod[]> {
    return this.commonService.getAll<CommissionPeriod[]>(`${this.apiUrl}/GetCommissionPeriodsByAccountAndType/${accountTypeId}/${accountId}`);
  }
  reSubmitCommissions(headers: CommissionPaymentRequest): Observable<number> {
    return this.commonService.postGeneric<CommissionPaymentRequest, number>(`${this.apiUrl}/ReSubmitBankRejectedCommissions`, headers);
  }
  getCommissionAuditTrail(startDate: Date, endDate: Date): Observable<CommissionAuditTrailModel[]> {
    return this.commonService.getAll<CommissionAuditTrailModel[]>(`${this.apiUrl}/GetCommissionAuditTrail/${startDate.toISOString()}/${endDate.toISOString()}`);
  }
  getCommissionAuditTrailByAccountId(startDate: Date, endDate: Date, accountId: number, accountTypeId: number): Observable<CommissionAuditTrailModel[]> {
    return this.commonService.getAll<CommissionAuditTrailModel[]>(`${this.apiUrl}/GetCommissionAuditTrailByAccountId/${startDate.toISOString()}/${endDate.toISOString()}/${accountId}/${accountTypeId}`);
  }
  reSendStatement(request: ReSendStatementRequest): Observable<number> {
    return this.commonService.postGeneric<ReSendStatementRequest, number>(`${this.apiUrl}/ReSendStatement`, request);
  }
  getCommissionPeriodicCommunicationSent(accountTypeId: number, accountId: number, periodId: number): Observable<EmailAudit[]> {
    return this.commonService.getAll<EmailAudit[]>(`${this.apiUrl}/GetCommissionPeriodicCommunicationSent/${accountTypeId}/${accountId}/${periodId}`);
  }
  getCommissionPeriodsForReports(): Observable<CommissionPeriod[]> {
    return this.commonService.getAll<CommissionPeriod[]>(`${this.apiUrl}/GetCommissionPeriodsForReports`);
  }

  getCommissionAccountByAccountId(accountTypeId: number, accountId: number): Observable<CommissionAccount> {
    return this.commonService.getAll<CommissionAccount>(`${this.apiUrl}/GetCommissionAccountByAccountId/${accountTypeId}/${accountId}`);
  }

  getCommissionClawBackAccountSummary(accountTypeId: number, accountId: number): Observable<CommissionClawBackAccount> {
    return this.commonService.getByIds<CommissionClawBackAccount>(accountTypeId, accountId, `${this.apiUrl}/GetCommissionClawBackAccountSummary`);
  }

  // bringing the whole list<object> to get totals, not a good idea
  getCommissionClawBackAccountMovementsByHeaderId(headerId: number): Observable<CommissionClawBackAccountMovement[]> {
    return this.commonService.getAll<CommissionClawBackAccountMovement[]>(`${this.apiUrl}/GetCommissionClawBackAccountMovementByHeaderId/${headerId}`);
  }

  commissionPoolSearch(params: CommissionPoolSearchParams): Observable<PagedRequestResult<CommissionHeader>> {
    return this.commonService.postGeneric<CommissionPoolSearchParams, PagedRequestResult<CommissionHeader>>(`${this.apiUrl}/CommissionPoolSearch`, params);
  }

  addCommissionPeriod(commissionPeriod: CommissionPeriod): Observable<number> {
    this.dialogData = commissionPeriod;
    return this.commonService.postGeneric<CommissionPeriod, number>(this.apiUrl, commissionPeriod);
  }

  editCommissionPeriod(commissionPeriod: CommissionPeriod): Observable<boolean> {
    this.dialogData = commissionPeriod;
    return this.commonService.edit<CommissionPeriod>(commissionPeriod, this.apiUrl);
  }

  updateCommissionHeader(commissionHeader: CommissionHeader): Observable<boolean> {
    return this.commonService.edit<CommissionHeader>(commissionHeader, `${this.apiUrl}/UpdateCommissionHeader`);
  }

  getCommissionPeriodByPeriodId(periodId: number): Observable<CommissionPeriod[]> {
    return this.commonService.getAll<CommissionPeriod[]>(`${this.apiUrl}/GetCommissionPeriodByPeriodId/${periodId}`);
  }
}
