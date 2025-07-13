import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { PolicyService } from '../../shared/Services/policy.service';

import * as XLSX from 'xlsx';

@Component({
  templateUrl: './upload-premium-listing.component.html',
  styleUrls: ['./upload-premium-listing.component.css']
})
export class UploadPremiumListingComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  disabled = false;
  createNewPolicy = false;
  errorMessage: string[] = [];

  private readonly memberSheetName: string = 'Members';

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
          // The sheet containing the member details must be named "Members"
          const worksheet: XLSX.WorkSheet = workbook.Sheets[this.memberSheetName];
          
          if (worksheet) {
            let jsonContent = <any[][]>(XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }));
            if (jsonContent.length > 4) {
              // Cut the instruction and information rows
              jsonContent.splice(0, 3);
              // Validate the scheme and policy number
              const scheme = jsonContent[1][0];
              const policyNumber = jsonContent[1][1];
                            
              if (scheme !== '' && policyNumber !== '') {
                // Get the document details for upload
                const doc = this.getUploadDocument(file.name, 'application/vnd.ms-excel', fileData, policyNumber);
                // Upload the document
                this.documentManagementService.UploadDocument(doc).subscribe({
                  next: () => {
                    const fileContent = btoa(unescape(encodeURIComponent(this.parseFileContent(jsonContent))));
                    const uploadData = { data: fileContent };
                    this.policyService.uploadPremiumListing(this.createNewPolicy, file.name, uploadData).subscribe({
                      next: (data: string[]) => {
                        if (data.length > 0) {
                          this.alertService.error(`Upload of ${file.name} failed`, 'File Upload Error');
                          for (const msg of data) {
                            this.errorMessage.push(msg);
                          }
                          idx++;
                        } else {
                          this.alertService.success(`${file.name} successfully uploaded`, 'Premium Listing');
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
                        this.alertService.error('File Upload Error', 'Premium Listing Error');
                        this.errorMessage.push(errorResponse.error.Error);
                        this.uploadControlComponent.isUploading = false;
                        this.createNewPolicy = false;
                        this.disabled = false;
                      }
                    });
                  },
                  error: (response: HttpErrorResponse) => {
                  this.alertService.parseError(response, 'Premium Listing Error');
                  this.uploadControlComponent.isUploading = false;
                  this.createNewPolicy = false;
                  this.disabled = false;
                  }
                });
              } else {
                this.errorMessage.push('The scheme name or scheme policy number are missing from the file');
              }
            } else {
              this.errorMessage.push(`The ${this.memberSheetName} worksheet does not contain member data.`);
            }
          } else {
            this.errorMessage.push(`The "${this.memberSheetName}" worksheet containing the member data could not be found.`);
          }
        }
      };
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
    doc.docTypeId = DocumentTypeEnum.PremiumListing;
    doc.systemName = 'PolicyManager';
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

  createPolicy(event: any): void {
    this.createNewPolicy = event.checked;
  }
}
