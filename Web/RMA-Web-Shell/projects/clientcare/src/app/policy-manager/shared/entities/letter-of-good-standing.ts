export class LetterOfGoodStanding {
  letterOfGoodStandingId: number;
  rolePlayerId: number;
  issueDate: Date;
  expiryDate: Date;
  certificateNo: string;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  // properties not in database
  memberName: string;
  memberEmail: string;
  policyId: number;
}
