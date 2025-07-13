
export class ClaimNote {
  claimNoteId: number;
  claimId: number;
  eventId: number;
  personEventId?: number;
  text: string;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  personEventStatusId?: number;
  claimStatusId?: number;
  reason: string;
}
