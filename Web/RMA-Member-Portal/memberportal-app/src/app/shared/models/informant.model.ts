import { BaseClass } from "src/app/core/models/base-class.model";

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
