import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { SmsAudit } from 'projects/shared-models-lib/src/lib/common/sms-audit';
import { SendSMSRequest } from 'projects/shared-models-lib/src/lib/common/send-sms-request';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class SmsAuditService {
  private apiUrl = 'cmp/api/SendSms';
  private smsAuditUrl = 'cmp/api/SmsAudit';
  private ClaimCareApiUrl = 'clm/api/claim';
  private CampaignManagerSendSmsApiUrl = 'cmp/api/SendSms/Send';

  constructor(
    private readonly commonService: CommonService) {
  }

  GetClaimSmsAudit(itemType: string, itemId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<SmsAudit>> {
    return this.commonService.getAll<PagedRequestResult<SmsAudit>>(`${this.ClaimCareApiUrl}/GetClaimSmsAudit/${itemType}/${itemId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }

  GetSmsAudit(itemType: string, itemId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<SmsAudit>> {
    return this.commonService.getAll<PagedRequestResult<SmsAudit>>(`${this.apiUrl}/GetSmsAudit/${itemType}/${itemId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
  }

  sendSMS(request: SendSMSRequest): Observable<number> {
    return this.commonService.postGeneric<SendSMSRequest, number>(this.CampaignManagerSendSmsApiUrl, request);
  }

  getPagedSmsAudits(itemType: string, itemId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<SmsAudit>> {
    const urlQuery = encodeURIComponent(query);
    const url = `${this.smsAuditUrl}/GetPagedSmsAudits/${itemType}/${itemId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${query}`;
    return this.commonService.getAll<PagedRequestResult<SmsAudit>>(url);
  }

  getPagedPolicySmsAudits(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<SmsAudit>> {
    const urlQuery = encodeURIComponent(query);
    const url = `${this.smsAuditUrl}/GetSmsAuditForPolicy/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`;
    return this.commonService.getAll<PagedRequestResult<SmsAudit>>(url);
  }
}
