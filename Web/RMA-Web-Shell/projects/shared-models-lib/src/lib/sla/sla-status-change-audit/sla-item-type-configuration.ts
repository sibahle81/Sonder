import { SLAItemTypeEnum } from "../sla-item-type-enum";

export class SLAItemTypeConfiguration {
    slaItemTypeConfigurationId: number;
    slaItemType: SLAItemTypeEnum; 
    numberOfDaysAmberSla: number; 
    numberOfDaysRedSla: number;
    redSlaNotificationPermission: string;
    amberSlaNotificationPermission: string;
    includeEmailNotificationAmberSla: boolean;
    includeEmailNotificationRedSla: boolean;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
