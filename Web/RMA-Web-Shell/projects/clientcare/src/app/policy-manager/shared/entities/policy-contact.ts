import { ContactTypeEnum } from "../../../broker-manager/models/enums/contact-type.enum";

export class PolicyContact {
    policyContactId: number;
    policyId: number;
    contactType: ContactTypeEnum;
    contactName: string;
    telephoneNumber: string;
    mobileNumber: string;
    alternativeNumber:string;
    emailAddress: string;
    isDeleted: boolean = false;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}