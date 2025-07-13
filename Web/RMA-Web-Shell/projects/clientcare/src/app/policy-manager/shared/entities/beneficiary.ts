import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Beneficiary extends BaseClass {
    insuredLifeId: number;
    beneficiaryTypeId: number;
    insuredLifeName: string;
    idNumber: string;
    passportNumber: string;
    dateOfBirth: Date;
    email: string;
    telephoneNumber: string;
    mobileNumber: string;
    allocationPercentage: number;
    hasDisability: boolean;
    isInsuredLife: boolean;
    isBeneficiary: boolean;
    isStudying: boolean;
    insuredLifeProductOptionCover: number;
    name: string;
    surname: string;
}
