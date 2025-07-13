import { ClaimRequirementCategory } from "./claim-requirement-category";

export class PersonEventClaimRequirement {
  personEventClaimRequirementId: number;
  personEventId: number;
  claimRequirementCategoryId: number;
  instruction: string;
  dateOpened: Date;
  dateClosed: Date;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  isMinimumRequirement: boolean;
  isMemberVisible: boolean;

  claimRequirementCategory: ClaimRequirementCategory;
}
