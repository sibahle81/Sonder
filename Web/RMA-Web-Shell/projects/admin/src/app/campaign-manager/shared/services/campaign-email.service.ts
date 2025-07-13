import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { CampaignEmail } from '../entities/campaign-email';

@Injectable()
export class CampaignEmailService {

  private apiUrl = 'cmp/api/Email';

  constructor(
    private readonly commonService: CommonService) {
  }

  getCampaignEmail(campaignId: number): Observable<CampaignEmail> {
    return this.commonService.get<CampaignEmail>(campaignId, `${this.apiUrl}/Campaign`);
  }
}
