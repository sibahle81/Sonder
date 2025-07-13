import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";

export class GroupRisk extends BaseClass {
    company: string;
    fileIdentifier: string;
    brokerageId: number;
    representativeId: number;
    date: Date;
    membersUploaded: boolean;
    productOptionId: number;
  }