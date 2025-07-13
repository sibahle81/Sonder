import { Component, OnInit, ViewChild } from '@angular/core';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-upload-insured-lives',
  templateUrl: './upload-insured-lives.component.html',
  styleUrls: ['./upload-insured-lives.component.css']
})

export class UploadInsuredLivesComponent implements OnInit {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  disabled = false;

  errors: any[] = [];

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasList = false;
  currentUserObject: User;
  constructor(
    private readonly alertService: AlertService,
    private readonly policyService: PolicyService,
    private readonly authService: AuthService
  ) { }

  ngAfterViewInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    if (this.uploadControlComponent) {
      if (this.uploadControlComponent.uploadFileList.length > 0) {
        this.hasList = true;
      }
    }
  }

  ngOnInit() {
    this.subscribeUploadChanged();
  }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }

    this.uploadControlComponent.isUploading = true;
    const total = files.length;
    let idx = 0;

    for (const file of files) {
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        let premiumListingData = reader.result as string;
        const identifier = 'base64,';
        const index = premiumListingData.indexOf(identifier);
        if (index >= 0) {
          premiumListingData = premiumListingData.substr(index + identifier.length);
          const binaryString: string = atob(premiumListingData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
          /* selected the first sheet */
          const woorksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[woorksheetName];
          let csvData = XLSX.utils.sheet_to_csv(worksheet);

          csvData = this.parseCsvFile(csvData);
          const content = { data: btoa(unescape(encodeURIComponent(csvData))), fileName: file.name, userId: this.currentUserObject.id };

          this.policyService.uploadInsuredLives(content).subscribe(
            data => {
              var uploadSkipped;
              if(data.totalDelete > 0){
                uploadSkipped = `, ${data.totalDelete} skipped as no member assigned`;
              }
              this.alertService.success(`${data.totalNew} insured lives started upload from ${file.name} ${uploadSkipped}`, 'Insured Lives');
              this.uploadControlComponent.delete(file);
              idx++;
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
              }
            },
            errorResponse => {
              this.alertService.parseError(errorResponse, 'Insured Lives Listing Error');
              this.uploadControlComponent.isUploading = false;
            }
          );
        }
      };

      reader.readAsDataURL(file.file);
    }
  }

  parseCsvFile(csvData: string): string {
    const identifier = 'RMA Member Number,';
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
