import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';

export class MedicalWorkPoolModel extends BaseClass {
    rowIndex: number;
    workPoolId: number;
    wizardId: number;
    referenceId: number;
    referenceType: string;
    referenceNumber: string;
    preAuthType: PreauthTypeEnum;
    preAuthStatus: PreAuthStatus;
    invoiceStatus: InvoiceStatusEnum;
    claimReferenceNumber: string;
    assignedToUserId: number;
    assignedToUser: string;
    assignedToRoleId: number;
    description: string;
    userId: number;
    userEmail: string;
    startDateTime: Date;
    endDateTime: Date;
    userSLA: string;
    overAllSLA: string;     
    userName: string;
    dateCreated: Date;
    nUserSLA: boolean;
    nOverAllSLA: boolean;
    lastWorkedOn: Date;
    userSLAHours: string;
    overAllSLAHours: string;
    wizardUserId: any;
    wizardURL: string;
    lastWorkedOnUserId: number;
    personEventId: number;
    lockedToUserId: number;
    lockedToUser: string;
}

export class MedicalWorkPoolsAndUsersModel extends BaseClass {
    workPoolId: number;
    workPoolName: string;
    userId: number;
    isPoolSuperUser: boolean;
    isWorkPoolActive: boolean;
    isWorkPoolDeleted: boolean;
    userName: string;
    userEmail: string;
}

export class MedicalManageUser extends BaseClass {
    rolePlayerId: any;
    startTimeOff: Date;
    endTimeOff: Date;

}

export class MedicalWorkPoolUpdateStatus {
    claimId: number;
    itemId?: number;
    status: any;
    itemType: string;
    cancellationReason?: number;
}

export class PersonEventUpdateStatus {
    claimId: number;
    itemId?: number;
    itemType: string;
    PersonEventStatus: any;
    fraudulentCase?: boolean;
    cancellationReason?: number;
}

export class MedicalWorkPoolForUser {
    id: number;
    name: string;
}
