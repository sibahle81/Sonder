import { Beneficiary } from './beneficiary';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class InsuredLife extends BaseClass {
    id: number;
    policyNumber: string;
    idNumber: string;
    passportNumber: string;
    dateOfDeath: Date;
    designation: string;
    email: string;
    telephoneNumber: string;
    mobileNumber: string;
    selectedProductsIds: number[];
    productCodes: string;
    beneficiaries: Beneficiary[];
    referenceNumber: string;
    hasDisability: boolean;
    isStudying: boolean;
    beneficiaryTypeId: number;
    relationshipName: string;
    cancellationDate: Date;
    status: string;
    reason: string;
    totalCoverAmount: number;
    name: string;
    surname: string;
    dateOfBirth: string;
}
