import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { PreAuthLevelOfCare } from 'projects/medicare/src/app/preauth-manager/models/preauth-levelofcare';
import { PreauthBreakdownUnderassessreason } from 'projects/medicare/src/app/preauth-manager/models/preauth-breakdown-underassessreason';
export class PreAuthorisationBreakdown extends BaseClass
{
  preAuthBreakdownId: number;
  preAuthId: number;
  medicalItemId: number;
  tariffId: number;
  treatmentCodeId: number;
  dateAuthorisedFrom: Date;
  dateAuthorisedTo: Date;
  requestedTreatments: number;
  authorisedTreatments: number;
  requestedAmount: number;
  authorisedAmount: number;
  isAuthorised: boolean;
  authorisedReason: string;
  isRejected: boolean;
  rejectedReason: string;
  reviewComments: string;
  solId: number;
  tariffAmount: number;
  isClinicalUpdate?: boolean;
  levelOfCare: PreAuthLevelOfCare[];
  tariffCode: string;
  tariffDescription: string;  
  authorisedQuantity: number;
  quantityChangedReason: string;
  updateSequenceNo?: number;
  treatmentCode: string;
  treatmentCodeDescription: string;
  preAuthBreakdownUnderAssessReasons: PreauthBreakdownUnderassessreason[];
}
