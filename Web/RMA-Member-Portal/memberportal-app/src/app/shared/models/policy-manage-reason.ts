export class PolicyManageReason {
  public effectiveDate: Date;
  public reason: number;

  constructor(effectiveDate, reason) {
    this.effectiveDate = effectiveDate;
    this.reason = reason;
  }
}
