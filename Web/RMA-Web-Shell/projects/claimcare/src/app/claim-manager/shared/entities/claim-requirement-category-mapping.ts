import { EventTypeEnum } from "../enums/event-type-enum";
import { ClaimRequirementCategory } from "./claim-requirement-category";

export class ClaimRequirementCategoryMapping {
    claimRequirementCategoryMappingId: number;
    claimRequirementCategoryId: number;
    eventType: EventTypeEnum;
    isFatal: boolean;
    isMva: boolean;
    isTrainee: boolean;
    isAssault: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    isMinimumRequirement: boolean;

    claimRequirementCategory: ClaimRequirementCategory;
}
