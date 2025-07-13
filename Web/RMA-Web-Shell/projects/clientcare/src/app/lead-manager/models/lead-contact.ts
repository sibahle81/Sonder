export class LeadContact {
  contactId: number;
  leadId: number;
  name: string;
  communicationTypeId: number;
  communicationTypeValue: string;
  isPreferred: boolean;

  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
