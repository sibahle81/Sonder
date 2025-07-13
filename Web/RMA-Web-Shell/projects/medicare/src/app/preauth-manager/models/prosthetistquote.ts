import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { ProstheticQuoteStatusEnum } from '../../medi-manager/enums/prosthetic-quote-status-enum';
import { ProstheticQuotationTypeEnum } from '../../medi-manager/enums/prosthetic-quotation-type-enum';
import { ProstheticTypeEnum } from '../../medi-manager/enums/prosthetic-type-enum';

export class ProsthetistQuote extends BaseClass {
  prosthetistQuoteId: number;
  rolePlayerId: number;
  prosthetistId: number | null;
  pensionCaseId: number | null;
  claimId: number;
  quotationAmount: number | null;
  comments: string;
  prostheticType: ProstheticTypeEnum;
  prosTypeSpecification: string;
  isApproved: boolean | null;
  reviewedBy: number | null;
  reviewedDateTime: string | null;
  reviewedComments: string;
  signedBy: number | null;
  isSentForReview: boolean | null;
  prostheticQuotationType: ProstheticQuotationTypeEnum | null;
  isRejected: boolean | null;
  isAutoApproved: boolean | null;
  isRequestInfo: boolean | null;
  createdBy: string;
  modifiedBy: string;
  prostheticQuoteStatus: ProstheticQuoteStatusEnum | null;
  preAuthId: number | null;
  //extra properties
  preAuthNumber: string | null;
  claimReferenceNumber: string | null;
  healthCareProviderName: string | null;
  personEventId: number | null;
  isInternalUser: boolean | null;
}