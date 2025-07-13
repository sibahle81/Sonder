import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Contact extends BaseClass  {
    branchId: number;
    departmentId: number;
    designation: string;
    name: string;
    contactTypeId: number;
    personTitleId: number;
    telephoneNumber: string;
    mobileNumber: string;
    email: string;
    serviceTypeIds: number[];
    itemId: number;
    itemType: string;
    unsubscribe: boolean;
}
