import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class CampaignReminder extends BaseClass {
    campaignId: number;
    reminderDate: Date;
    reminderActive: boolean;
}
