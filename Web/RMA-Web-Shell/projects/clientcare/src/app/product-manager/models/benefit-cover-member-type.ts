import { CoverMemberTypeEnum } from "projects/shared-models-lib/src/lib/enums/cover-member-type-enum";

export class BenefitCoverMemberType {

  benefitCoverMemberTypeId: number;
  startDate: Date;
  endDate: Date;
  coverMemberType: CoverMemberTypeEnum;
  benefitId: number;

  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
}