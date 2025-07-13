import { EventTypeEnum } from '../enums/event-type-enum';
export class EventCause {
    eventCauseId: number;
    name: string;
    code: string;
    description: string;
    eventType: EventTypeEnum;
    isThirdPartyInvolved: boolean;
    icd10Codes: string;
    diseaseTypeId: number
    accidentTypeId: number;
    eventActionId: number;
    eventActivityId: number;
    eventAgentId: number;
    isNeedEarnings: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}