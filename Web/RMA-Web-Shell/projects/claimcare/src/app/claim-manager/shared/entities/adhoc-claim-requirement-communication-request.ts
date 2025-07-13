import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';

export class AdhocClaimRequirementCommunicationRequest {
  rolePlayerContacts: RolePlayerContact[];
  requirementsHtml: string;
  requirementsCsv: string;
  personEventId: number;
  subject: string;
  displayName: string;
}
