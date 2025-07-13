
export class StmOverview {
  eventTypeId: number;
  personEventId: number;
  claimTypeId: number;
  insuredLifeId: number;
  personEventBucketClassId: number;
  insuranceTypeId: number;
  suspiciousTransactionStatusId: number;
  suspiciousTransactionName: string;
  isStraightThroughProcess: boolean;
  name: string;
  claimId: number;
  policyId?: number;
  createdDate: Date;
  filter: boolean;
  startDate: Date;
  endDate: Date;
}
