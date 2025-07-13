import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { RmaBankAccountTransaction } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccountTransaction';
import { UnallocatedBankImportPayment } from 'projects/fincare/src/app/billing-manager/models/unallocatedBankImportPayment';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { RuleRequestResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result';

import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { PremiumListingService } from '../../shared/Services/premium-listing.service';

@Component({
  selector: 'app-upload-bulk-payment-listing',
  templateUrl: './upload-bulk-payment-listing.component.html',
  styleUrls: ['./upload-bulk-payment-listing.component.css']
})
export class UploadBulkPaymentListingComponent implements OnInit, AfterViewInit {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  disabled = false;

  errors: any[] = [];

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  isLoadingBankAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  rmaBankAccounts: RmaBankAccount[];
  rmaBankAccountTransactions: RmaBankAccountTransaction;
  selectedBankAccountId: number;
  selectedBankAccount: RmaBankAccount;
  selectedUnallocatedPaymentId = 0;
  transactionAmount = 0;
  statementReference = '';
  transactionDate = '';
  displayedColumns = ['statementReference', 'bankAccountNumber', 'amount', 'transactionDate', 'billingReference', 'actions'];
  datasource = new MatTableDataSource<UnallocatedBankImportPayment>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  form: UntypedFormGroup;

  constructor(
    private readonly alertService: AlertService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly premiumListingService: PremiumListingService,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly toastr: ToastrManager,
    private readonly formbuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.loadLookups();
    this.createForm();
    this.subscribeUploadChanged();
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  loadLookups() {
    this.getRmaBankAccounts();
  }

  getRmaBankAccounts() {
    this.isLoadingBankAccounts$.next(true);
    this.interBankTransferService.getRmaBankAccounts().subscribe(results => {
      this.rmaBankAccounts = results;
      this.isLoadingBankAccounts$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingBankAccounts$.next(false); });
  }

  getRmaBankAccountTransactions(query: string) {
    this.isLoadingTransactions$.next(true);
    this.selectedBankAccount.searchFilter = query;
    this.interBankTransferService.getRmaBankAccountTransactions(this.selectedBankAccount).subscribe(results => {
      this.rmaBankAccountTransactions = results;
      this.datasource.data = this.rmaBankAccountTransactions.transactions;
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }

  search() {
    if (this.selectedBankAccount) {
      const query = this.form.get('query').value as string;
      if (query.length >= 5) {
        this.getRmaBankAccountTransactions(query);
      }
    } else {
      this.form.get('query').setErrors({ bankAccNotChosen: true });
    }
  }

  selectedTransactionChanged(row: UnallocatedBankImportPayment) {
    this.selectedUnallocatedPaymentId = row.unallocatedPaymentId;
    this.transactionAmount = row.amount;
    this.statementReference = row.statementReference;
    this.transactionDate = row.transactionDate.toString().replace('T00:00:00', '');
    this.form.patchValue({
      transactionAmount: row.amount,
      statementReference: row.statementReference,
      transactionDate: this.transactionDate
    });
  }

  undoFromTransactionChanged() {
    this.selectedUnallocatedPaymentId = 0;
    this.transactionAmount = 0;
    this.statementReference = '';
    this.transactionDate = '';
  }

  createForm() {
    this.form = this.formbuilder.group({
      bankAccount: [null, Validators.required],
      query: ['', [Validators.minLength(5), Validators.required]],
      transactionAmount: [null, Validators.required],
      statementReference: [null, Validators.required],
      transactionDate: [null, Validators.required]
    });
  }


  subscribeUploadChanged(): void {
    this.disabled = true;
    this.uploadControlComponent.uploadChanged.subscribe(
      data => {
        this.disabled = false;
      }
    );
  }

  save(): void {
    this.confirmService.confirmWithoutContainer('Confirm File Upload', `Are you sure you want to upload payments from this file?`, 'Center', 'Center', 'Yes', 'No').subscribe(dialogResult => {
      if (dialogResult) {
        const files = this.uploadControlComponent.getUploadedFiles();
        if (files.length === 0) { return; }
    
        this.uploadControlComponent.isUploading = true;
        const total = files.length;
        let idx = 0;
    
        for (const file of files) {
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
              this.premiumListingService.uploadBulkPaymentListing(this.selectedUnallocatedPaymentId, content).subscribe(
                result => {
                  this.alertService.success(`${result} payments uploaded from ${file.name}`, 'Bulk Payment Listing');
                  this.transactionAmount = 0;
                  this.statementReference = '';
                  this.transactionDate = '';
                  this.form.patchValue({
                    query: ''
                  });
                  this.datasource.data = [];
                  this.uploadControlComponent.delete(file);
                  idx++;
                  if (idx >= total) {
                    this.uploadControlComponent.isUploading = false;
                  }
                },
                (errorResponse: HttpErrorResponse) => {
                  const errorMessage = errorResponse.error.Error as string;
                  if (errorMessage.substr(0, 10) === 'Validation') {
                    const fileIdentifier = errorMessage.substr(12);
                    this.premiumListingService.getValidationErrors(fileIdentifier).subscribe(
                      (validation: RuleRequestResult) => {
                        this.errors = validation.ruleResults[0].messageList;
                        this.alertService.error('Import validations failed', 'Bulk Payment Listing Error');
                      }
                    );
                  } else {
                    this.alertService.parseError(errorResponse, 'Bulk Payment Listing Error');
                  }
                  this.uploadControlComponent.isUploading = false;
                }
              );
            }
          };
    
          reader.readAsDataURL(file.file);
        }
      } else {
        this.uploadControlComponent.clearUploadedDocs();
      }
    });
  }

  selectedBankAccountChanged($event: { value: number; }) {
    this.transactionAmount = 0;
    this.statementReference = '';
    this.transactionDate = '';
    this.rmaBankAccountTransactions = null;
    this.selectedBankAccountId = $event.value;
    this.selectedBankAccount = this.rmaBankAccounts.find(s => s.rmaBankAccountId === this.selectedBankAccountId);
  }
}
