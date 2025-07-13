import { TargetAudience } from './target-audience';
import { CampaignEmail } from './campaign-email';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { CampaignSms } from './campaign-sms';

export class Campaign extends BaseClass {
    tenantId: number;
    name: string;
    description: string;
    campaignCategory: number;
    campaignType: number;
    campaignStatus: number;
    productId: number;
    owner: string;
    role: string;
    startDate: Date;
    endDate: Date;
    dateViewed: Date;
    paused: boolean;

    targetAudiences: TargetAudience[];
    campaignEmails: CampaignEmail[];
    campaignSmses: CampaignSms[];
    // Optional fields for billing campaigns
    recipient: string;
    note: string;
    weekEnding: Date;
    collectionDate: Date;
    collectionAmount: number;
    phoneNumber: string;
    emailAddress: string;
    phoneTarget: any;
    emailTarget: any;
}
