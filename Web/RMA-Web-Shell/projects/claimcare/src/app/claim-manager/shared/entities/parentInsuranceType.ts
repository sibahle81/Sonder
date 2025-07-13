import { EventTypeEnum } from '../enums/event-type-enum';

export class ParentInsuranceType {
    parentInsuranceTypeId: number;
    code: string;
    description: string;
    eventType: EventTypeEnum;
    assurerId: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}