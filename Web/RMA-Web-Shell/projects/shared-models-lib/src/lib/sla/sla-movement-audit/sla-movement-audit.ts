import { SLAItemTypeEnum } from "../sla-item-type-enum";

export class SLAMovementAudit {
    slaMovementAuditId: number;
    slaItemType: SLAItemTypeEnum;
    itemId: number;
    comment: string;
    assignedBy: string;
    assignedTo: string;
    effectiveFrom: Date;
    effectiveTo: Date;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
