import { PolicyStatusEnum } from '../enums/policy-status.enum';
import { Policy } from './policy';

export class PolicyStatusChangeAudit {
  policyStatusChangeAuditId: number;
  policyId: number;
  policyStatus: PolicyStatusEnum;
  reason: string;
  effectiveFrom: Date;
  effectiveTo: Date;
  requestedBy: string;
  requestedDate: Date;

  policy: Policy;
  vapsPolicies: Policy[];
}
