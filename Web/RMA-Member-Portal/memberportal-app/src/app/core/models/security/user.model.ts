import { BaseClass } from '../base-class.model';
import { Role } from './role.model';
import { AuthenticationTypeEnum } from './../../../shared/enums/authentication-type.enum';
import { PortalTypeEnum } from 'src/app/shared/enums/portal-type-enum';

export class User extends BaseClass {
    username: string;
    email: string;
    password: string;
    name: string;
    token: string;
    userTypeId: number;
    tenantId: number;
    roleId: number;
    roleName: string;
    displayName: string;
    dateViewed: Date;
    status: string;
    preferences: string;
    clientId: number;
    permissionIds: number[];
    role: Role;


    authenticationType: AuthenticationTypeEnum;
    failedAttemptCount: number | null;
    failedAttemptDate: Date;
    plainTextPassword: string;
    isApproved: boolean;
    hashAlgorithm: string;
    passwordChangeDate: Date;
    telNo: string;
    ipAddress: string;
    portalType: PortalTypeEnum;
    isInternalUser: boolean;
}
