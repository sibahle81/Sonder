import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { CreditNoteReversal } from '../../models/credit-note-reversal';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { BehaviorSubject } from 'rxjs';
import { FinPayee } from '../../../shared/models/finpayee';
import { Transaction } from '../../models/transaction';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { TransactionsService } from '../../services/transactions.service';
import { AccountSearchResult } from '../../../shared/models/account-search-result';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { CreditNoteReversalDocumentsComponent } from '../credit-note-reversal-documents/credit-note-reversal-documents.component';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-credit-note-reversal-details',
  templateUrl: './credit-note-reversal-details.component.html',
  styleUrls: ['./credit-note-reversal-details.component.css']
})
export class CreditNoteReversalDetailsComponent extends WizardDetailBaseComponent<CreditNoteReversal> implements AfterViewInit {
  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  isLoadingCreditNotes$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild(CreditNoteReversalDocumentsComponent, { static: false }) documentsComponent: CreditNoteReversalDocumentsComponent;
  selectedDebtorAccount: FinPayee;
  selectedTransactions: Transaction[] = [];
  creditNotes: Transaction[];
  isDocuments = 0;
  creditNoteReversal: CreditNoteReversal;
  requestCode: string;
  hideDebtorAccount = false;
  submitDisabled = true;
  hideSearch: boolean;
  hideButtons: boolean;
  selectedIndex = 0;
  hideDocuments = true;
  selectedPeriodStatus: PeriodStatusEnum;

  displayedColumns = ['documentNumber', 'amount', 'date', 'action'];
  datasource = new MatTableDataSource<Transaction>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly transactionService: TransactionsService,
    private readonly wizardService: WizardService,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  onLoadLookups(): void {
  }

  createForm() {
    this.form = this.formbuilder.group({
      debtorAccount: [null],
    });

    this.disableFormControl('debtorAccount');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void { this.selectedIndex = tabChangeEvent.index; }

  nextStep() { this.selectedIndex += 1; }

  previousStep() { this.selectedIndex -= 1; }

  populateForm() {
    if (this.model) {
      this.hideSearch = true;
      this.hideButtons = true;
      this.creditNotes = this.model.transactions;
      this.requestCode = this.model.requestCode;
      this.selectedDebtorAccount = this.model.debtorAccount;
      this.selectedTransactions = this.model.transactions;
      this.hideDocuments = false;
      this.form.patchValue({
        debtorAccount: this.selectedDebtorAccount.finPayeNumber,
      });
    }
  }

  populateModel() {
    this.model.debtorAccount = this.selectedDebtorAccount;
    this.model.transactions = this.selectedTransactions;
    this.model.requestCode = this.requestCode;
    this.model.periodStatus = this.selectedPeriodStatus;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.documentsComponent.dataSource.data && this.documentsComponent.dataSource.data.length > 0 && this.documentsComponent.dataSource.data[0].id === 0) {
      validationResult.name = 'Supporting Documents';
      validationResult.errors++;
      validationResult.errorMessages.push('Supporting document for credit note reversal is required');
    }
    return validationResult;
  }

  onAccountSelected($event: AccountSearchResult) {
    if (!this.hideDebtorAccount) {
      this.selectedDebtorAccount = $event;
      if (!(this.requestCode) || this.requestCode === '') {
        this.requestCode = $event.finPayeNumber + '/' + Math.floor(Math.random() * Math.floor(9999999999));
      }

      this.getCreditNotes();

      this.form.patchValue({
        debtorAccount: this.selectedDebtorAccount.finPayeNumber
      });
    }
  }

  getCreditNotes() {
    this.hideDocuments = true;
    this.isLoadingCreditNotes$.next(true);
    this.transactionService.getTransactionsForReversal(this.selectedDebtorAccount.rolePlayerId, TransactionTypeEnum.CreditNote).subscribe(results => {
      this.creditNotes = results;
      this.datasource.data = this.creditNotes;
      this.isLoadingCreditNotes$.next(false);
      this.hideSearch = true;
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingCreditNotes$.next(false); });
  }

  transactionSelected($event: Transaction) {
    const index = this.selectedTransactions.indexOf($event);
    index > -1 ? this.selectedTransactions.splice(index, 1) : this.selectedTransactions.push($event);
    this.submitDisabled = !(this.selectedDebtorAccount !== null && this.selectedDebtorAccount !== null && this.selectedTransactions.length > 0);
  }

  reset() {
    this.creditNotes = [];
    this.selectedDebtorAccount = null;
    this.hideSearch = false;
    this.requestCode = null;
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  submit() {
    this.isSubmitting$.next(true);
    this.creditNoteReversal = new CreditNoteReversal();
    this.creditNoteReversal.debtorAccount = this.selectedDebtorAccount;
    this.creditNoteReversal.transactions = this.selectedTransactions;
    this.creditNoteReversal.requestCode = this.requestCode;
    this.creditNoteReversal.periodStatus = this.selectedPeriodStatus;

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = -1;
    startWizardRequest.type = 'credit-note-reversal';
    startWizardRequest.data = JSON.stringify(this.creditNoteReversal);
    console.log(startWizardRequest);
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      console.log(wizard);
      if (wizard) {
        this.router.navigateByUrl('fincare/billing-manager/credit-note-reversal/continue/' + wizard.id);
      } else {
        this.toastr.errorToastr('Something went wrong...Credit note reversal wizard failed to start');
        this.isSubmitting$.next(false);
      }
    });
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }
}
