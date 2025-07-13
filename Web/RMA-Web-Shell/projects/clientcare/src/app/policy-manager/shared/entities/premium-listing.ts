import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PremiumListing extends BaseClass {
  company: string;
  fileIdentifier: string;
  version: number;
  date: Date;
  membersUploaded: boolean;
  createNewPolicies: boolean;
  groupWelcomeLetter: boolean = false;
  groupPolicySchedule: boolean = true;
  groupTermsAndConditions: boolean = false;
  memberWelcomeLetter: boolean = false;
  memberPolicySchedule: boolean = false;
  memberTermsAndConditions: boolean = false;
  policyId: number = -1;
}
