export class ExceptionAllocation {
  public id: number;
  public bankAccountNumber: string;
  public userReference: string;
  public statementReference: string;
  public transactionDate: string; // staging TransactionDate as is from uploaded file
  public amount: string; // staging table Amount as is from uploaded file
  public status: string;
  public userReference2: string;
  public referenceType: string;
  public allocatable: string;
  public allocateTo: string;
  public bulkAllocationFileId: number;
  public error: string;
  public isDeleted: boolean;
  public lineProcessingStatusId?: number;
  public lineProcessingStatus: string;
}

