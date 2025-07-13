import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Client extends BaseClass {
    parentClientId: number;
    leadClientId: number;
    bankAccountId?: number;
    addressId: number;
    industryId: number;
    industryClassId: number;
    groupId: number;
    claimBranchId: number;
    clientTypeId: number;
    name: string;
    description: string;
    registrationNumber: string;
    vatRegistrationNumber: string;
    referenceNumber: string;
    isAuthorised: boolean;
    lastName: string;
    idNumber: string;
    passportNumber: string;
    dateOfBirth: Date;
    taxNumber: string;
    designation: string;
    code: string;
    clientFullName: string;
    compensationFundNumber: string;
    businessPartnerNumber: string;
    natureOfBusinessId: number;
    employmentDate: Date;
    employeeNumber: string;
    email: string;
    terminationDate: Date;
    communicationTypeIds: number[];
}
