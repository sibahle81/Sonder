import { ContactInformationTypeEnum } from "../enums/contact-information-type-enum";

export class RolePlayerContactInformation {
    rolePlayerContactInformationId: number;
    rolePlayerContactId: number;
    contactInformationType: ContactInformationTypeEnum;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
