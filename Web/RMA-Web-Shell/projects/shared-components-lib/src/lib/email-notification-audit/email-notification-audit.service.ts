import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { SendMailRequest } from 'projects/shared-models-lib/src/lib/common/send-mail-request';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/EmailAudit';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class EmailNotificationAuditService {
  private apiUrl = 'cmp/api/Email';
  private sendEmailApiUrl = 'cmp/api/SendEmail/Send';
  private ClaimCareApiUrl = 'clm/api/claim';

  constructor(
    private readonly commonService: CommonService) {
  }

  getClaimEmailAudit(itemType: string, itemId: number): Observable<EmailAudit[]> {
    return this.commonService.getAll<EmailAudit[]>(`${this.ClaimCareApiUrl}/GetClaimNotificationAudit/${itemType}/${itemId}`);
  }

  GetEmailAudit(itemType: string, itemId: number): Observable<EmailAudit[]> {
    return this.commonService.getAll<EmailAudit[]>(`${this.apiUrl}/GetEmailAudit/${itemType}/${itemId}`);
  }

  GetMailAttachmentsByAuditId(auditId: number): Observable<MailAttachment[]> {
    return this.commonService.getAll<MailAttachment[]>(`${this.apiUrl}/GetMailAttachmentsByAuditId/${auditId}`);
  }

  sendEmail(request: SendMailRequest): Observable<number> {
    return this.commonService.postGeneric<SendMailRequest, number>(this.sendEmailApiUrl, request);
  }

  GetEmailAuditAndAttachment(auditd: number): Observable<EmailAudit> {
    return this.commonService.getAll<EmailAudit>(`${this.apiUrl}/GetEmailAuditAndAttachment/${auditd}`);
  }

  GetEmailAuditByDate(itemType: string, startDate: string): Observable<EmailAudit[]> {
    const itemTypeParam = encodeURIComponent(itemType.toString());
    const startDateParam = encodeURIComponent(startDate);

    const url = `${this.apiUrl}/GetEmailAuditByDate?itemType=${itemTypeParam}&startDate=${startDateParam}`;
    return this.commonService.getAll<EmailAudit[]>(url);
  }

  getPagedEmailAudits(itemId: number, itemType: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<EmailAudit>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<EmailAudit>>(`${this.apiUrl}/GetPagedEmailAudits/${itemId}/${itemType}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  resend(emailAudit: EmailAudit): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/resend/${emailAudit.id}`);
  }

  resendEmail(emailAudit: EmailAudit): Observable<number> {
    return this.commonService.postGeneric<EmailAudit, number>(`${this.apiUrl}/resendEmail`, emailAudit);
  }

  getPagedPolicyEmailAudits(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<EmailAudit>> {
    const urlQuery = encodeURIComponent(query);
    const url = `${this.apiUrl}/GetEmailAuditForPolicy/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`;
    return this.commonService.getAll<PagedRequestResult<EmailAudit>>(url);
  }
}
