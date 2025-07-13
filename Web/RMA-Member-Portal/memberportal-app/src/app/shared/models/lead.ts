import { RolePlayerBenefitWaitingPeriodEnum } from '../enums/roleplayer-benefit-waiting-period.enum';
import { LeadAddress } from './lead-address';
import { LeadCompany } from './lead-company';
import { LeadContact } from './lead-contact';
import { LeadNote } from './lead-note';
import { LeadPerson } from './lead-person';
import { LeadProduct } from './lead-product';
import { LeadReminder } from './lead-reminder';

export class Lead {
  leadId: number;
  code: string;
  clientTypeId: number;
  rolePlayerId: number;
  displayName: string;
  receivedDate: Date;
  leadClientStatusId: number;

  addresses: LeadAddress[] = [];
  contacts: LeadContact[] = [];
  notes: LeadNote[] = [];
  person: LeadPerson;
  company: LeadCompany;
  leadProducts: LeadProduct[] = [];
  reminders: LeadReminder[] = [];
  leadSourceId: number;
  rolePlayerBenefitWaitingPeriod: RolePlayerBenefitWaitingPeriodEnum;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  leadSLAHours: string;
  productsInterestedCount: number;
  slaCompare: boolean;
}


