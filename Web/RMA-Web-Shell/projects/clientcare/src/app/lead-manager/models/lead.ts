import { LeadSourceEnum } from 'projects/shared-models-lib/src/lib/enums/lead-source.enum';
import { ClientTypeEnum } from '../../policy-manager/shared/enums/client-type-enum';
import { LeadClientStatusEnum } from '../../policy-manager/shared/enums/leadClientStatusEnum';
import { LeadCompany } from './lead-company';
import { LeadPerson } from './lead-person';
import { LeadAddress } from './lead-address';
import { LeadContact } from './lead-contact';
import { LeadNote } from './lead-note';
import { LeadContactV2 } from './lead-contact-V2';
import { RolePlayer } from '../../policy-manager/shared/entities/roleplayer';

export class Lead {
  leadId: number;
  code: string;
  clientType: ClientTypeEnum;
  rolePlayerId: number;
  displayName: string;
  receivedDate: Date;
  leadClientStatus: LeadClientStatusEnum;
  declineReason: string;
  leadSource: LeadSourceEnum;
  assignedTo: string;

  company: LeadCompany;
  person: LeadPerson;
  addresses: LeadAddress[];
  contacts: LeadContact[];
  contactV2: LeadContactV2[];
  notes: LeadNote[];

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  isConverted: boolean;
  rolePlayer: RolePlayer;
}


