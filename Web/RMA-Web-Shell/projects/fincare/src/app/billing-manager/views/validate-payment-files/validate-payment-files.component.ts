import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import * as XLSX from 'xlsx';
import { BehaviorSubject } from 'rxjs';
import { PremiumListingService } from 'projects/clientcare/src/app/policy-manager/shared/Services/premium-listing.service';

@Component({
  selector: 'app-validate-payment-files',
  templateUrl: './validate-payment-files.component.html',
  styleUrls: ['./validate-payment-files.component.css']
})
export class ValidatePaymentFilesComponent implements OnInit {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  errors: any[] = [];
  fileIdentifier: string;
  form: UntypedFormGroup;
  showPeriodSearch: boolean;
  showParentAccountSearch: boolean;
  transactionSelected: boolean;
  datasource: any;
  payments: any;
  showLinkTransactionDetails: boolean;
  searchFailedMessage: string;
  debtorName: string;
  allocateToDebtorName: string;
  startDate: Date;
  endDate: Date;
  endMaxDate: Date;
  startMaxDate: Date;
  showDebtorSearch: boolean;
  showTransactionsSearch: boolean;
  canSubmit = false;
  isLoadingSubmittingAllocations$ = new BehaviorSubject(false);
  fileId = 0;
  backLink = 'fincare/billing-manager';
  isFileValidated = false;
  isValidatedOnly = false;
  validationCompleted = false;

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  constructor(
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    private datePipe: DatePipe,
    private readonly premiumListingService: PremiumListingService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id && params.id == 0) {
        this.isValidatedOnly = true;
      }
      else {
        this.isValidatedOnly = false;
      }
    });
  }

  reset() {
    this.form.get('startDate').reset();
    this.form.get('endDate').reset();
    this.form.get('transactionAmount').reset();
    this.form.get('bankAccount').reset();
    this.form.get('query').reset();

    this.showPeriodSearch = false;
    this.showParentAccountSearch = false;
    this.transactionSelected = false;
    this.datasource.data = [];
    this.payments.data = [];
    this.showLinkTransactionDetails = false;
    this.searchFailedMessage = '';
    this.allocateToDebtorName = '';
    this.debtorName = '';

    const today = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate.setDate(1);
    this.endDate = today;
    this.endMaxDate = today;
    this.endMaxDate = this.startDate;
    this.startMaxDate = today;
  }

  save(): void {
    this.uploadControlComponent.isUploading = true;
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) {
      this.uploadControlComponent.isUploading = false;
      this.toastr.errorToastr('No file selected');
      return;
    }
    this.validateFile();
  }

  validateFile() {
    const files = this.uploadControlComponent.getUploadedFiles();
    const total = files.length;
    let idx = 0;

    if (files.length === 0) {
      this.uploadControlComponent.isUploading = false;
      this.toastr.errorToastr('No file selected');
      this.isLoadingSubmittingAllocations$.next(false);
      return;
    }
    this.isLoadingSubmittingAllocations$.next(true);
    for (const file of files) {
      this.errors = [];
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        const fileContent = reader.result as string;
        const identifier = 'base64,';
        const index = fileContent.indexOf(identifier);
        if (index >= 0) {
          const premiumListingData = fileContent.substring(index + identifier.length);
          const binaryString: string = atob(premiumListingData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', dateNF: 'FMT1' });
          // Select the first sheet and read the data
          const worksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
          const csvData = this.parseCsvFile(XLSX.utils.sheet_to_csv(worksheet));
          const data = encodeURIComponent(csvData);
          const content = { data: btoa(unescape(data)) };
          this.premiumListingService.ValidatePaymentFile(content, file.name).subscribe(
            (fileId: number) => {
              this.isLoadingSubmittingAllocations$.next(false);
              this.isFileValidated = true;
              this.fileId = fileId;
              this.alertService.success('Premium payments successfully validated. No exceptions');
              this.uploadControlComponent.delete(file);
              idx++;
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
              }

            },
            (errorResponse: HttpErrorResponse) => {
              this.isLoadingSubmittingAllocations$.next(false);
              const errorMessage = errorResponse.error.Error as string;
              this.errors.push('Import errors have occurred.');
              if (errorMessage.substring(0, 10) === 'Validation') {
                const fileIdStartInndex = errorMessage.lastIndexOf('|');
                this.isFileValidated = true;
                this.fileIdentifier = errorMessage.substring(12, fileIdStartInndex);

                this.fileId = +errorMessage.substring(fileIdStartInndex + 1);
              }
              this.uploadControlComponent.isUploading = false;
            }
          );
        }
      };
      reader.readAsDataURL(file.file);
    }
  }
  
  viewExceptions() {
    this.router.navigate([`/clientcare/policy-manager/file-exceptions/${this.fileIdentifier}`]);
  }

  allocate() {
    this.router.navigate(['/clientcare/policy-manager/child-policy-allocation', this.fileId]);
  }

  cancel() {
    this.router.navigate([this.backLink]);
  }

  parseCsvFile(csvData: string): string {
    const identifier = 'company,';
    const index = csvData.toLowerCase().indexOf(identifier);
    if (index >= 0) {
      const result: string = csvData.substring(index);
      return result;
    }
    return '';
  }
}
