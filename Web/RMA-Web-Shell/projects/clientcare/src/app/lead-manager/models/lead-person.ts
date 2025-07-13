export class LeadPerson {
  personId: number;
  leadId: number;
  idTypeId: number;
  idNumber: string;
  firstName: string;
  surname: string;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
