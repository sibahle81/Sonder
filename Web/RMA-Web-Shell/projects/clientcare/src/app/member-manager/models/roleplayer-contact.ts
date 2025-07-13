import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { RolePlayerContactInformation } from './roleplayer-contact-information';

export class RolePlayerContact {
  rolePlayerContactId: number;
  rolePlayerId: number;
  title: TitleEnum;
  firstname: string;
  surname: string;
  emailAddress: string;
  telephoneNumber: string;
  contactNumber: string;
  communicationType: CommunicationTypeEnum;
  contactDesignationType: ContactDesignationTypeEnum;
  isDeleted: boolean;
  isConfirmed: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  rolePlayerContactInformations: RolePlayerContactInformation[] = [];
}

export class MemberResendEmailRequest {
  rolePlayerContacts: RolePlayerContact[] = [];
}
