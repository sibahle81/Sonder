import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';

import { GroupRiskService } from '../../shared/Services/group-risk.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { BrokerageService } from '../../../broker-manager/services/brokerage.service';
import { RepresentativeService } from '../../../broker-manager/services/representative.service';
import { Representative } from '../../../broker-manager/models/representative';

import * as XLSX from 'xlsx';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductOption } from '../../../product-manager/models/product-option';

@Component({
  selector: 'app-upload-group-risk',
  templateUrl: './upload-group-risk.component.html',
  styleUrls: ['./upload-group-risk.component.css']
})
export class UploadGroupRiskComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  form: UntypedFormGroup;
  disabled = false;
  productOptionCode: string = "";
  schemeRolePlayerPayeeId: number = 0;
  selectedRolePlayerName: string = "";
  createNewPolicy = false;
  isLoadingBrokerages = false;
  isLoadingRepresentatives = false;
  errorMessage: string[] = [];
  brokerages: Brokerage[] = [];
  representatives: Representative[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly policyService: PolicyService,
    private readonly groupRiskService: GroupRiskService,
    private readonly productOptionService: ProductOptionService,
    private readonly documentManagementService: DocumentManagementService,
  ) { }

  ngOnInit() {
    this.subscribeUploadChanged();
    this.getLookups();
  }

  getLookups() { }

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
          let consolidatedFuneralData = fileContent.substring(index + identifier.length);
          const binaryString: string = atob(consolidatedFuneralData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', dateNF: 'FMT1' });
          // Select the first sheet and read the data
          const worksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
          const csvData = this.parseCsvFile(XLSX.utils.sheet_to_csv(worksheet));
          const data = encodeURIComponent(csvData);
          const content = { data: btoa(unescape(data)) };
          // Get the company and policy number
          const doc = this.getUploadDocument(file.name, 'application/vnd.ms-excel', fileContent, csvData);
          if (doc != null) {
            doc.createdBy = this.authService.getUserEmail();
          }  // Upload the file, and import if successful
          this.documentManagementService.UploadDocument(doc).subscribe({
            next: () => {
              this.groupRiskService.uploadGroupRisk(file.name, content, this.schemeRolePlayerPayeeId, this.productOptionCode).subscribe({
                next: (data: string[]) => {
                  if (data.length > 0) {
                    this.alertService.error(`Upload of ${file.name} failed`, 'File Upload Error');
                    for (const msg of data) {
                      this.errorMessage.push(msg);
                    }
                    idx++;
                  } else {
                    this.alertService.success(`${file.name} successfully uploaded`, 'Group Risk');
                    this.uploadControlComponent.delete(file);
                    idx++;
                  }
                  if (idx >= total) {
                    this.uploadControlComponent.isUploading = false;
                    this.disabled = false;
                  }
                },
                error: (errorResponse: HttpErrorResponse) => {
                  this.parseError(errorResponse);
                  this.uploadControlComponent.isUploading = false;
                  this.disabled = false;
                }
              });
            },
            error: (errorResponse: HttpErrorResponse) => {
              this.parseError(errorResponse);
              this.uploadControlComponent.isUploading = false;
              this.disabled = false;
            }
          });
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  private parseError(response: HttpErrorResponse): void {
    let msg = 'File Upload Error';
    if (response.error && response.error.Error) {
      msg = response.error.Error;
    } else {
      msg = response.message;
    }
    this.errorMessage.push(String.replaceAll(msg, '%20', ' '));
    this.alertService.error('File Upload Error', 'Group Risk');
  }

  getUploadDocument(fileName: string, fileExtension: string, fileContent: string, csvData: string): Document {
    const data = csvData.split('\n');
    if (data.length < 2) { return null; }
    const line = data[1].split(',');
    const policyNumber = line[1];
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
    return doc;
  }

  parseCsvFile(csvData: string): string {
    const identifier = 'Employee Industry Number,';
    const index = csvData.indexOf(identifier);
    if (index >= 0) {
      const result: string = csvData.substring(index);
      return result;
    }
    return '';
  }

  setRolePlayer($event) {
    this.productOptionCode = '';
    this.schemeRolePlayerPayeeId = $event.rolePlayerId;
    this.selectedRolePlayerName = ` (${$event.finPayee.finPayeNumber}) ${$event.displayName}`;
    // Load the policy
    this.policyService.getPoliciesByPolicyOwnerId($event.rolePlayerId).subscribe({
      next: (policies: RolePlayerPolicy[]) => {
        if (policies.length > 0) {
          const policy = policies[0];
          // Load the product option
          this.productOptionService.getProductOption(policy.productOptionId).subscribe({
            next: (productOption: ProductOption) => {
              this.productOptionCode = productOption.code;
            }
          });
        }
      }
    });
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2').replace('_', '-');
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

}