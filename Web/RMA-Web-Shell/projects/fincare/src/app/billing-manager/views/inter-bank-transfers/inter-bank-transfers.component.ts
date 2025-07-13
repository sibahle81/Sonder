import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { RmaBankAccountTransaction } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccountTransaction';
import { InterBankTransfer } from 'projects/fincare/src/app/billing-manager/models/interBankTransfer';
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
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UnallocatedBankImportPayment } from '../../models/unallocatedBankImportPayment';
import { Transaction } from '../../models/transaction';
import { InterBankTransferDetail } from '../../models/inter-bank-transfer-detail';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

@Component({
  selector: 'app-inter-bank-transfers',
  templateUrl: './inter-bank-transfers.component.html',
  styleUrls: ['./inter-bank-transfers.component.css']
})
export class InterBankTransfersComponent implements OnInit, AfterViewInit {

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  requiredPermission = 'Interbank Transfers';
  hasPermission: boolean;

  isLoadingToAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingFromAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedTransactions: Transaction[] = [];
  transactions: Transaction[];
  fromDebtors: SearchAccountResults[];
  toDebtors: SearchAccountResults[];

  selectedToDebtorNumber = null;
  selectedFromDebtorNumber = null;

  rmaFromBankAccounts: RmaBankAccount[];
  rmaToBankAccounts: RmaBankAccount[];
  debtorBankAccounts: RmaBankAccount[];
  rmaBankAccountTransactions: RmaBankAccountTransaction;
  debtorstoDatasource = new MatTableDataSource<SearchAccountResults>();
  interBankTransferId: number;
  interBankTransfer: InterBankTransfer;
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
  selectedBankStatementEntryId = 0;
  fromTransactionReference = '';
  selectedBankstatemententryIds = [];
  selectedInterBankTransferDeatails = [];
  isLoadingDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  debtors: SearchAccountResults[];
  selectedDebtorNumber = null;
  displayedColumns = ['statementReference', 'bankAccountNumber', 'amount', 'transactionDate', 'billingReference', 'action'];
  displayedDebtorColumns = ['finPayeNumber', 'displayName', 'action'];
  datasource = new MatTableDataSource<UnallocatedBankImportPayment>();
  debtorsDatasource = new MatTableDataSource<SearchAccountResults>();
  periodIsValid = false;
  selectedPeriodStatus: PeriodStatusEnum;
  showPeriodControl = true;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('sort2') sort2: MatSort;
  @ViewChild('sort1') sort1: MatSort;
  @ViewChild('paginator1') paginator1: MatPaginator;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly interBankTransferService: InterBankTransferService,
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
    this.interBankTransferService.getRmaBankAccounts().subscribe(results => {
      this.rmaFromBankAccounts = results;
      this.isLoadingFromAccounts$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingFromAccounts$.next(false); });
  }

  getRmaBankAccountTransactions(query: string) {
    this.isLoadingTransactions$.next(true);
    this.selectedFromAccount.searchFilter = query;
    this.interBankTransferService.getRmaBankAccountTransactions(this.selectedFromAccount).subscribe(results => {
      this.rmaBankAccountTransactions = results;
      this.datasource.data = this.rmaBankAccountTransactions.transactions;
      if (this.rmaBankAccountTransactions && this.rmaBankAccountTransactions.transactions && this.rmaBankAccountTransactions.transactions.length > 0) {
        this.transactionsLoaded = true;
      }
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }

  getRmaBankAccountDebtor(query: string) {
    this.isLoadingTransactions$.next(true);
    this.selectedFromAccount.searchFilter = query;
    this.selectedDebtorNumber = query;
    this.interBankTransferService.getDebtorBankAccounts(this.selectedDebtorNumber).subscribe(results => {
      this.debtorBankAccounts = results;
      this.debtorstoDatasource.data = this.toDebtors;
      if (this.debtorBankAccounts.length === 0) {
        this.selectedToAccountId = 0;
      }
      this.isLoadingToAccounts$.next(false);
    },
      error => {
        this.toastr.errorToastr(error.message);
        this.isLoadingToAccounts$.next(false);
      }
    );
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
  selectedToDebtorChanged(value: string) {
    if (this.selectedFromDebtorNumber !== value) {
      this.selectedToDebtorNumber = value;
      this.form.patchValue({
        toDebtorNumber: this.selectedToDebtorNumber
      });

      this.isLoadingToAccounts$.next(true);
      this.interBankTransferService.getDebtorBankAccounts(this.selectedToDebtorNumber).subscribe(result => {
        this.debtorBankAccounts = result;
        if (this.debtorBankAccounts.length === 0) {
          this.selectedToAccountId = 0;
        }
        this.isLoadingToAccounts$.next(false);
        if (this.debtorBankAccounts.length > 0) {
        }
      }, error => { this.toastr.errorToastr(error.message); this.isLoadingToAccounts$.next(false); });
    } else {
      this.form.get('toDebtorNumber').setErrors({ identicalDebtor: true });
    }
  }

  searchDebtor() {
    if (this.selectedFromAccount) {
      const query = this.form.get('query').value as string;
      if (query.length > 4) {
        this.getRmaBankAccountDebtor(query);
      }
    } else {
      this.form.get('query').setErrors({ fromAccNotChosen: true });
    }
  }
  getToDebtors(query: string) {
    this.isLoadingDebtors$.next(true);
    this.invoiceService.searchDebtors(query).subscribe(results => {
      this.toDebtors = results;
      this.debtorsDatasource.data = this.toDebtors;
      this.isLoadingDebtors$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingDebtors$.next(false); });
  }

  getFromDebtors(query: string) {
    this.isLoadingDebtors$.next(true);
    this.invoiceService.searchDebtors(query).subscribe(results => {
      this.fromDebtors = results;
      this.debtorsDatasource.data = this.fromDebtors;
      this.isLoadingDebtors$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingDebtors$.next(false); });
  }

  searchForFromDebtor() {
    this.transactions = [];
    const query = this.form.get('fromDebtorQuery').value as string;
    if (query.length > 2) {
      this.getFromDebtors(query);
    }
  }
  undoToDebtorChanged() {
    this.selectedToDebtorNumber = null;
    this.form.get('toDebtorNumber').setErrors(null);

    this.form.patchValue({
      toDebtorNumber: this.selectedToDebtorNumber
    });
    this.selectedToAccountId = 0;
    this.debtorBankAccounts = null;
  }

  searchForToDebtor() {
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
    this.datasource.paginator = this.paginator1;
    this.debtorsDatasource.paginator = this.paginator2;
    this.datasource.sort = this.sort1;
    this.debtorsDatasource.sort = this.sort2;
  }

  searchForDebtor() {
    const query = this.form.get('debtorQuery').value as string;
    if (query.length > 2) {
      this.getDebtors(query);
    }
  }

  submitInterBankTransfer() {
    if (this.selectedToAccountId === 0 || this.selectedDebtorNumber === null) {
      return;
    }

    if (this.selectedFromAccount.accountNumber === this.selectedToAccount.accountNumber) {
      this.toastr.errorToastr('You cannot transfer to the same bank account');
      return;
    }

    if (this.setUserCategoryValidators()) {
      this.isValidValue = false;
      return false;
    }

    this.confirmService.confirmWithoutContainer('Transfer', `Please confirm transfer of R ${this.amountSelected} from account ${this.selectedFromAccount.accountNumber} to account ${this.selectedToAccount.accountNumber}`, 'Center', 'Center', 'Yes', 'No').subscribe(dialogResult => {
      if (dialogResult) {
        this.isSubmitting$.next(true);
        this.readForm();
        this.interBankTransfer.interBankTransferDetails = this.selectedInterBankTransferDeatails;
        this.interBankTransfer.periodStatus = this.selectedPeriodStatus;
        const startWizardRequest = new StartWizardRequest();
        startWizardRequest.type = 'inter-bank-transfer';
        startWizardRequest.linkedItemId = -1;
        startWizardRequest.data = JSON.stringify(this.interBankTransfer);
        this.wizardService.startWizard(startWizardRequest).subscribe(
          wizard => {
            this.toastr.successToastr('Interbank task has created successfully.', '', true);
            this.isSubmitting$ = new BehaviorSubject(false);
            if (wizard) {
              this.router.navigateByUrl(`${this.backLink}/inter-bank-transfer/continue/${wizard.id}`);
            }
            else {
              this.router.navigateByUrl('fincare/billing-manager');
            }
          }
        );
      }
    });
  }

  selectedFromAccountChanged($event: { value: number; }) {
    this.rmaBankAccountTransactions = null;
    this.selectedFromAccountId = $event.value;
    this.selectedFromAccount = this.rmaFromBankAccounts.find(s => s.rmaBankAccountId === this.selectedFromAccountId);
    this.rmaToBankAccounts = this.rmaFromBankAccounts.filter(s => s.rmaBankAccountId !== this.selectedFromAccountId);
  }

  selectedFromTransactionChanged(value: number, item: UnallocatedBankImportPayment) {
    this.selectedFromTransactionId = value;
    this.amountSelected = item.amount;
    this.selectedBankStatementEntryId = item.bankStatementEntryId;
    this.fromTransactionReference = item.statementReference;
    this.form.patchValue({
      amount: item.amount
    });
  }

  undoFromTransactionChanged() {
    this.selectedFromTransactionId = 0;
    this.selectedBankStatementEntryId = 0;
  }

  selectedDebtorChanged(value: string) {
    this.selectedDebtorNumber = value;
    this.form.patchValue({
      debtorNumber: this.selectedDebtorNumber,
      toAccount: null
    });
    this.isLoadingToAccounts$.next(true);
    this.interBankTransferService.getDebtorBankAccounts(this.selectedDebtorNumber).subscribe(
      result => {
        this.debtorBankAccounts = result;
        if (this.debtorBankAccounts.length === 0) {
          this.selectedToAccountId = 0;
        }
        this.isLoadingToAccounts$.next(false);
      },
      error => {
        this.toastr.errorToastr(error.message);
        this.isLoadingToAccounts$.next(false);
      }
    );
  }

  undoDebtorChanged() {
    this.selectedDebtorNumber = null;
    this.form.patchValue({
      debtorNumber: null,
      toAccount: null
    });
    this.selectedToAccountId = 0;
    this.debtorBankAccounts = null;
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
    this.interBankTransfer = new InterBankTransfer();
    this.interBankTransfer.fromRmaBankAccountId = this.selectedFromAccountId;
    this.interBankTransfer.toRmaBankAccountId = this.selectedToAccountId;
    this.interBankTransfer.fromTransactionId = this.selectedFromTransactionId;
    this.interBankTransfer.toTransactionId = this.selectedToTransactionId;
    this.interBankTransfer.transferAmount = this.form.value.amount as number;
    this.interBankTransfer.receiverDebtorNumber = this.selectedDebtorNumber;
    this.interBankTransfer.fromAccountNumber = this.selectedFromAccount.accountNumber;
    this.interBankTransfer.toAccountNumber = this.selectedToAccount.accountNumber;
    this.interBankTransfer.transferAmount = this.form.get('amount').value;
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
    const interbankTransferDesctiption = `${this.interBankTransfer.transferAmount} transferred from: ${this.selectedFromAccount.product}(${this.selectedFromAccount.accountNumber}) to ${this.selectedToAccount.product}(${this.selectedToAccount.accountNumber})`;
    const notification = new Notification();
    notification.title = `${interbankTransferDesctiption}`;
    notification.message = 'Interbank transfer has been completed';
    notification.hasBeenReadAndUnderstood = false;
    notification.actionLink = '';

    const data = JSON.stringify(notification);

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'inter-bank-complete-notification';
    startWizardRequest.linkedItemId = this.interBankTransferId;
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

  interbankChecked(event: any, item: UnallocatedBankImportPayment) {
    if (event.checked) {
      this.selectedBankstatemententryIds.push(item.bankStatementEntryId);
      const interbankTransferDetail = new InterBankTransferDetail();
      interbankTransferDetail.amount = item.amount;
      interbankTransferDetail.bankStatementEntryId = item.bankStatementEntryId;
      interbankTransferDetail.statementReference = item.statementReference;
      this.selectedInterBankTransferDeatails.push(interbankTransferDetail);
    }
    else
    {
      this.unTickInterbankItem(item.bankStatementEntryId);
    }
    if (this.selectedInterBankTransferDeatails && this.selectedInterBankTransferDeatails.length > 0) {
      const total = this.selectedInterBankTransferDeatails.reduce((sum, current) => sum + current.amount, 0);
      this.form.get('amount').setValue(total);
    }
  }

  unTickInterbankItem(itemId: number) {
    for (let i = 0; i < this.selectedBankstatemententryIds.length; i++) {
      if ((this.selectedBankstatemententryIds[i] === itemId)) {
        this.selectedInterBankTransferDeatails.splice(i, 1);
        const itemIndex = this.selectedInterBankTransferDeatails.findIndex(c => c.bankStatementEntryId === itemId);
        this.selectedTransactions.splice(itemIndex, 1);
        break;
      }
    }
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }

  getTransactions() {
    this.getRmaBankAccountTransactions('');
  }


  handleSortEvent(sort: Sort) {
    const source = sort.active;
    if (source === 'amount') {
      if ( sort.direction === 'asc') {  
     this.datasource.data.sort((a,b) => a.amount - b.amount)
      }
      else{
        this.datasource.data.sort((a,b) => b.amount - a.amount)
      }
    }
  }
}
