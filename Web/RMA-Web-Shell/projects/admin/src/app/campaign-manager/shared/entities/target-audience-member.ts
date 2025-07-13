import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class TargetAudienceMember extends BaseClass {
  targetAudienceId: number;
  name: string;
  contactName: string;
  email: string;
  mobileNo: string;
  phoneNo: string;
  status: string;
  policyId: number;
}
