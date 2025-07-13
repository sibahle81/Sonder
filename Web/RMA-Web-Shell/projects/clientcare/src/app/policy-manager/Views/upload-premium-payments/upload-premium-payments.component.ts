import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';

import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PremiumListingService } from './../../shared/Services/premium-listing.service';

@Component({
  selector: 'app-upload-premium-payments',
  templateUrl: './upload-premium-payments.component.html',
  styleUrls: ['./upload-premium-payments.component.css']
})
export class UploadPremiumPaymentsComponent {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  disabled = false;

  errors: any[] = [];
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  format: string;
  showReport = false;
  isDownloading = true;

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  constructor(
    private toastr: ToastrManager,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService,
    private readonly premiumListingService: PremiumListingService
  ) { }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }


    const total = files.length;
    let idx = 0;

    for (const file of files) {
      this.uploadControlComponent.isUploading = true;
      this.errors = [];
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        let data = reader.result as string;
        const identifier = 'base64,';
        const index = data.indexOf(identifier);
        if (index >= 0) {
          data = data.substr(index + identifier.length);
          const binaryString: string = atob(data);
          const content = { data: btoa(unescape(encodeURIComponent(binaryString))) };
          this.premiumListingService.uploadPayments(content, file.name).subscribe(
            result => {
              this.alertService.success(`${result} payments uploaded from ${file.name}`, 'Premium Listing');
              this.uploadControlComponent.delete(file);
              idx++;
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
              }
            },
            (errorResponse: HttpErrorResponse) => {
              this.errors.push("Import errors have occurred, please be patient while the error report downloads...");
              const errorMessage = errorResponse.error.Error as string;
              if (errorMessage.substr(0, 10) === 'Validation') {
                const fileIdentifier = errorMessage.substr(12);
                this.alertService.error('Import validations failed', 'Premium Listing Error');
                this.downloadReport(fileIdentifier);
              } else {
                this.alertService.parseError(errorResponse, 'Premium Listing Error');
              }
              this.uploadControlComponent.isUploading = false;
            }
          );
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  downloadReport(fileIdentifier: String): void {
    this.showReport = false;
    this.isDownloading = true;

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          FileIdentifier: fileIdentifier,
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/RMAPremiumPaymentErrors';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.format = 'excel';
        this.showReport = true;
      },
      error => {
        this.toastr.errorToastr(error, 'Error downloading report');
      }
    );
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }
}
