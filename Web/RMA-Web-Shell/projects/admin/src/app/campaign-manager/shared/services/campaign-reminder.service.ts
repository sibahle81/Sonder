import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { CampaignReminder } from '../entities/campaign-reminder';

@Injectable()
export class CampaignReminderService {

    private apiUrl = 'cmp/api/Reminder';

    constructor(
        private readonly commonService: CommonService) {
    }

    getCampaignReminder(campaignId: number): Observable<CampaignReminder> {
        return this.commonService.get<CampaignReminder>(campaignId, `${this.apiUrl}/Campaign`);
    }

    addCampaignReminder(reminder: CampaignReminder): Observable<number> {
        return this.commonService.postGeneric<CampaignReminder, number>(this.apiUrl,reminder);
    }

    editCampaignReminder(reminder: CampaignReminder): Observable<boolean> {
        return this.commonService.edit<CampaignReminder>(reminder, this.apiUrl);
    }
}
