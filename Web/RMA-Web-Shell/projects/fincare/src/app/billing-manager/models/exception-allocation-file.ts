export class ExcptionAllocationFile {
  public bulkAllocationFileId: number;
  public fileIdentifier: string;
  public fileName: string;
  public isDeleted: boolean;
  public createdBy: string;
  public createdDate: Date;
  public modifiedBy: string;
  public modifiedDate: Date;
  public totalRecords: number;
  public totalAmount: number;
  public fileProcessingStatusId?: number;
  public fileProcessingStatus: string;
}
