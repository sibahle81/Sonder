import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { SendSMSRequest } from '../models/send-sms-request.model';
import { SmsAudit } from '../models/sms-audit.model';

@Injectable({
  providedIn: 'root'
})
export class SmsAuditService {

  constructor(private readonly commonService: CommonService
    ) { }

    GetClaimSmsAudit(itemType: string, itemId: number): Observable<SmsAudit[]> {
      return this.commonService.getAll<SmsAudit[]>(`${ConstantApi.ClaimApiUrl}/GetClaimSmsAudit/${itemType}/${itemId}`);
    }

    GetSmsAudit(itemType: string, itemId: number): Observable<SmsAudit[]> {
      return this.commonService.getAll<SmsAudit[]>(`${ConstantApi.CampaignManagerSmsApiUrl}/GetSmsAudit/${itemType}/${itemId}`);
    }

    sendSMS(request: SendSMSRequest): Observable<number> {
      return this.commonService.post<SendSMSRequest>( ConstantApi.CampaignManagerSendSmsApiUrl, request);
    }
}
