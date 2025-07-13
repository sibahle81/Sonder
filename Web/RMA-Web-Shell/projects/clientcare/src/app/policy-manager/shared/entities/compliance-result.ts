import { DebtorStatusEnum } from "projects/fincare/src/app/shared/enum/debtor-status.enum";

export class ComplianceResult {
  debtorStatus: DebtorStatusEnum;
  isBillingCompliant: boolean;
  isDeclarationCompliant: boolean;
  reasons: string[];
  isApplicable: boolean;
}

