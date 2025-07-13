export class BrokerageContact  {
    id: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isDeleted: boolean;

    contactType: number;
    telephoneNumber: string;
    mobileNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    brokerageId: number;

    isLinked?: boolean;
}
