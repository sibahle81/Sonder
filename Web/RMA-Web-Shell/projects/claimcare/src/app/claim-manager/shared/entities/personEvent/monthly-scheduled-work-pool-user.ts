import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

export class MonthlyScheduledWorkPoolUser {
    monthlyScheduledWorkPoolUserId: number;
    workPool: WorkPoolEnum;
    startDate: Date;
    endDate: Date;
    assignedByUserId: number;
    assignedToUserId: number;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}