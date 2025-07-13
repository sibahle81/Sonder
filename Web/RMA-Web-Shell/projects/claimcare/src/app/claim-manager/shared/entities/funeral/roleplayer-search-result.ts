import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class RolePlayerSearchResult extends BaseClass {
    rolePlayerId: number;
    firstName: string;
    surname: string;
    dateOfBirth: Date;
    idNumber: string;
    isAlive: boolean;
    dateOfDeath: Date;
    deathCertificateNumber: string;
    isVopdVerified: boolean;
    isStudying: boolean;
    isDisabled: boolean;
    cellNumber: string;
    emailAddress: string;
    preferredCommunicationType: string;
    relation: string;
    policyId: number;
    rolePlayerTypeId: number;
    communicationTypeId: number;
    policyNumber: string;
    industryNumber: string;
    employeeNumber: string;
    claimId: number;
    claimantId: number;
    insuredLifeId: number;
    claimReferenceNumber: string;
    hasClaim: boolean;
    hasClaimStr: boolean;
    policyStatus: string;
    policyCancelReason: string;

}
