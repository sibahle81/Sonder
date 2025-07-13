import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../../../models/transaction';
import { SearchAccountResults } from 'projects/fincare/src/app/shared/models/search-account-results';
import { RmaBankAccount } from '../../../models/rmaBankAccount';
import { MatTableDataSource } from '@angular/material/table';
import { InterBankTransfer } from '../../../models/interBankTransfer';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { InterBankTransferService } from '../../../services/interbanktransfer.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Notification } from 'projects/fincare/src/app/billing-manager/models/notification';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { TransactionsService } from '../../../services/transactions.service';
import { InterDebtorTransfer } from '../../../models/interDebtorTransfer';
import { AllocationProgressionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/allocation-progression-status-enum';
import { DebtorSearchContextEnum } from 'projects/fincare/src/app/shared/enum/debtor-search-context-enum';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { InterBankTransferDetail } from '../../../models/inter-bank-transfer-detail';

@Component({
  selector: 'app-inter-bank-transfers-from-debtors',
  templateUrl: './inter-bank-transfers-from-debtors.component.html',
  styleUrls: ['./inter-bank-transfers-from-debtors.component.css']
})
export class InterBankTransfersFromDebtorsComponent implements OnInit {

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
  selectedFromDebtorRolePlayerId = 0;

  message: string = '';
  debtorToBankAccounts: RmaBankAccount[];
  debtorFromBankAccounts: RmaBankAccount[];
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
  maxTransferrable = 0;
  sameBankAccountError = '';
  fromDebtorSearchContext = DebtorSearchContextEnum.From;
  toDebtorSearchContext = DebtorSearchContextEnum.To;

  isLoadingDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingFromDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  debtors: SearchAccountResults[];
  selectedDebtorNumber = null;
  displayedColumns = ['transactionType', 'rmaReference', 'amount', 'balance', 'transferAmount', 'createdDate', 'action'];
  displayedDebtorColumns = ['finPayeNumber', 'displayName', 'action'];
  datasource = new MatTableDataSource<Transaction>();
  debtorsDatasource = new MatTableDataSource<SearchAccountResults>();
  fromDebtorsDatasource = new MatTableDataSource<SearchAccountResults>();
  periodIsValid = false;
  selectedPeriodStatus: PeriodStatusEnum;
  showPeriodControl = true;
  selectedBankstatemententryIds = [];
  selectedInterBankTransferDeatails = [];
  selectedToTransactionIds = [];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild('sort2') sort2: MatSort;
  @ViewChild('paginator3') paginator3: MatPaginator;
  @ViewChild('sort3') sort3: MatSort;
  @ViewChild('sort1') sort1: MatSort;
  @ViewChild('paginator1') paginator1: MatPaginator;

  selectedToRoleplayerId = 0;
  maxAmountExceedError = '';

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly wizardService: WizardService,
    private readonly invoiceService: InvoiceService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly toastr: ToastrManager,
    private readonly transactionService: TransactionsService) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    if (this.hasPermission) {
      this.activatedRoute.params.subscribe((params: any) => {
        this.createForm();
      });
    }
  }

  getDebtors(query: string, searchContext: DebtorSearchContextEnum) {

    switch (searchContext) {
      case DebtorSearchContextEnum.To: this.isLoadingDebtors$.next(true); break;
      case DebtorSearchContextEnum.From: this.isLoadingFromDebtors$.next(true); break;
    }

    this.invoiceService.searchDebtors(query).subscribe(results => {

      switch (searchContext) {
        case DebtorSearchContextEnum.To:
          this.debtors = results;
          this.debtorsDatasource.data = this.debtors;
          if (this.debtors && this.debtors.length > 0) {
            this.debtorsLoaded = true;
          }
          this.isLoadingDebtors$.next(false);
          break;
        case DebtorSearchContextEnum.From:
          this.fromDebtors = results;
          this.fromDebtorsDatasource.data = this.fromDebtors;
          if (this.fromDebtors && this.fromDebtors.length > 0) {
            this.debtorsLoaded = true;
          }
          this.isLoadingFromDebtors$.next(false);
          break;
      }

    }, error => { this.toastr.errorToastr(error.message); searchContext === DebtorSearchContextEnum.To ? this.isLoadingDebtors$.next(false) : this.isLoadingFromDebtors$.next(false); });
  }

  selectedToDebtorChanged(value: string) {
    if (this.selectedFromDebtorNumber !== value) {
      this.selectedToDebtorNumber = value;
      this.form.patchValue({
        toDebtorNumber: this.selectedToDebtorNumber
      });

      this.isLoadingToAccounts$.next(true);
      this.interBankTransferService.getDebtorBankAccounts(this.selectedToDebtorNumber).subscribe(result => {
        this.debtorToBankAccounts = result;
        if (this.debtorToBankAccounts.length === 0) {
          this.selectedToAccountId = 0;
        }
        this.isLoadingToAccounts$.next(false);
        if (this.debtorToBankAccounts.length > 0) {
        }
      }, error => { this.toastr.errorToastr(error.message); this.isLoadingToAccounts$.next(false); });
    } else {
      this.form.get('toDebtorNumber').setErrors({ identicalDebtor: true });
    }
  }

  undoToDebtorChanged() {
    this.selectedToDebtorNumber = null;
    this.form.get('toDebtorNumber').setErrors(null);

    this.form.patchValue({
      toDebtorNumber: this.selectedToDebtorNumber
    });
    this.selectedToAccountId = 0;
    this.debtorToBankAccounts = null;
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator1;
    this.datasource.sort = this.sort1;
    this.debtorsDatasource.paginator = this.paginator3;
    this.debtorsDatasource.sort = this.sort3;
    this.fromDebtorsDatasource.paginator = this.paginator2;
    this.fromDebtorsDatasource.sort = this.sort2;
  }

  searchForDebtor(searchContext: DebtorSearchContextEnum) {
    const query = searchContext === DebtorSearchContextEnum.To ? this.form.get('debtorQuery').value as string : this.form.get('fromDebtorQuery').value as string;
    if (query.length > 2) {
      this.getDebtors(query, searchContext);
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

    if (this.form.get('amount').value > this.maxTransferrable) {
      this.maxAmountExceedError = `Selected maximum transferrable of R ${this.maxTransferrable} has been exceeded.`
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
        this.interBankTransfer.fromRolePlayerId = this.selectedFromDebtorRolePlayerId;
        this.interBankTransfer.toRolePlayerId = this.selectedToRoleplayerId;
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
    this.message = '';
    this.transactions = null;
    this.selectedFromAccountId = $event.value;
    this.selectedFromAccount = this.debtorFromBankAccounts.find(s => s.rmaBankAccountId === this.selectedFromAccountId);

    this.getTransactionsForTransferByAccountNumber(this.selectedFromAccount.accountNumber);
  }

  getTransactionsForTransferByAccountNumber(rmaBankAccount: string) {
    this.isLoadingTransactions$.next(true);
    this.transactionService.getTransactionsForTransferByAccountNumber(this.selectedFromDebtorRolePlayerId, rmaBankAccount, PeriodStatusEnum.Current).subscribe(results => {
      if (results && results.length > 0) {
        this.transactions = [...results];
        this.datasource.data = this.transactions;
        this.transactionsLoaded = true;

      }
      else {
        this.message = 'No credit transactions found'
      }
      this.isLoadingTransactions$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingTransactions$.next(false); });
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

  selectedDebtorChanged(value: string, roleplayerId: number) {
    this.selectedDebtorNumber = value;
    this.selectedToRoleplayerId = roleplayerId;
    this.form.patchValue({
      debtorNumber: this.selectedDebtorNumber,
      toAccount: null
    });
    this.isLoadingToAccounts$.next(true);
    this.interBankTransferService.getDebtorBankAccounts(this.selectedDebtorNumber).subscribe(
      result => {
        this.debtorToBankAccounts = result;
        if (this.debtorToBankAccounts.length === 0) {
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

  selectedFromDebtorChanged(value: string, rolePlayerId: number) {
    this.selectedFromDebtorNumber = value;
    this.selectedFromDebtorRolePlayerId = rolePlayerId;
    this.form.patchValue({
      fromDebtorNumber: this.selectedFromDebtorNumber,
      fromAccount: null
    });
    this.isLoadingFromAccounts$.next(true);
    this.interBankTransferService.getDebtorBankAccounts(this.selectedFromDebtorNumber).subscribe(
      result => {
        this.debtorFromBankAccounts = result;
        if (this.debtorFromBankAccounts.length === 0) {
          this.selectedFromAccountId = 0;
        }
        this.isLoadingFromAccounts$.next(false);
      },
      error => {
        this.toastr.errorToastr(error.message);
        this.isLoadingFromAccounts$.next(false);
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
    this.debtorToBankAccounts = null;
  }

  undoFromDebtorChanged() {
    this.selectedFromDebtorNumber = null;
    this.selectedFromDebtorRolePlayerId = 0;
    this.form.patchValue({
      fromDebtorNumber: null,
      fromAccount: null
    });
    this.selectedFromAccountId = 0;
    this.debtorFromBankAccounts = null;
  }

  selectedToAccountChanged($event: { value: number; }) {
    this.sameBankAccountError = '';
    this.selectedToAccountId = $event.value;
    this.selectedToAccount = this.debtorToBankAccounts.find(s => s.rmaBankAccountId === this.selectedToAccountId);
    if (this.selectedFromAccount.accountNumber === this.selectedToAccount.accountNumber) {
      this.sameBankAccountError = 'You cannot transfer to the same bank account';
    }
  }

  createForm() {
    this.form = this.formbuilder.group({
      fromAccount: [null, Validators.required],
      amount: [null, Validators.required],
      toAccount: [null, Validators.required],
      query: ['', [Validators.minLength(5), Validators.required]],
      debtorQuery: ['', [Validators.minLength(3), Validators.required]],
      debtorNumber: [null, Validators.required],
      fromDebtorQuery: ['', [Validators.minLength(3), Validators.required]],
      fromDebtorNumber: [null, Validators.required],
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

  interbankChecked(event: any, item: Transaction) {
    if (event.checked) {

      this.selectedToTransactionIds.push(item.transactionId);
      const interbankTransferDetail = new InterBankTransferDetail();
      interbankTransferDetail.amount = item.amount;
      if (item.bankStatementEntryId) {
        this.selectedBankstatemententryIds.push(item.bankStatementEntryId);
        interbankTransferDetail.bankStatementEntryId = item.bankStatementEntryId;
      }
      interbankTransferDetail.statementReference = item.rmaReference;
      interbankTransferDetail.transactionId = item.transactionId;
      this.selectedInterBankTransferDeatails.push(interbankTransferDetail);
    }
    else {
      this.unTickInterbankItem(item.transactionId);
    }
    let total = 0;
    if (this.selectedInterBankTransferDeatails && this.selectedInterBankTransferDeatails.length > 0) {
      total = this.selectedInterBankTransferDeatails.reduce((sum, current) => sum + current.amount, 0);
      this.maxTransferrable = total;
      this.form.get('amount').setValue(total);
    }
  }

  unTickInterbankItem(itemId: number) {
    for (let i = 0; i < this.selectedToTransactionIds.length; i++) {
      if ((this.selectedToTransactionIds[i] === itemId)) {
        this.selectedInterBankTransferDeatails.splice(i, 1);
        const itemIndex = this.selectedInterBankTransferDeatails.findIndex(c => c.transactionId === itemId);
        this.selectedInterBankTransferDeatails.splice(itemIndex, 1);
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
}
