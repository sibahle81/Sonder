import { ClientTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-type-enum';
import { LeadClientStatusEnum } from '../../policy-manager/shared/enums/leadClientStatusEnum';

export class LeadDetails {
    leadId: number;
    dateCreated: Date;
    leadStatus: LeadClientStatusEnum;
    memberName: string;
    clientType: ClientTypeEnum;
    sLA: Date;
    productsInterestedCount: number;
}


