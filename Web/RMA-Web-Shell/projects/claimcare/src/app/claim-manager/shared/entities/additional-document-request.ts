import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';

export class AdditionalDocumentRequest {
  rolePlayerContacts: RolePlayerContact[];
  note: string;
  personEventId: number;
  reason: string;
  thirdDocumentsFollowUpDayCount: number
}
