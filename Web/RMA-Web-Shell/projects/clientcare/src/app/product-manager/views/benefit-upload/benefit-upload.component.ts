import { Component, OnInit, ViewChild } from '@angular/core';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import * as XLSX from 'xlsx';
import { BenefitService } from 'projects/clientcare/src/app/product-manager/services/benefit.service';

@Component({
  selector: 'app-benefit-upload',
  templateUrl: './benefit-upload.component.html',
  styleUrls: ['./benefit-upload.component.css']
})
export class BenefitUploadComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  disabled = false;

  errors: any[] = [];

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasList = false;
  erroAuditCount = false;
  currentUserObject: User;
  constructor(
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    public benefitService: BenefitService
  ) { }

  ngAfterViewInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    if (this.uploadControlComponent) {
      if (this.uploadControlComponent.uploadFileList.length > 0) {
        this.hasList = true;
      }
    }
  }

  ngOnInit(): void {
    this.subscribeUploadChanged();
  }

  save(): void {
    this.erroAuditCount = false;
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }

    this.uploadControlComponent.isUploading = true;
    const total = files.length;
    let idx = 0;

    for (const file of files) {
          file.isLoading = true;
          const reader = new FileReader();
          reader.onload = (event: Event) => {
            let data = reader.result as string;
            const identifier = 'base64,';
            const index = data.indexOf(identifier);
            if (index >= 0) {
              data = data.substr(index + identifier.length);
              const binaryString: string = atob(data);
              const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
              /* selected the first sheet */
              const woorksheetName: string = workbook.SheetNames[0];
              const worksheet: XLSX.WorkSheet = workbook.Sheets[woorksheetName];
              let csvData = XLSX.utils.sheet_to_csv(worksheet);
    
              csvData = this.parseCsvFile(csvData);
              const content = { data: btoa(unescape(encodeURIComponent(csvData))), fileName: file.name, userId: this.currentUserObject.id };
    
              this.benefitService.UploadBenefits(content).subscribe(
                data => {
                  if(data.errorAuditCount > 0){
                    this.alertService.error(`upload failed, please see the report`, 'Upload');
                  }
                  else{
                    var skipped;
                    if(data.totalFailed > 0){
                      skipped = `, ${data.totalFailed} skipped`;
                    }
                    this.alertService.success(`${data.totalUploaded} records started uploading from ${file.name} ${skipped}`, 'Upload');
                  }
                    this.uploadControlComponent.delete(file);
                    idx++;
                    if (idx >= total) {
                      this.uploadControlComponent.isUploading = false;
                    }
                },
                errorResponse => {
                  this.alertService.parseError(errorResponse, 'Upload Benefit Listing Error');
                  this.uploadControlComponent.isUploading = false;
                }
              );
            }
          };
    
          reader.readAsDataURL(file.file);
    }

  }
  
  parseCsvFile(csvData: string): string {
    const identifier = 'Benefit Type,';
    const index = csvData.indexOf(identifier);
    if (index >= 0) {
      const result: string = csvData.substr(index);
      return result;
    }
    return '';
  }

  subscribeUploadChanged(): void {
    this.disabled = true;
    this.uploadControlComponent.uploadChanged.subscribe(
      data => {
        this.disabled = false;
      }
    );
  }

}
