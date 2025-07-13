import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { ClaimCancellationReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-cancellation-reason.enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';

export class WorkPoolModel extends BaseClass {
    caseId: number;
    claimUniqueReference: string;
    claimTypeId: number;
    claimStatusId: number;
    policyId: number;
    assignedToUserId: number;
    workPoolId: number;
    id: number;
    workItemId: number;
    createdDate: Date;
    policy: string;
    claim: string;
    lifeAssured: string;
    claimStatus: Date;
    userName: string;
    userSLA: string;
    overAllSLA: string;
    lastWorkedOn: Date;
    userId: number;
    startDateAndTime: Date;
    endDateAndTime: Date;
    nUserSLA: boolean;
    nOverAllSLA: boolean;
    userSLAHours: string;
    overAllSLAHours: string;
    wizardUserId: any;
    wizardURL: string;
    policyNumber: string;
    policyStatus: string;
    policyBrokerId: number;
    claimStatusDisplayName: string;
    claimStatusDisplayDescription: string;
    lastWorkedOnUserId: number;
    insuredLifeId: number;
    dateCreated: Date;
    wizardId: number;
    claimId: number;
    personEventReference: string;
    eventCreatedBy: string;
    personEventAssignedTo: number;
}

export class WorkPoolsAndUsersModel extends BaseClass {
    workPool: WorkPoolEnum;
    workPoolId: number;
    workPoolName: string;
    userId: number;
    isPoolSuperUser: boolean;
    isWorkPoolActive: boolean;
    isWorkPoolDeleted: boolean;
    userName: string;
    userEmail: string;
}

export class ManageUser extends BaseClass {
    rolePlayerId: any;
    startTimeOff: Date;
    endTimeOff: Date;

}

export class WorkPoolUpdateStatus {
    claimId: number;
    itemId?: number;
    status: any;
    itemType: string;
    cancellationReason?: ClaimCancellationReasonEnum;
}

export class PersonEventUpdateStatus {
    claimId: number;
    itemId?: number;
    itemType: string;
    PersonEventStatus: any;
    fraudulentCase?: boolean;
    cancellationReason?: ClaimCancellationReasonEnum;
}

export class ClaimEmailAction {
    claimId: number;
    personEventId: number;
    actionType: string;
}

export class WorkPoolForUser {
    id: number;
    name: string;
}
