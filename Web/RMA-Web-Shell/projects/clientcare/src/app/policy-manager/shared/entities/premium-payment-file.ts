export class PremiumPaymentFile {
  public bulkAllocationFileId: number;
  public fileIdentifier: string;
  public fileName: string;
  public isDeleted: boolean;
  public createdBy: string;
  public createdDate: Date;
  public modifiedBy: string;
  public modifiedDate: Date;
  public fileProcessingStatusId?: number;
  public fileProcessingStatus: string;
  public premiumListingFileId: number;
}
