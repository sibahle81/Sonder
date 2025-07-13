import { SLAItemTypeEnum } from "../sla-item-type-enum";

export class SLAStatusChangeAudit {
    slaStatusChangeAuditId: number;
    slaItemType: SLAItemTypeEnum;
    itemId: number;
    status: string; 
    reason: string;
    effectiveFrom: Date; 
    effictiveTo: Date; 

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
