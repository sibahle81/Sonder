import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class UndertakerModel extends BaseClass {
    funeralId: number;
    idNumber: string;
    passportNumber: string;
    dateOfBirth: Date;
    firstName: string;
    lastName: string;
    contactNumber: string;
    placeOfBurial: string;
    dateOfBurial: Date;
}
