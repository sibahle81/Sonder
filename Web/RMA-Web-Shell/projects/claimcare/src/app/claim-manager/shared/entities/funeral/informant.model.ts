import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class InformantModel extends BaseClass {
    rolePlayerId: number;
    idNumber: string;
    passportNumber: string;
    dateOfBirth: Date;
    firstName: string;
    lastName: string;
    beneficiaryTypeId: number;
    contactNumber: string;
}
