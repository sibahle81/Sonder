import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { Contact } from './contact';

export class Group extends BaseClass {
    name: string;
    description: string;
    bankAccountId: number;
    addressId: number;
    registrationNumber: string;
    contact: Contact;
}
