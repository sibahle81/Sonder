import { DocumentSetEnum } from "projects/shared-models-lib/src/lib/enums/document-set.enum";
import { DocumentTypeEnum } from "projects/shared-models-lib/src/lib/enums/document-type.enum";

export class ClaimRequirementCategory {
    claimRequirementCategoryId: number;
    name: string;
    description: string;
    isManuallyAdded: boolean;
    isManuallyClosed: boolean;
    isBlockClaimChangeMacroStatus: boolean;
    isBlockClaimChangeStatus: boolean;
    isBlockClaimChangeLiabilityStatus: boolean;
    isMemberVisible: boolean;
    isOutstandingReason: boolean;
    isPersonEventRequirement: boolean;
    isAssurerVisible: boolean;
    isBlockCloseClaim: boolean;
    code: string;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    documentType: DocumentTypeEnum;
    documentSet: DocumentSetEnum;
}
