import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { SearchAccountResults } from 'projects/fincare/src/app/shared/models/search-account-results';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { InterDebtorTransfer } from 'projects/fincare/src/app/billing-manager/models/interDebtorTransfer';
import { AllocationProgressionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/allocation-progression-status-enum';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { InterDebtorTransferService } from 'projects/fincare/src/app/billing-manager/services/interdebtortransfer.service';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { TransactionType } from '../../models/transactiontype';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';


@Component({
  selector: 'app-inter-debtor-transfers-capture',
  templateUrl: './inter-debtor-transfers-capture.component.html',
  styleUrls: ['./inter-debtor-transfers-capture.component.css']
})
export class InterDebtorTransfersCaptureComponent implements OnInit, AfterViewInit {

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  requiredPermission = 'Interdebtor Transfers';
  hasPermission: boolean;

  isLoadingToAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  rmaToBankAccounts: RmaBankAccount[];
  debtorBankAccounts: RmaBankAccount[];
  interDebtorTransferId: number;
  interDebtorTransfer: InterDebtorTransfer;
  selectedFromAccountId = 0;
  selectedToAccount: RmaBankAccount;
  transferAmount = 0;

  isLoadingToDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingFromDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  fromDebtors: SearchAccountResults[];
  toDebtors: SearchAccountResults[];
  selectedToDebtorNumber = null;
  selectedFromDebtorNumber = null;

  industryClassesAreIdentical = false;

  selectedTransactions: Transaction[] = [];
  transactions: Transaction[];
  hideButtons = false;
  showOwnAmount: boolean;
  message: string;
  allocatableAmount: number;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  fromDebtorsloaded: false
  fromRoleplayerId = 0;
  toRoleplayerId: number;
  documentKeyValue: string;
  transactionTypes = [new TransactionType(TransactionTypeEnum.Payment, 'Payments & Credit Notes')
    , new TransactionType(TransactionTypeEnum.PaymentReversal, 'Unmet/Bounced/Reversal')];
  selectedTransactionTypeId = 0;

  displayedFromDebtorColumns = ['finPayeNumber', 'displayName', 'action'];
  displayedColumns = ['transactionType', 'rmaReference', 'amount', 'balance', 'transferAmount', 'transactionDate', 'action'];
  displayedDebtorColumns = ['finPayeNumber', 'displayName', 'rmaBankAccountNumber', 'action'];
  datasource = new MatTableDataSource<Transaction>();
  debtorsDatasource = new MatTableDataSource<SearchAccountResults>();
  debtorstoDatasource = new MatTableDataSource<SearchAccountResults>();
  @ViewChild('paginator0') paginator: MatPaginator;
  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;

  @ViewChild('sort1') sort1: MatSort;
  @ViewChild('sort2') sort2: MatSort;
  @ViewChild('sort0') sort: MatSort;
  interdebtorDocSet = DocumentSetEnum.InterdebtorTransfer;
  messageToDebtor = '';
  fromDebtorSelected = false;
  toDebtorSelected = false;
  transactionsSelected = false;
  selectedAccountNumber = '';
  bankAccountsMatch = false;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  requiredDocumentsUploaded = false;
  canSubmit = false;
  tranfertypeSelected = false;
  isReversalTransfertype = false;

  constructor(
    public readonly router: Router,
    public readonly formbuilder: UntypedFormBuilder,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly interDebtorTransferService: InterDebtorTransferService,
    private readonly wizardService: WizardService,
    private readonly invoiceService: InvoiceService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly datePipe: DatePipe,
    private readonly dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly toastr: ToastrManager,
    private readonly transactionService: TransactionsService) {
  }

  ngOnInit(): void {
    this.createForm();
    this.documentKeyValue = this.generateUUID();
  }

  ngAfterViewInit() {
    this.debtorsDatasource.paginator = this.paginator;
    this.debtorsDatasource.sort = this.sort;
    this.datasource.paginator = this.paginator1;
    this.datasource.sort = this.sort1;
    this.debtorstoDatasource.paginator = this.paginator2;
    this.debtorstoDatasource.sort = this.sort2;
  }

  getToDebtors(query: string) {
    this.messageToDebtor = '';
    this.isLoadingToDebtors$.next(true);
    this.transactionService.getDebtorsByAccountNumber(query, this.selectedAccountNumber).subscribe(results => {
      if (results && results.length > 0) {
        this.toDebtors = results;
        this.debtorstoDatasource.data = this.toDebtors;
      }
      else {
        this.messageToDebtor = `No debtor matching bankaccount ${this.selectedAccountNumber} with provided debtor/policy number`
      }
      this.isLoadingToDebtors$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingToDebtors$.next(false); });
  }

  getFromDebtors(query: string) {
    this.isLoadingFromDebtors$.next(true);
    this.invoiceService.searchDebtors(query).subscribe(results => {
      this.fromDebtors = results;
      this.debtorsDatasource.data = this.fromDebtors;
      this.isLoadingFromDebtors$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingFromDebtors$.next(false); });
  }

  searchForFromDebtor() {
    this.transactions = [];
    const query = this.form.get('fromDebtorQuery').value as string;
    if (query.length > 2) {
      this.getFromDebtors(query);
    }
  }

  searchForToDebtor() {
    const query = this.form.get('toDebtorQuery').value as string;
    if (query.length > 2) {
      this.getToDebtors(query);
    }
  }

  submitInterDebtorTransfer() {
    if (this.selectedFromAccountId === 0 || this.selectedToDebtorNumber === null) {
      return;
    }

    this.confirmService.confirmWithoutContainer('Transfer', `Please confirm transfer of R ${this.transferAmount} to debtor number ${this.selectedToDebtorNumber}`, 'Center', 'Center', 'Yes', 'No').subscribe(dialogResult => {
      if (dialogResult) {
        this.isSubmitting$.next(true);
        this.readInterDebtorTransferForm();
        if (this.interDebtorTransfer.transactions.length <= 0) {
          return;
        }
        this.interDebtorTransferService.submitInterDebtorTransfer(this.interDebtorTransfer).subscribe(result => {
          this.interDebtorTransfer = result;
          this.toastr.successToastr('Transfer Submitted Successfully');
          if (this.interDebtorTransfer.receiverHasInvoicesOutstanding) {
            this.router.navigate(['fincare/billing-manager']);
          } else {
            this.back();
          }
        }, error => { this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
      }
    });
  }

  selectedToDebtorChanged(value: string, toBankAccount: string) {
    this.bankAccountsMatch = false;
    if (this.selectedFromDebtorNumber !== value) {
      this.selectedToDebtorNumber = value;
      this.form.patchValue({
        toDebtorNumber: this.selectedToDebtorNumber
      });
    }
    if (this.selectedAccountNumber === toBankAccount) {
      this.bankAccountsMatch = true;
    }
    this.toDebtorSelected = true;

    if (this.bankAccountsMatch && this.requiredDocumentsUploaded) {
      this.canSubmit = true;
    }
    else {
      this.canSubmit = false;
    }
  }

  selectedFromDebtorChanged(value: string, rolePlayerId: number) {
    this.fromRoleplayerId = rolePlayerId;
    this.selectedFromDebtorNumber = value;
    this.transferAmount = 0;
    this.form.patchValue({
      transferAmount: this.transferAmount
    });
    this.form.patchValue({
      fromDebtorNumber: this.selectedFromDebtorNumber
    });
    this.isLoadingToAccounts$.next(true);
    this.fromDebtorSelected = true;
    this.interBankTransferService.getDebtorBankAccounts(this.selectedFromDebtorNumber).subscribe(result => {
      this.debtorBankAccounts = result;
      if (this.debtorBankAccounts.length === 0) {
        this.selectedFromAccountId = 0;
      }
      this.isLoadingToAccounts$.next(false);
      if (this.debtorBankAccounts.length > 0) {
      }
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingToAccounts$.next(false); });
  }

  undoToDebtorChanged() {
    this.selectedToDebtorNumber = null;
    this.form.get('toDebtorNumber').setErrors(null);

    this.form.patchValue({
      toDebtorNumber: this.selectedToDebtorNumber
    });
    this.selectedFromAccountId = 0;
    this.debtorBankAccounts = null;
  }

  undoFromDebtorChanged() {
    this.selectedFromDebtorNumber = null;
    this.form.patchValue({
      fromDebtorNumber: this.selectedFromDebtorNumber
    });
    this.transactions = [];
  }

  selectedFromAccountChanged($event: { value: number; }) {
    if (this.fromRoleplayerId > 0) {
      this.selectedFromAccountId = $event.value;
      const selectedAccountNumber = this.debtorBankAccounts.find(s => s.rmaBankAccountId === this.selectedFromAccountId).accountNumber;
      this.selectedAccountNumber = selectedAccountNumber;
      if (this.selectedTransactionTypeId == +TransactionTypeEnum.Payment) {
        this.getTransactionsForTransferByAccountNumber(selectedAccountNumber);
      }
      if (this.selectedTransactionTypeId == +TransactionTypeEnum.PaymentReversal) {
        this.getBouncedTransactionsForTransfer(selectedAccountNumber);
      }
    }
  }

  createForm() {
    this.form = this.formbuilder.group({
      transferAmount: [null, Validators.required],
      fromAccount: [null],
      fromDebtorQuery: ['', [Validators.minLength(3), Validators.required]],
      toDebtorQuery: ['', [Validators.minLength(3), Validators.required]],
      toDebtorNumber: [null, Validators.required],
      fromDebtorNumber: [null, Validators.required],
      partialAmount: [null],
      transactionTypes: [null]
    });
  }

  readInterDebtorTransferForm() {
    this.interDebtorTransfer = new InterDebtorTransfer();
    this.interDebtorTransfer.receiverAccountNumber = this.selectedAccountNumber;
    this.interDebtorTransfer.transferAmount = this.transferAmount;
    this.interDebtorTransfer.receiverDebtorNumber = this.selectedToDebtorNumber;
    this.interDebtorTransfer.fromDebtorNumber = this.selectedFromDebtorNumber;
    this.interDebtorTransfer.allocationProgressStatus = AllocationProgressionStatusEnum.UnAllocated;
    this.interDebtorTransfer.transactions = this.selectedTransactions;
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators([validationToApply]);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  createWizard() {
    if (this.interDebtorTransfer.fromAccountNumber !== this.interDebtorTransfer.receiverAccountNumber) {
      const data = JSON.stringify(this.interDebtorTransfer);

      const startWizardRequest = new StartWizardRequest();
      startWizardRequest.type = 'inter-debtor-transfer';
      startWizardRequest.linkedItemId = this.interDebtorTransfer.interDebtorTransferId;
      startWizardRequest.data = data;

      this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
        this.toastr.successToastr('Interdebtor transfer wizard created successfully');
        this.back();
      }, error => { this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
    }
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  getTransactions(debtorNumber: string) {
    this.isLoadingTransactions$.next(true);
    this.transactionService.getTransactionsForTransfer(debtorNumber).subscribe(results => {
      this.transactions = results;
      this.datasource.data = this.transactions;
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }

  transactionSelected($event: Transaction, partialAmount = 0) {
    this.message = '';

    const index = this.selectedTransactions.indexOf($event);

    if (index <= -1) {
      let transferAmount = 0;
      if (partialAmount > 0) {
        $event.transferAmount = partialAmount;
        $event.unallocatedAmount = $event.unallocatedAmount - partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].transferAmount = partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].unallocatedAmount = $event.unallocatedAmount;
      } else {
        if ($event.amount > $event.unallocatedAmount) {
          transferAmount = $event.unallocatedAmount;
        }
        else {
          transferAmount = $event.amount;
        }

        $event.unallocatedAmount = 0;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].transferAmount = transferAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].unallocatedAmount = 0;
      }
    } else {
      $event.unallocatedAmount = $event.originalUnallocatedAmount;
      $event.transferAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].transferAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].unallocatedAmount = $event.unallocatedAmount;
    }

    index > -1 ? this.selectedTransactions.splice(index, 1) : this.selectedTransactions.push($event);

    this.transferAmount = this.selectedTransactions.reduce((sum, current) => sum + current.transferAmount, 0);
    this.form.patchValue({
      transferAmount: this.transferAmount
    });
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  toggleOwnAmount(tran: Transaction) {
    this.message = '';
    if (tran) {
      this.allocatableAmount = tran.unallocatedAmount;

      if (this.allocatableAmount <= 0) {
        this.message = 'Available balance depleted';
        return;
      }

      this.lastSelectedPartialTranId = tran.transactionId;
      this.maxAmountAllowed = this.allocatableAmount;
    } else {
      this.lastSelectedPartialTranId = 0;
      this.maxAmountAllowed = 0;
    }
    this.showOwnAmount = !(this.showOwnAmount);
  }

  addPartialAmount() {
    this.showMessage = false;
    this.ownAmount = +(this.form.value.partialAmount as number);

    if (this.ownAmount > this.maxAmountAllowed || this.ownAmount === 0) {
      this.showMessage = true;
      return;
    }

    const transaction = this.transactions.find(tran => tran.transactionId === this.lastSelectedPartialTranId);
    this.transactionSelected(transaction, this.ownAmount);
    this.ownAmount = 0;
    this.lastSelectedPartialTranId = 0;
    this.toggleOwnAmount(null);
    this.transactionsSelected = true;
  }

  getTransactionsForTransferByAccountNumber(rmaBankAccount: string) {
    this.isLoadingTransactions$.next(true);
    this.transactionService.getTransactionsForTransferByAccountNumber(this.fromRoleplayerId, rmaBankAccount, PeriodStatusEnum.Current).subscribe(results => {
      if (results && results.length > 0) {
        this.transactions = [...results];
        this.datasource.data = this.transactions;
      }
      else {
        this.message = 'No credit transactions found'
      }
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
    if (this.bankAccountsMatch && this.requiredDocumentsUploaded) {
      this.canSubmit = true;
    }
    else {
      this.canSubmit = false;
    }
  }

  generateUUID() {
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  transactionTypeChanged($event: any) {
    this.selectedTransactionTypeId = $event.value;
    this.tranfertypeSelected = true;
    if (this.selectedTransactionTypeId == +TransactionTypeEnum.PaymentReversal) {
      this.isReversalTransfertype = true;
    }
  }

  getBouncedTransactionsForTransfer(rmaBankAccount: string) {
    this.isLoadingTransactions$.next(true);
    this.transactionService.getBouncedTransactionsForTransfer(this.fromRoleplayerId, rmaBankAccount, PeriodStatusEnum.Current).subscribe(results => {
      if (results && results.length > 0) {
        this.transactions = [...results];
        this.datasource.data = this.transactions;
      }
      else {
        this.message = 'No bounced transactions found'
      }
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
  }
}
