import { Component, OnInit, ViewChild } from '@angular/core';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import * as XLSX from 'xlsx';
import { HttpErrorResponse } from '@angular/common/http';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-upload-external-partner-policies',
  templateUrl: './upload-external-partner-policies.component.html',
  styleUrls: ['./upload-external-partner-policies.component.css']
})
export class UploadExternalPartnerPoliciesComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  disabled = false;
  createNewPolicy = false;
  errorMessage: string[] = [];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly alertService: AlertService,
    private readonly policyService: PolicyService,
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
    this.isSubmitting$.next(true);
    // this.isUploading = true;
    this.disabled = true;
    this.uploadControlComponent.isUploading = true;
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
          let premiumListingData = fileContent.substring(index + identifier.length);
          const binaryString: string = atob(premiumListingData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', dateNF: 'FMT1' });
          /* selected the first sheet */
          var len = workbook.SheetNames.length;
          const woorksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[woorksheetName];
          const csvData = this.parseCsvFile(XLSX.utils.sheet_to_csv(worksheet));
          const data = encodeURIComponent(csvData);
          const content = { data: btoa(unescape(data)) };
          this.policyService.uploadExternalPartnerPolicyData(file.name, content).subscribe({
            next: (data: string[]) => {
              if (data.length > 0) {
                this.alertService.error(`Upload of ${file.name} failed`, 'File Upload Error');
                for (const msg of data) {
                  //this.errorMessage.push(msg);
                }
                idx++;
              } else {
                this.alertService.success(`${file.name} successfully uploaded`, 'External Data File');
                this.uploadControlComponent.delete(file);
                idx++;
                this.disabled = false;
                this.isSubmitting$.next(false);
              }
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
              }
            },
            error: (errorResponse: HttpErrorResponse) => {
              this.alertService.error('File Upload Error', 'Discount File Error');
              this.uploadControlComponent.isUploading = false;
              this.isSubmitting$.next(false);
              this.disabled = false;
            }
          });
        }
      };

      reader.readAsDataURL(file.file);
    
  
}
}

parseCsvFile(csvData: string): string {
  const identifier = 'policy_policynumber';
  const index = csvData.indexOf(identifier);
  if (index >= 0) {
    const result: string = csvData.substr(index);
    return result;
  }
  return '';
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
    if (row.length < 6) { return false; }
    // Test for the minimum data required, i.e. Member Type, First Name and Surname
    for (let i = 3; i < 6; i++) {
      console.log(row[i]);
      if (row[i] && typeof row[i] === 'string')
      {
        const value = row[i].trim();
        if (value == '') { return false; }
      }
    }

    return true;
  }

  private getUploadDocument(fileName: string, fileExtension: string, fileContent: string, policyNumber: string): Document {
    const doc = new Document();
    // doc.docTypeId = DocumentTypeEnum.PremiumListing;
    // doc.systemName = 'PolicyManager';
    // doc.fileName = fileName;
    // doc.keys = { CaseCode: policyNumber };
    // doc.documentStatus = DocumentStatusEnum.Received;
    // doc.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
    // doc.fileExtension = fileExtension;
    // doc.documentSet = DocumentSetEnum[DocumentSetEnum.PolicyDocumentsgroup];
    // doc.fileAsBase64 = fileContent;
    // doc.createdBy = this.authService.getUserEmail();
    return doc;
  }

  createPolicy(event: any): void {
    this.createNewPolicy = event.checked;
  }
}
