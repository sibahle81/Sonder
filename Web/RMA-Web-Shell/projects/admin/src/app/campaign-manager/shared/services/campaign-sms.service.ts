import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { CampaignSms } from '../entities/campaign-sms';

@Injectable()
export class CampaignSmsService {

  private apiUrl = 'cmp/api/Sms';

  constructor(
    private readonly commonService: CommonService) {
  }

  getCampaignSms(campaignId: number): Observable<CampaignSms> {
    return this.commonService.get<CampaignSms>(campaignId, `${this.apiUrl}/Campaign`);
  }
}
