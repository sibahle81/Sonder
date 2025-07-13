import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';
export class UserHealthcareproviderMap {
    userHealthcareproviderMapId: number;
    userId: number;
    healthcareproviderId: number;
    roleId: number;
    userHealthcareproviderMapStatus: UserCompanyMapStatusEnum;
    userActivationId: number;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    userName: string;
    displayName: string;
    roleName: string;
}
