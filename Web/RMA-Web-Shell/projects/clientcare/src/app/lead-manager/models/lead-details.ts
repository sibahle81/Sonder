import { ClientTypeEnum } from '../../policy-manager/shared/enums/client-type-enum';
import { LeadClientStatusEnum } from '../../policy-manager/shared/enums/leadClientStatusEnum';

export class LeadDetails {
    leadId: number;
    dateCreated: Date;
    leadStatus: LeadClientStatusEnum;
    memberName: string;
    clientType: ClientTypeEnum;
}


