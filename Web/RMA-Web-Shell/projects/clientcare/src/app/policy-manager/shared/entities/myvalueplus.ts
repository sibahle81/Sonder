import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { PolicyOnboardOptionEnum } from "../enums/policy-onboard-option.enum";

export class MyValuePlus extends BaseClass {
    company: string;
    fileIdentifier: string;
    brokerageId: number;
    representativeId: number;
    date: Date;
    membersUploaded: boolean;
    policyOnboardOption: PolicyOnboardOptionEnum;
    policyNumber: string;
  }