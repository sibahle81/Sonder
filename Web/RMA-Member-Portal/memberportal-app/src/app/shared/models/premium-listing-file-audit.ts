import { PremiumListingStatusEnum } from "../enums/premium-listing-status.enum";

export class PremiumListingFileAudit {
  id: number;
  fileHash: string;
  fileName: string;
  premiumListingStatus: PremiumListingStatusEnum;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  premiumListingStatusName:string;
}
