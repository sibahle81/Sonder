import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { RmaBankAccountTransaction } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccountTransaction';
import { InterestCalculation } from 'projects/fincare/src/app/billing-manager/models/interest-calculation';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Notification } from 'projects/fincare/src/app/billing-manager/models/notification';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { SearchAccountResults } from 'projects/fincare/src/app/shared/models/search-account-results';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UnallocatedBankImportPayment } from '../../models/unallocatedBankImportPayment';

@Component({
  selector: 'app-interest-calculation-list',
  templateUrl: './interest-calculation-list.component.html',
  styleUrls: ['./interest-calculation-list.component.css']
})
export class InterestCalculationListComponent implements OnInit, AfterViewInit {

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  requiredPermission = 'Interbank Transfers';
  hasPermission: boolean;

  isLoadingToAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingFromAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  rmaFromBankAccounts: RmaBankAccount[];
  rmaToBankAccounts: RmaBankAccount[];
  debtorBankAccounts: RmaBankAccount[];
  rmaBankAccountTransactions: RmaBankAccountTransaction;
  interestTransferId: number;
  interestTransfer: InterestCalculation;
  selectedFromAccountId: number;
  selectedFromAccount: RmaBankAccount;
  selectedFromTransactionId = 0;
  selectedToTransactionId = 0;
  selectedToAccountId = 0;
  selectedToAccount: RmaBankAccount;
  amountSelected = 0;
  fromAccountName: string;
  toAccountName: string;
  isValidValue = true;
  transactionsLoaded = false;
  debtorsLoaded = false;

  isLoadingDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  debtors: SearchAccountResults[];
  selectedDebtorNumber = null;
  displayedColumns = ['documentNumber', 'bankAccountNumber', 'amount', 'balance','interest','documentDate', 'bankReference', 'action'];
  displayedDebtorColumns = ['accountNumber', 'clientName', 'action'];
  datasource = new MatTableDataSource<UnallocatedBankImportPayment>();
  debtorsDatasource = new MatTableDataSource<SearchAccountResults>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly interestService: InterBankTransferService,
    private readonly wizardService: WizardService,
    private readonly invoiceService: InvoiceService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly toastr: ToastrManager) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    if (this.hasPermission) {
      this.activatedRoute.params.subscribe((params: any) => {
        this.loadLookups();
        this.createForm();
      });
    }
  }

  loadLookups() {
    this.getRmaBankAccounts();
  }

  getRmaBankAccounts() {
    this.isLoadingFromAccounts$.next(true);
    this.interestService.getRmaBankAccounts().subscribe(results => {
      this.rmaFromBankAccounts = results;
      this.isLoadingFromAccounts$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingFromAccounts$.next(false); });
  }

  getRmaBankAccountTransactions(query: string) {
    this.isLoadingTransactions$.next(true);
    this.selectedFromAccount.searchFilter = query;
    this.interestService.getRmaBankAccountTransactions(this.selectedFromAccount).subscribe(results => {
      this.rmaBankAccountTransactions = results;
      this.datasource.data = this.rmaBankAccountTransactions.transactions;
      if (this.rmaBankAccountTransactions && this.rmaBankAccountTransactions.transactions && this.rmaBankAccountTransactions.transactions.length > 0) {
        this.transactionsLoaded = true;
      }
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }

  getDebtors(query: string) {
    this.isLoadingDebtors$.next(true);
    this.invoiceService.searchDebtors(query).subscribe(results => {
      this.debtors = results;
      this.debtorsDatasource.data = this.debtors;
      if (this.debtors && this.debtors.length > 0) {
        this.debtorsLoaded = true;
      }
      this.isLoadingDebtors$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingDebtors$.next(false); });
  }

  search() {
    if (this.selectedFromAccount) {
      const query = this.form.get('query').value as string;
      if (query.length > 4) {
        this.getRmaBankAccountTransactions(query);
      }
    } else {
      this.form.get('query').setErrors({ fromAccNotChosen: true });
    }
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.debtorsDatasource.paginator = this.paginator2;
    this.datasource.sort = this.sort;
  }

  searchForDebtor() {
    if (this.selectedFromTransactionId > 0) {
      const query = this.form.get('debtorQuery').value as string;
      if (query.length > 2) {
        this.getDebtors(query);
      }
    } else {
      this.form.get('debtorQuery').setErrors({ fromTranNotChosen: true });
    }
  }

  submitInterestCalculate() {
    if (this.selectedToAccountId === 0 || this.selectedDebtorNumber === null) {
      return;
    }

    if (this.setUserCategoryValidators()) {
      this.isValidValue = false;
      return false;
    }
    this.confirmService.confirmWithoutContainer('Submit', `Please confirm interest of R ${this.amountSelected} from account ${this.selectedFromAccount.accountNumber} to account ${this.selectedToAccount.accountNumber}`, 'Center', 'Center', 'Yes', 'No').subscribe(dialogResult => {

    });
  }

  selectedFromAccountChanged($event: { value: number; }) {
    this.rmaBankAccountTransactions = null;
    this.selectedFromAccountId = $event.value;
    this.selectedFromAccount = this.rmaFromBankAccounts.find(s => s.rmaBankAccountId === this.selectedFromAccountId);
    this.rmaToBankAccounts = this.rmaFromBankAccounts.filter(s => s.rmaBankAccountId !== this.selectedFromAccountId);
  }

  selectedFromTransactionChanged(value: number, amountAllocation: number) {
    this.selectedFromTransactionId = value;
    this.amountSelected = amountAllocation;
    this.form.patchValue({
      amount: amountAllocation
    });
  }

  undoFromTransactionChanged() {
    this.selectedFromTransactionId = 0;
  }




  selectedToAccountChanged($event: { value: number; }) {
    this.selectedToAccountId = $event.value;
    this.selectedToAccount = this.debtorBankAccounts.find(s => s.rmaBankAccountId === this.selectedToAccountId);
  }

  createForm() {
    this.form = this.formbuilder.group({
      fromAccount: [null, Validators.required],
      amount: [null, Validators.required],
      toAccount: [null, Validators.required],
      query: ['', [Validators.minLength(5), Validators.required]],
      debtorQuery: ['', [Validators.minLength(3), Validators.required]],
      debtorNumber: [null, Validators.required],
    });
  }

  readForm() {
    this.interestTransfer = new InterestCalculation();
    this.interestTransfer.fromRmaBankAccountId = this.selectedFromAccountId;
    this.interestTransfer.toRmaBankAccountId = this.selectedToAccountId;
    this.interestTransfer.fromTransactionId = this.selectedFromTransactionId;
    this.interestTransfer.toTransactionId = this.selectedToTransactionId;
    this.interestTransfer.transferAmount = this.form.value.amount as number;
    this.interestTransfer.receiverDebtorNumber = this.selectedDebtorNumber;
    this.interestTransfer.fromAccountNumber = this.selectedFromAccount.accountNumber;
    this.interestTransfer.toAccountNumber = this.selectedToAccount.accountNumber;
    this.interestTransfer.fromTransactionReference = this.rmaBankAccountTransactions.transactions.find(t => t.unallocatedPaymentId === this.selectedFromTransactionId).statementReference;
  }

  setUserCategoryValidators() {
    const val = this.form.get('amount').value as number;
    if (this.amountSelected < val) {
      this.isValidValue = false;
      return true;
    }
    this.isValidValue = true;
    return false;

  }
  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators([validationToApply]);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  createNotification() {
    const interestDesctiption = `${this.interestTransfer.transferAmount} transferred from: ${this.selectedFromAccount.product}(${this.selectedFromAccount.accountNumber}) to ${this.selectedToAccount.product}(${this.selectedToAccount.accountNumber})`;
    const notification = new Notification();
    notification.title = `${interestDesctiption}`;
    notification.message = 'Interest calculation has been completed';
    notification.hasBeenReadAndUnderstood = false;
    notification.actionLink = '';

    const data = JSON.stringify(notification);

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'interest-calculatio-complete-notification';
    startWizardRequest.linkedItemId = this.selectedFromAccountId;
    startWizardRequest.data = data;

    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.toastr.successToastr('Notification sent successfully');
      this.back();
    }, error => { this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  getTransactionTypeDesc(id: number): string {
    return TransactionTypeEnum[id];
  }
}
