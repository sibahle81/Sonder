import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class FuneralParlorModel extends BaseClass {
    funeralId: number;
    name: string;
    registrationNumber: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    contactNumber: string;
}
