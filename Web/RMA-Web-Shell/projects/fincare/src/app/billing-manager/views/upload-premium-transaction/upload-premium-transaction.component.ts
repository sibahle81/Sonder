import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';

import * as XLSX from 'xlsx';
import { BillingService } from '../../services/billing.service';
import { PaymentStagingRecordFile } from '../../models/payment-staging-record-file';
import { Toastr, ToastrManager } from 'ng6-toastr-notifications';
import { FileUploadResponse } from '../../models/file-upload-response';

@Component({
  templateUrl: './upload-premium-transaction.component.html',
  styleUrls: ['./upload-premium-transaction.component.css']
})
export class UploadPremiumTransactionComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  disabled = false;
  createNewPolicy = false;
  errorMessage: string[] = [];
  paymentStagingRecordFile: PaymentStagingRecordFile;

  private readonly transactionSheetName: string = 'Transactions';

  constructor(
    private readonly toastrService: ToastrManager,
    private readonly importService: BillingService,
    private readonly authService: AuthService,
    private readonly documentManagementService: DocumentManagementService
  ) { }

  ngOnInit() {
    this.subscribeUploadChanged();
  }

  subscribeUploadChanged(): void {
    this.uploadControlComponent.uploadChanged.subscribe(data => {
      if (data) {
        this.errorMessage = [];
        this.disabled = false;
      }
    });
  }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }

    this.disabled = true;
    this.uploadControlComponent.isUploading = true;
    this.errorMessage = [];
    const total = files.length;
    let idx = 0;

    for (const file of files) {
      file.isLoading = true;
      const reader = new FileReader();
      
      reader.onload = (event: Event) => {
        const fileContent = <string>reader.result;
        const identifier = 'base64,';
        const index = fileContent.indexOf(identifier);
        if (index >= 0) {
          const fileData = fileContent.substring(index + identifier.length);
          const binaryString: string = atob(fileData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', dateNF: 'FMT1' });
          
          // The sheet containing the transaction details must be named "Transactions"
          let worksheet: XLSX.WorkSheet = workbook.Sheets[this.transactionSheetName];

          if (!worksheet) { // No 'Transactions' work sheet found, try the first work sheet
              worksheet = workbook.Sheets[workbook.SheetNames[0]];
          }

          if (worksheet) {
            let jsonContent = <any[][]>(XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }));
            
            if (jsonContent.length > 4) {
              let companyName = '';
              let month = '';
              let rowContent: any[][] = [];
              let summaryRows: any[][] = [];

              // CSV within XLS format
              if(jsonContent[0].length > 0 && jsonContent[0][0].indexOf(';') > -1
                  && jsonContent[1][0].indexOf(';') > -1) {
                let mainCompanyArray = jsonContent[0][0].split(';');
                let filteredCompanyArray = mainCompanyArray.filter(a => a !== '');

                companyName = filteredCompanyArray[1];
              
                let mainMonthYearArray = jsonContent[1][0].split(';');
                let filteredMonthYearArray = mainMonthYearArray.filter(a => a !== '');

                month = filteredMonthYearArray[1];
                let monthRow = this.findIndex(jsonContent, month);

                rowContent = jsonContent.slice(monthRow + 1, jsonContent.length);
                summaryRows = jsonContent.slice(monthRow + 1, jsonContent.length);
                
                let totalAmount = this.sumPaymentReceived(rowContent);
                let collectionFee = 0;
                let collectionFeeVat = 0;
                let totalAmountPaid = totalAmount;

                this.paymentStagingRecordFile = new PaymentStagingRecordFile();

                this.paymentStagingRecordFile.company = companyName;
                this.paymentStagingRecordFile.paymentMonthYear = month;
                
                this.paymentStagingRecordFile.collectionFeePercentage = collectionFeeVat;
                this.paymentStagingRecordFile.collectionFeeAmount = collectionFee;
                this.paymentStagingRecordFile.collectionFeeVatPercentage = collectionFee;
                this.paymentStagingRecordFile.collectionFeeVatAmount = collectionFeeVat;
                this.paymentStagingRecordFile.totalPayment = totalAmount;
                this.paymentStagingRecordFile.totalPaymentReceived = totalAmountPaid;
                this.paymentStagingRecordFile.fileName = file.name;
              } else { // normal Excel file
                companyName = jsonContent[0][2];
                if (companyName === '') {
                  companyName = jsonContent[0][3];
                }

                month = jsonContent[1][2];
                if (month === '') {
                  month = jsonContent[1][3];
                }

                rowContent = jsonContent.filter(r => r.every(c => c !== ""));
                summaryRows = jsonContent.slice(rowContent.length + 2, jsonContent.length);
              
                let test = this.filterNonEmptyStringArrays(summaryRows);

                let totalAmountRow = summaryRows[1];
                let collectionFeeRow = summaryRows[2];
                let collectionFeeVatRow = summaryRows[3];
                let totalAmountPaidRow = summaryRows[4];

                this.paymentStagingRecordFile = new PaymentStagingRecordFile();

                this.paymentStagingRecordFile.company = companyName;
                this.paymentStagingRecordFile.paymentMonthYear = month;
                
                this.paymentStagingRecordFile.collectionFeePercentage = collectionFeeRow[7];
                this.paymentStagingRecordFile.collectionFeeAmount = collectionFeeRow[8];
                this.paymentStagingRecordFile.collectionFeeVatPercentage = collectionFeeVatRow[7];
                this.paymentStagingRecordFile.collectionFeeVatAmount = collectionFeeVatRow[8];
                this.paymentStagingRecordFile.totalPayment = totalAmountRow[8];
                this.paymentStagingRecordFile.totalPaymentReceived = totalAmountPaidRow[8];
                this.paymentStagingRecordFile.fileName = file.name;
              }

              if (companyName !== '' && month !== '') {
                // Get the document details for upload
                const doc = this.getUploadDocument(file.name, 'application/vnd.ms-excel', fileData, month);
                // Upload the document
                this.documentManagementService.UploadDocument(doc).subscribe({
                  next: () => {
                    const fileContent = btoa(unescape(encodeURIComponent(this.parseFileContent(rowContent))));
                    const uploadData = { data: fileContent, paymentStagingRecordFile: this.paymentStagingRecordFile };

                    this.importService.importPremiumTransaction(uploadData).subscribe({
                      next: (data: FileUploadResponse) => {
                        if (!data.success) {
                          const message = `Upload of [${file.name}] failed. ${data.errorMessage}`;
                          
                          this.toastrService.errorToastr(message, 'Premium Transaction');
                          this.errorMessage.push(message);

                          idx++;
                        } else {
                          this.toastrService.infoToastr(`[${file.name}] successfully uploaded`, 'Premium Transaction');
                          this.uploadControlComponent.delete(file);

                          idx++;
                        }

                        if (idx >= total) {
                          this.uploadControlComponent.isUploading = false;
                          this.createNewPolicy = false;
                          this.disabled = false;
                        }
                      },
                      error: (errorResponse: HttpErrorResponse) => {
                        this.toastrService.errorToastr('File Upload Error ' + errorResponse.error.Error, 'Premium Transaction Error');
                        this.errorMessage.push(errorResponse.error.Error);
                        this.uploadControlComponent.isUploading = false;
                        this.createNewPolicy = false;
                        this.disabled = false;
                      }
                    });
                  },
                  error: (response: HttpErrorResponse) => {
                    this.toastrService.errorToastr(response.error, 'Premium Listing Error');
                    this.uploadControlComponent.isUploading = false;
                    this.createNewPolicy = false;
                    this.disabled = false;
                  }
                });
              } else {
                const message = 'The scheme name or scheme policy number are missing from the file';
                this.errorMessage.push(message);
                this.toastrService.errorToastr(message, 'Premium Listing Error');
              }
            } else {
              const message = `The ${this.transactionSheetName} worksheet does not contain member data.`;
              this.errorMessage.push(message);
              this.toastrService.errorToastr(message, 'Premium Listing Error');              
            }
          } else {
            const message = `The "${this.transactionSheetName}" worksheet containing the member data could not be found.`;
            this.errorMessage.push(message);
            this.toastrService.errorToastr(message, 'Premium Listing Error');              
          }
        }
      }
      
      reader.readAsDataURL(file.file);
    }
  }

  private parseFileContent(data: any[][]): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        
        // Remove newline characters, which have played havoc with the import
        if (value && typeof value === 'string') {
          row[j] = value.replaceAll('\r\n', ' ');
        }
      }
      if (this.rowContainsValues(row)) {
        result += row.join('|') + '\n';
      }
    }
    return result;
  }

  private rowContainsValues(row: string[]) {
    if (!row) { return false; }
    if (row[0].indexOf(';') > -1) { return true; }
    if (row.length < 6) { return false; }
    
    // Test for the minimum data required
    for (let i = 3; i < 6; i++) {
      if (row[i] && typeof row[i] === 'string') {
        const value = row[i].trim();
        if (value == '') { return false; }
      }
    }

    return true;
  }

  private getUploadDocument(fileName: string, fileExtension: string, fileContent: string, policyNumber: string): Document {
    const doc = new Document();
    doc.docTypeId = DocumentTypeEnum.PremiumListing;
    doc.systemName = 'BillingManager';
    doc.fileName = fileName;
    doc.keys = { CaseCode: policyNumber };
    doc.documentStatus = DocumentStatusEnum.Received;
    doc.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
    doc.fileExtension = fileExtension;
    doc.documentSet = DocumentSetEnum[DocumentSetEnum.PolicyDocumentsGroup];
    doc.fileAsBase64 = fileContent;
    doc.createdBy = this.authService.getUserEmail();
    return doc;
  }

  private filterNonEmptyStringArrays(arrayOfArrays: string[][]): string[][] {
    return arrayOfArrays.filter(innerArray => {
      // Check if the inner array itself is not empty
      if (innerArray.length === 0) {
        return false; // Exclude empty inner arrays
      }
      // Check if every string within the inner array is not empty
      return innerArray.every(str => str.trim() !== '');
    });
  }

  // Define a function named findIndex that takes a 2D array (list of lists) and a key string as input.
   findIndex(stringArray: string[][], keyString: string) {
      for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i][0].indexOf(keyString) > -1)
          return i;
      }

      // If the keyString is not found, return a -1.
      return -1;
  }

  sumPaymentReceived(stringArray: string[][]) {
    let sum = 0;
    for(let i = 0; i < stringArray.length; i++) {
      if(stringArray[i][0].lastIndexOf(';') > -1) {
        let amount = stringArray[i][0].slice(stringArray[i][0].lastIndexOf(';') + 1);
      
        sum += isNaN(+amount) ? 0 : +amount;
      }
    }

    return sum;
  }
}


