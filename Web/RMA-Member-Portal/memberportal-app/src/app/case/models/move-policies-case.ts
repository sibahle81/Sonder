import { Case } from "src/app/shared/models/case";
import { PolicyMovement } from "./policy-movement";


export class MovePoliciesCase extends Case {
  policyMovement: PolicyMovement;
  isReclaimingPolicies: boolean;
}
