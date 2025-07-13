import { BaseClass } from '../common/base-class';
import { Role } from './role';
import { PortalTypeEnum } from './../enums/portal-type-enum';
import { AuthenticationTypeEnum } from './../enums/authentication-type-enum';

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
