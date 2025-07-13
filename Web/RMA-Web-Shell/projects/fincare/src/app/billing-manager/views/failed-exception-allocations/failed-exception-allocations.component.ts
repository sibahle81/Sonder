import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { CollectionsService } from '../../services/collections.service';

@Component({
  selector: 'app-failed-exception-allocations',
  templateUrl: './failed-exception-allocations.component.html',
  styleUrls: ['./failed-exception-allocations.component.css']
})
export class FailedExceptionAllocationsComponent implements OnInit {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  errors: any[] = [];
  canSubmit = false;
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
  doneUploading$ = new BehaviorSubject<boolean>(false);
  isBigFile = false;

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }
  constructor(private collectionsService: CollectionsService,
              private readonly alertService: AlertService,
              private readonly toastr: ToastrManager,
              private readonly lookupService: LookupService,
              private router: Router) { }

  ngOnInit(): void {
  }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }

    const total = files.length;
    let idx = 0;

    for (const file of files) {
      this.uploadControlComponent.isUploading = true;
      this.doneUploading$.next(false);
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
          this.collectionsService.exceptionFileAllocations(content, file.name).subscribe(
            result => {
              if (result === 1) {
                this.isBigFile = true;
              } else if (result === 2) {
                this.isBigFile = false;
              }
              this.toastr.successToastr(`Failed exception allocations uploaded from ${file.name}`);
              this.uploadControlComponent.delete(file);
              idx++;
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
                this.doneUploading$.next(true);
              }
              this.router.navigate(['fincare/billing-manager/']);
            },
            (errorResponse: HttpErrorResponse) => {
              const errorMessage = errorResponse.error.Error as string;
              if (errorMessage.substr(0, 10) === 'Validation') {
                const fileIdentifier = errorMessage.substr(12);
                this.alertService.error('Import validations failed', 'Failed Exception Allocations Error');
                this.downloadReport(fileIdentifier);
              } else {
                this.alertService.parseError(errorResponse, 'Failed Exception Allocations Error');
              }
              this.uploadControlComponent.isUploading = false;
            }
          );
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  downloadReport(fileIdentifier: string): void {
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
}
