import { BaseClass } from '../../core/models/base-class.model';


export class UserContact extends BaseClass {
    userContactId: number;
    cellPhoneNo?: string;
    telephoneNo?: string;
    email?: string;
}
