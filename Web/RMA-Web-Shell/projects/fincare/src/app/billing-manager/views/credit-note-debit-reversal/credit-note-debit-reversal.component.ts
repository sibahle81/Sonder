import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { TransactionTypeEnum } from '../../../shared/enum/transactionTypeEnum';
import { AccountSearchResult } from '../../../shared/models/account-search-result';
import { CreditNoteAccount } from '../../models/credit-note-account';
import { InterDebtorTransfer } from '../../models/interDebtorTransfer';
import { InvoicePaymentAllocation } from '../../models/invoicePaymentAllocation';
import { ManualPaymentAllocation } from '../../models/manualPaymentAllocation';
import { Refund } from '../../models/refund';
import { Transaction } from '../../models/transaction';
import { TransactionType } from '../../models/transactiontype';
import { UnallocatedBankImportPayment } from '../../models/unallocatedBankImportPayment';
import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'app-credit-note-debit-reversal',
  templateUrl: './credit-note-debit-reversal.component.html',
  styleUrls: ['./credit-note-debit-reversal.component.css']
})
export class CreditNoteDebitReversalComponent extends WizardDetailBaseComponent<CreditNoteAccount> {

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  totalAmount = 0;
  finPayeNumber: string;
  roleplayer: RolePlayer;

  showOwnAmount: boolean;
  ownAmount: number;
  lastSelectedPartialInvoiceId: number;
  maxAmountAllowed: number;
  showMessage: boolean;

  invoicePaymentAllocations: InvoicePaymentAllocation[];
  selectedInvoiceIds: number[] = [];
  transactions: Transaction[] = [];

  bankImportId: number;
  paymentId: number;

  selectedDebitTransactionIds: number[] = [];

  selectedPayment: UnallocatedBankImportPayment;
  allocatableAmount: number;
  manualPaymentAllocations: ManualPaymentAllocation[] = [];
  message: string;
  selectedDebtor: AccountSearchResult;
  overpaymentTransactions: Transaction[];
  debitTransactions: Transaction[] = [];
  roleplayerId: number;

  accountAllocation = false;
  invoiceAllocation = false;
  claimRecoveryAllocation = false;
  debitTransactionAllocation = false;
  allocationType: string;

  hideSearch = false;
  blockSearch = false;
  submitDisabled = true;
  amountIsInvalid = false;
  optionSelected = false;


  showOwnAmountTransaction = false;
  lastSelectedPartialTransactionId: number;

  originalPaymentAmount: number;
  crossAccountAllocation = false;
  leaveBalanceInSuspenceAccount = true;
  selectedPeriodStatus: PeriodStatusEnum;
  showBalanceRemainingDialog = true;
  periodIsValid = false;
  allocatingOutgoingPayment = false;
  paymentAllocationToDebtorMsg = 'Allocate payment to a debtors account';
  transactionTypes = [new TransactionType(TransactionTypeEnum.PaymentReversal, 'Payment Return')];
  selectedTransactionTypeId = 1;
  linkedInterDebtorTransfer: InterDebtorTransfer;
  linkedRefund: Refund;
  linkedPayment: Transaction;
  showDebitTransactionLinkSelection = false;
  debitSearchFailed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  displayedColumns = ['documentNumber', 'documentDate', 'amount', 'amountOutstanding', 'amountAllocated',  'actions'];
  datasource = new MatTableDataSource<Transaction>();
  constructor(
    private readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    private readonly roleplayerService: RolePlayerService,
    private readonly appEventsManager: AppEventsManager,
    private readonly transactionsService: TransactionsService,
    private readonly toastr: ToastrManager) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
    this.getRoleplayerDetails(this.model.rolePlayerId);
    this.getDebitTransactions(this.model.rolePlayerId);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm() {
    if (!this.model) { return; }

    this.form.patchValue({
      amount: this.model.amount,
      reason: this.model?.note?.text
    });

    this.disableFormControl('amount');
  }

  populateModel() {
    this.model.amount = this.totalAmount;
    this.model.note.text = this.form.value.reason as string;
    this.model.transactions = this.transactions;
  }

  getRoleplayerDetails(roleplayerId: number) {
    this.isLoading$.next(true);
    this.roleplayerService.getRolePlayer(roleplayerId).subscribe(result => {
      this.roleplayer = result;
      this.isLoading$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoading$.next(false); });
  }

