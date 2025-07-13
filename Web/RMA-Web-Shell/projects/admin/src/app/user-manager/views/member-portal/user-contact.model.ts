import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';


export class UserContact extends BaseClass {
    userContactId: number;
    cellPhoneNo?: string;
    telephoneNo?: string;
    email?: string;
}
