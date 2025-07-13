export class UploadRatesSummary {
  total: number;
  totalUploaded: number;
  totalSkipped: number;
  validationCount: number;
  fileIdentifier: string;
}

export class RatesUploadErrorAudit{
  id: number;
  fileIdentifier: string;
  fileName: string;
  errorCategory: string;
  errorMessage: string;
  excelRowNumber: string;
  uploadDate: Date;
}