  createForm() {
    this.form = this.formbuilder.group({
      amount: [null],
      partialAmount: [null],
      reason: [null, [Validators.required, Validators.minLength(3)]]
    });
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  getTransactionTypeName(transactionTypeId: number): string {
    return TransactionTypeEnum[transactionTypeId].replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }


  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators([validationToApply]);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  onAccountSelected($event: AccountSearchResult) {
    this.hideSearch = true;
    this.selectedDebtor = $event;

    this.form.patchValue({
      accountName: this.selectedDebtor.finPayeNumber
    });
    this.getDebitTransactions(this.selectedDebtor.rolePlayerId);
    this.disableSubmit();
  }

  addPartialAmountTransaction() {
    this.showMessage = false;
    this.ownAmount = +(this.form.value.partialAmount as number);

    if (this.ownAmount > this.maxAmountAllowed || this.ownAmount === 0) {
      this.showMessage = true;
      return;
    }

    this.debitTransactionSelected(this.lastSelectedPartialTransactionId, this.ownAmount);
    this.ownAmount = 0;
    this.lastSelectedPartialTransactionId = 0;
    this.toggleOwnAmountTransaction(0, 0);
  }

  disableSubmit() {
    let result = true;
    if (this.form.valid) {
      if (this.invoiceAllocation) {
        result = !(this.selectedDebtor && this.manualPaymentAllocations.length > 0);
      }

      if (this.accountAllocation) {
        const amount = this.form.controls.amount.value as number;
        this.amountIsInvalid = amount > this.allocatableAmount;

        result = this.selectedDebtor === null || this.amountIsInvalid;
      }
    } else {
      result = true;
    }

    this.submitDisabled = result;
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  getDebitTransactions(roleplayerId: number) {
    this.isLoadingTransactions$.next(true);
    this.transactionsService.getDebitTransactionsForAllocation(roleplayerId, 0).subscribe(result => {
      if (result) {
        this.debitTransactions = result;
        this.datasource.data =  this.debitTransactions;
        this.debitSearchFailed$.next(false);
      }
      else {
        this.debitSearchFailed$.next(true);
      }
      this.isLoadingTransactions$.next(false);
    }, (() => { this.isLoadingTransactions$.next(false); }));

  }
  addPartialAmount() {
    this.showMessage = false;
    this.ownAmount = +(this.form.value.partialAmount as number);

    if (this.ownAmount > this.maxAmountAllowed || this.ownAmount === 0) {
      this.showMessage = true;
      return;
    }

    this.debitTransactionSelected(this.lastSelectedPartialTransactionId, this.ownAmount);
    this.ownAmount = 0;
    this.lastSelectedPartialTransactionId = 0;
    this.toggleOwnAmountTransaction(0, 0);
  }


  toggleOwnAmountTransaction(transactionId: number, maxAmountAllowed: number) {
    this.message = '';

    if (this.allocatableAmount <= 0) {
      this.message = 'Available funds depleted';
      return;
    }

    this.lastSelectedPartialTransactionId = transactionId;

    if (this.allocatableAmount < maxAmountAllowed) {
      this.maxAmountAllowed = this.allocatableAmount;
    } else {
      this.maxAmountAllowed = maxAmountAllowed;
    }

    this.showOwnAmountTransaction = !(this.showOwnAmountTransaction);
  }

  debitTransactionAllocationLinkSelected($event) {
    this.showDebitTransactionLinkSelection = true;
    if (this.selectedTransactionTypeId === (TransactionTypeEnum.InterDebtorTransfer as number)) {
      this.linkedInterDebtorTransfer = $event;
    } else if (this.selectedTransactionTypeId === (TransactionTypeEnum.Refund as number)) {
      this.linkedRefund = $event;
    } else if (this.selectedTransactionTypeId === (TransactionTypeEnum.PaymentReversal as number)) {
      this.linkedPayment = $event;
    }
  }

  populateForApproval() {
    this.model.transactions.forEach(transaction => {
      this.debitTransactionSelected(transaction.transactionId, transaction.amount);
    });
  }



  debitTransactionSelected(transactionId: number, partialAmount: number) {
    this.message = '';

    if (this.allocatableAmount <= 0) {
      this.message = 'Available funds depleted';
      return;
    }

    const selectedTransaction = this.debitTransactions.find(trans => trans.transactionId === transactionId);
    const index = this.debitTransactions.findIndex(trans => trans.transactionId === transactionId);

    selectedTransaction.amountAllocated = partialAmount === 0 ? selectedTransaction.balance : partialAmount;

    this.selectedDebitTransactionIds.push(transactionId);

    selectedTransaction.balance -= selectedTransaction.amountAllocated;
    this.allocatableAmount -= selectedTransaction.amountAllocated;
    this.totalAmount += selectedTransaction.amountAllocated;

    this.debitTransactions[index] = selectedTransaction;

    const transaction = new Transaction();
    transaction.invoiceId = null;
    transaction.amount = selectedTransaction.amountAllocated;
    transaction.transactionType = TransactionTypeEnum.CreditNote;
    this.transactions.push(transaction);
    this.submitDisabled = this.selectedDebitTransactionIds.length === 0;
    this.model.amount = this.totalAmount;
    this.populateForm();
  }


  debitTransactionRemoved(transactionId: number, amountAllocated: number) {
    const selectedTransaction = this.debitTransactions.find(transaction => transaction.transactionId === transactionId);
    const selectedTransactionIndex = this.debitTransactions.findIndex(s => s.transactionId === transactionId);

    const index = this.selectedDebitTransactionIds.findIndex(id => id === transactionId);
    this.transactions.splice(index, 1);
    this.selectedDebitTransactionIds.splice(index, 1);

    selectedTransaction.balance += amountAllocated;
    selectedTransaction.amountAllocated = undefined;
    if ((this.totalAmount - amountAllocated > 0)) {
      this.totalAmount -= amountAllocated;
    } else {
      this.totalAmount = 0;
    }

    this.debitTransactions[selectedTransactionIndex] = selectedTransaction;

    this.submitDisabled = this.selectedDebitTransactionIds.length === 0;
    this.model.amount = this.totalAmount;
    this.populateForm();
  }
}
