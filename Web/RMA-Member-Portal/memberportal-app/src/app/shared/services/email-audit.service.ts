import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { MailAttachment } from '../models/email-attachment.model';
import { EmailAudit } from '../models/email-audit.model';
import { SendMailRequest } from '../models/send-mail-request.model';

@Injectable({
  providedIn: 'root'
})
export class EmailAuditService {

  constructor(
    private readonly commonService: CommonService) { }

    GetClaimNotificationAudit(itemType: string, itemId: number): Observable<EmailAudit[]> {
      return this.commonService.getAll<EmailAudit[]>(`${ConstantApi.ClaimApiUrl}/GetClaimNotificationAudit/${itemType}/${itemId}`);
    }

    GetEmailAudit(itemType: string, itemId: number): Observable<EmailAudit[]> {
      return this.commonService.getAll<EmailAudit[]>(`${ConstantApi.CampaignManagerEmailApiUrl}/GetEmailAudit/${itemType}/${itemId}`);
    }

    GetMailAttachmentsByAuditId(auditId: number): Observable<MailAttachment[]> {
      return this.commonService.getAll<MailAttachment[]>(`${ConstantApi.CampaignManagerEmailApiUrl}/GetMailAttachmentsByAuditId/${auditId}`);
    }

    sendEmail(request: SendMailRequest): Observable<number> {
      return this.commonService.post<SendMailRequest>( ConstantApi.CampaignManagerSendEmailApiUrl, request);
    }
}
