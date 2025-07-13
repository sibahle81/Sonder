import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CollectionsService } from 'projects/fincare/src/app/billing-manager/services/collections.service';
import { BehaviorSubject } from 'rxjs';
import { InvoicePaymentAllocation } from 'projects/fincare/src/app/billing-manager/models/invoicePaymentAllocation';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { ManualPaymentAllocation } from 'projects/fincare/src/app/billing-manager/models/manualPaymentAllocation';
import { UnallocatedBankImportPayment } from 'projects/fincare/src/app/billing-manager/models/unallocatedBankImportPayment';
import { AccountSearchResult } from 'projects/fincare/src/app/shared/models/account-search-result';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BalanceRemainingComponent } from 'projects/fincare/src/app/billing-manager/views/manual-allocation/manual-allocation-allocate-payment/balace-remaining-dialog/balance-remaining.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { TransactionType } from 'projects/fincare/src/app/billing-manager/models/transactiontype';
import { InterDebtorTransfer } from 'projects/fincare/src/app/billing-manager/models/interDebtorTransfer';
import { Refund } from 'projects/fincare/src/app/billing-manager/models/refund';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { PolicyProductCategory } from '../../../models/policy-product-category';
import { AllocationTypeCodeEnum } from 'projects/fincare/src/app/shared/enum/allocation-type-code.enum';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-manual-allocation-allocate-payment',
  templateUrl: './manual-allocation-allocate-payment.component.html',
  styleUrls: ['./manual-allocation-allocate-payment.component.css']
})
export class ManualAllocationAllocatePaymentComponent implements OnInit {

  form: UntypedFormGroup;
  backLink = '/fincare/billing-manager';
  requiredPermission = 'Manual Payment Allocation';
  claimRecoveryAllocationPermission = 'Claim Recovery Payment Allocation';
  hasclaimRecoveryAllocationPermission: boolean;
  hasPermission: boolean;
  isLoadingPayments$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingInvoices$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isCheckingBankAccountClass$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  bankImportId: number;
  paymentId: number;
  selectedInvoiceIds: number[] = [];
  selectedDebitTransactionIds: number[] = [];
  invoicePaymentAllocations: InvoicePaymentAllocation[];
  selectedPayment: UnallocatedBankImportPayment;
  allocatableAmount: number;
  manualPaymentAllocations: ManualPaymentAllocation[] = [];
  message: string;
  selectedDebtor: AccountSearchResult;
  overpaymentTransactions: Transaction[];
  debitTransactions: Transaction[] = [];
  roleplayerId = 0;

  accountAllocation = false;
  invoiceAllocation = false;
  claimRecoveryAllocation = false;
  debitTransactionAllocation = false;
  allocationType: AllocationTypeCodeEnum;

  hideSearch = false;
  blockSearch = false;
  submitDisabled = true;
  amountIsInvalid = false;
  optionSelected = false;

  showOwnAmount: boolean;
  showOwnAmountTransaction: boolean;
  ownAmount: number;
  lastSelectedPartialInvoiceId: number;
  lastSelectedPartialTransactionId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
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
  individualClassAccNum = '62679223942';
  otherClassAccNum = '62775460646';
  actualAllocationType = '';
  selectedPolicyIds = [];
  showPeriodControl: Boolean = true;
  debitAllocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Dbt].toUpperCase();
  invoiceAllocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Inv].toUpperCase();
  transactionAllocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Tra].toUpperCase();
  reAllocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Rec].toUpperCase();
  reversalAllocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Rev].toUpperCase();
  policyAllocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Pol].toUpperCase();
  datasourceReversal = new MatTableDataSource<Transaction>();
  displayedReversalColumns = ['transactionType', 'rmaReference', 'amount', 'balance', 'transactionDate', 'action'];
  config: any;
  isLoadingCreditTransactions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  minAmountAllowed = 1;
  showDebtorPolicyAllocation = false;
  policyAllocation = false;
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly collectionsService: CollectionsService,
    private readonly roleplayerService: RolePlayerService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly transactionsService: TransactionsService) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.hasclaimRecoveryAllocationPermission = userUtility.hasPermission(this.claimRecoveryAllocationPermission);
      this.hasPermission = userUtility.hasPermission(this.requiredPermission);
      if (this.hasPermission || this.hasclaimRecoveryAllocationPermission) {
        this.createForm();
        this.allocationType = this.getAllocationEnumFromParam(params.allocationType);
        this.paymentId = params.paymentId;
        this.roleplayerId = params.roleplayerId;

        if (this.allocationType === AllocationTypeCodeEnum.Inv) {
          this.blockSearch = true;
          this.getPayment(this.paymentId);
          this.showDebtorPolicyAllocation = false;
        }

        if (this.allocationType === AllocationTypeCodeEnum.Dbt) {
          this.toggle(this.invoiceAllocationType);
          this.blockSearch = true;
          this.showBalanceRemainingDialog = false;
          this.getOverpaymentTransaction(this.paymentId);
          this.showDebtorPolicyAllocation = true;
        }
      }
    });
  }

  getAccount(roleplayerId: number) {
    this.roleplayerService.getFinPayee(roleplayerId).subscribe(finPayee => {
      const account = new AccountSearchResult();
      account.rolePlayerId = finPayee.rolePlayerId;
      account.finPayeNumber = finPayee.finPayeNumber;
      this.onAccountSelected(account);
    });
  }

  createForm() {
    this.form = this.formbuilder.group({
      accountNumber: [null],
      paymentAmount: [null],
      allocatableAmount: [null],
      accountName: [null],
      amount: [null, [Validators.required]],
      partialAmount: [null],
      transactionTypes: ['']
    });

    this.disableFormControl('accountNumber');
    this.disableFormControl('paymentAmount');
    this.disableFormControl('allocatableAmount');
    this.disableFormControl('accountName');
  }

  populateForm() {
    if (!this.selectedPayment) { return; }
    this.form.patchValue({
      accountNumber: this.selectedPayment.bankAccountNumber ? this.selectedPayment.bankAccountNumber.replace(/^0+/, '') : '',
      paymentAmount: this.originalPaymentAmount ? this.originalPaymentAmount.toFixed(2) : 0.00,
      allocatableAmount: this.allocatableAmount ? this.allocatableAmount.toFixed(2) : 0.00,
      amount: this.allocatableAmount ? this.allocatableAmount.toFixed(2) : 0.00
    });

    if (this.allocatableAmount < 0) {
      this.minAmountAllowed = this.allocatableAmount;
    }
  }

  submit() {
    let proceedWithPaymentAllocation = true;
    if (this.allocatableAmount > 0 && this.showBalanceRemainingDialog) {
      this.openDialog();
    } else {
      if (this.accountAllocation) {
        const manualPaymentAllocation = new ManualPaymentAllocation();
        manualPaymentAllocation.unallocatedTransactionId = this.allocationType === AllocationTypeCodeEnum.Dbt ? this.paymentId : 0;
        manualPaymentAllocation.unallocatedPaymentId = this.allocationType === AllocationTypeCodeEnum.Inv || this.allocatingOutgoingPayment ? this.paymentId : 0;
        manualPaymentAllocation.allocatedAmount = this.form.controls.amount.value as number;
        manualPaymentAllocation.rolePlayerId = this.selectedDebtor.rolePlayerId;
        manualPaymentAllocation.allocationType = this.actualAllocationType !== '' ? this.actualAllocationType : AllocationTypeCodeEnum[this.allocationType];
        manualPaymentAllocation.reference = this.form.controls.accountNumber.value as string;
        manualPaymentAllocation.isClaimRecoveryPayment = this.claimRecoveryAllocation;
        manualPaymentAllocation.leaveBalanceInSuspenceAccount = this.leaveBalanceInSuspenceAccount;
        manualPaymentAllocation.periodStatus = this.selectedPeriodStatus;

        this.manualPaymentAllocations = [];

        if (this.allocatingOutgoingPayment) {
          if (this.selectedTransactionTypeId > 0) {
            manualPaymentAllocation.transactionType = this.selectedTransactionTypeId;

            /*  PLEASE DO NOT REMOVE THIS COMMENTED SECTION
            if (this.selectedTransactionTypeId === (TransactionTypeEnum.InterDebtorTransfer as number) && !this.linkedInterDebtorTransfer) {
              this.message = 'There is no inter-debtor transfer to link for debtor';
              this.form.get('transactionTypes').setErrors({ interDebtorTransferLinkNotFound: true });
              proceedWithPaymentAllocation = false;
            } else if (this.selectedTransactionTypeId === (TransactionTypeEnum.Refund as number) && !this.linkedRefund) {
              this.message = 'There is no refund to link for debtor';
              this.form.get('transactionTypes').setErrors({ refundLinkNotFound: true });
              proceedWithPaymentAllocation = false;
            } else if (this.selectedTransactionTypeId === (TransactionTypeEnum.PaymentReversal as number) && !this.linkedPayment) {
              this.message = 'Please allocate the return to a payment';
              this.form.get('transactionTypes').setErrors({ paymentLinkNotFound: true });
              proceedWithPaymentAllocation = false;
            } */

            if (proceedWithPaymentAllocation) {
              manualPaymentAllocation.linkedInterDebtorTransfer = this.linkedInterDebtorTransfer;
              manualPaymentAllocation.linkedRefund = this.linkedRefund;
              manualPaymentAllocation.linkedPayment = this.linkedPayment;
              this.message = '';
              this.form.get('transactionTypes').setErrors(null);
            }
          } else {
            this.message = 'Please select a linked transaction type';
            this.form.get('transactionTypes').setErrors({ transactionTypeRequired: true });
            proceedWithPaymentAllocation = false;
          }
        }

        if (proceedWithPaymentAllocation) {
          this.manualPaymentAllocations.push(manualPaymentAllocation);
        }
      }

      if (proceedWithPaymentAllocation) {
        this.allocatePayment(this.manualPaymentAllocations);
      }
    }
  }

  getPayment(paymentId: number) {
    this.collectionsService.getPayment(paymentId).subscribe(result => {
      this.originalPaymentAmount = result.amount;
      this.selectedPayment = result;
      this.paymentId = this.selectedPayment.unallocatedPaymentId;
      this.allocatableAmount = this.selectedPayment.unallocatedAmount;
      this.allocatingOutgoingPayment = this.allocatableAmount < 0;

      if (this.allocatingOutgoingPayment) {
        this.paymentAllocationToDebtorMsg = 'Allocate outgoing payment to a debtors account';
        this.disableFormControl('amount');
      }
      this.populateForm();
      this.isLoadingPayments$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPayments$.next(false); });
  }

  getOverpaymentTransaction(transactionId: number) {
    this.isLoadingPayments$.next(true);
    this.collectionsService.getTransactionAllocatedToDebtorAccount(transactionId).subscribe(transaction => {
      this.originalPaymentAmount = transaction.amount < 0 ? transaction.amount * -1 : transaction.amount;
      const overpaymentTransaction = new UnallocatedBankImportPayment();
      overpaymentTransaction.bankAccountNumber = transaction.rmaReference;
      overpaymentTransaction.amount = transaction.amount;
      overpaymentTransaction.unallocatedAmount = transaction.unallocatedAmount;
      this.allocatableAmount = transaction.unallocatedAmount < 0 ? transaction.unallocatedAmount * -1 : transaction.unallocatedAmount;

      this.selectedPayment = overpaymentTransaction;

      this.populateForm();

      this.isLoadingPayments$.next(false);

      this.getAccount(this.roleplayerId);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingPayments$.next(false); });
  }

  getUnpaidInvoices(roleplayerId: number) {
    this.isLoadingInvoices$.next(true);
    this.collectionsService.getUnpaidInvoicesByPolicies(roleplayerId, false, this.selectedPolicyIds).subscribe(results => {
      this.invoicePaymentAllocations = results;
      this.config = {
        itemsPerPage: 5,
        currentPage: 1,
        totalItems: this.invoicePaymentAllocations.length
      };
      this.isLoadingInvoices$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingInvoices$.next(false); });
  }

  getClaimRecoveryInvoices(roleplayerId: number) {
    this.isLoadingInvoices$.next(true);
    this.collectionsService.getUnpaidInvoices(roleplayerId, true).subscribe(results => {
      this.invoicePaymentAllocations = results;
      this.isLoadingInvoices$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingInvoices$.next(false); });
  }

  getDebitTransactions(roleplayerId: number) {
    this.isLoadingTransactions$.next(true);
    this.transactionsService.getDebitTransactionsForAllocation(roleplayerId, this.allocatableAmount).subscribe(result => {
      this.debitTransactions = result;
    });
    this.isLoadingTransactions$.next(false);
  }

  allocatePayment(manualPaymentAllocations: ManualPaymentAllocation[]) {
    this.isSubmitting$.next(true);

    this.manualPaymentAllocations.forEach(manualAllocation => {
      manualAllocation.periodStatus = this.selectedPeriodStatus;
    });

    this.collectionsService.allocatePayments(manualPaymentAllocations).subscribe(successful => {
      if (successful) {
        this.toastr.successToastr('Payment(s) allocated successfully...');
      } else {
        this.toastr.errorToastr('Payment allocation(s) Failed...');
      }
      this.back();
    }, error => { this.toastr.errorToastr(error.message); this.isSubmitting$.next(false); });
  }

  invoiceSelected(invoiceId: number, partialAmount: number) {
    this.message = '';

    if (this.allocatableAmount <= 0) {
      this.message = 'Available funds depleted';
      return;
    }

    const selectedInvoice = this.invoicePaymentAllocations.find(invoice => invoice.invoiceId === invoiceId);
    const index = this.invoicePaymentAllocations.findIndex(invoice => invoice.invoiceId === invoiceId);

    if (selectedInvoice.amountOutstanding === 0) {
      this.message = 'Outstanding amount can not be zero';
      return;
    }

    if (partialAmount === 0) {
      if (this.allocatableAmount >= selectedInvoice.amountOutstanding) {
        selectedInvoice.amountAllocated = selectedInvoice.amountOutstanding;
      } else {
        selectedInvoice.amountAllocated = this.allocatableAmount;
      }
    } else {
      selectedInvoice.amountAllocated = partialAmount;
    }

    this.selectedInvoiceIds.push(invoiceId);

    selectedInvoice.amountOutstanding -= selectedInvoice.amountAllocated;
    this.allocatableAmount -= selectedInvoice.amountAllocated;
    selectedInvoice.invoiceStatus = this.setInvoiceStatus(selectedInvoice);

    this.invoicePaymentAllocations[index] = selectedInvoice;

    const manualPaymentAllocation = new ManualPaymentAllocation();
    if (!selectedInvoice.isClaimRecoveryInvoice) {
      manualPaymentAllocation.InvoiceId = invoiceId;
    } else {
      manualPaymentAllocation.claimRecoveryInvoiceId = invoiceId;
    }
    manualPaymentAllocation.unallocatedPaymentId = (this.allocationType === AllocationTypeCodeEnum.Inv || selectedInvoice.isClaimRecoveryInvoice) ? this.paymentId : 0;
    manualPaymentAllocation.unallocatedTransactionId = this.allocationType === AllocationTypeCodeEnum.Dbt ? this.paymentId : 0;
    manualPaymentAllocation.allocatedAmount = selectedInvoice.amountAllocated;
    manualPaymentAllocation.allocationType = AllocationTypeCodeEnum[this.allocationType];
    manualPaymentAllocation.rolePlayerId = this.roleplayerId > 0 ? this.roleplayerId : this.selectedDebtor.rolePlayerId;
    manualPaymentAllocation.isClaimRecoveryPayment = selectedInvoice.isClaimRecoveryInvoice;

    this.manualPaymentAllocations.push(manualPaymentAllocation);

    this.submitDisabled = this.selectedInvoiceIds.length === 0;

    this.populateForm();
  }

  invoiceRemoved(invoiceId: number, amountAllocated: number) {
    const selectedInvoice = this.invoicePaymentAllocations.find(invoice => invoice.invoiceId === invoiceId);

    let index = this.selectedInvoiceIds.findIndex(id => id === invoiceId);
    this.selectedInvoiceIds.splice(index, 1);

    selectedInvoice.amountOutstanding += amountAllocated;
    this.allocatableAmount += amountAllocated;
    selectedInvoice.amountAllocated = undefined;
    selectedInvoice.invoiceStatus = this.setInvoiceStatus(selectedInvoice);

    index = this.invoicePaymentAllocations.findIndex(invoice => invoice.invoiceId === invoiceId);
    this.invoicePaymentAllocations[index] = selectedInvoice;

    index = this.manualPaymentAllocations.findIndex(invoice => invoice.InvoiceId === invoiceId);
    this.manualPaymentAllocations.splice(index, 1);

    this.submitDisabled = this.selectedInvoiceIds.length === 0;

    this.populateForm();
  }

  setInvoiceStatus(invoice: InvoicePaymentAllocation): InvoiceStatusEnum {
    return invoice.amountOutstanding === 0 ? InvoiceStatusEnum.Paid : invoice.amountOutstanding > 0 && invoice.amountAllocated > 0 || invoice.totalInvoiceAmount - invoice.amountOutstanding > 0 ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Unpaid;
  }

  getStatusName(invoice: InvoicePaymentAllocation): string {
    const status = invoice.amountOutstanding === 0 ? InvoiceStatusEnum.Paid : invoice.amountOutstanding > 0 && invoice.amountAllocated > 0 || invoice.totalInvoiceAmount - invoice.amountOutstanding > 0 ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Unpaid;
    return InvoiceStatusEnum[status];
  }

  getTransactionTypeName(transactionTypeId: number): string {
    return TransactionTypeEnum[transactionTypeId].replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators([validationToApply]);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  onAccountSelected($event: AccountSearchResult) {
    this.hideSearch = true;
    this.selectedDebtor = $event;
    this.crossAccountAllocation = false;
    this.roleplayerId = $event.rolePlayerId;

    this.form.patchValue({
      accountName: this.selectedDebtor.finPayeNumber
    });

    if (this.actualAllocationType === AllocationTypeCodeEnum[AllocationTypeCodeEnum.Dbt].toUpperCase()
      || this.actualAllocationType === AllocationTypeCodeEnum[AllocationTypeCodeEnum.Rev].toUpperCase()) {
      this.checkCrossAllocation();
    }
  }

  toggleSearch(hide: boolean) {
    this.message = '';
    this.hideSearch = hide;
  }

  toggle($event) {
    this.message = '';
    this.optionSelected = true;

    this.invoiceAllocation = $event === this.invoiceAllocationType;
    this.accountAllocation = $event === this.debitAllocationType || $event === this.reversalAllocationType;
    this.claimRecoveryAllocation = $event === this.reAllocationType;
    this.debitTransactionAllocation = $event === this.transactionAllocationType;
    this.debitTransactionAllocation = $event === this.transactionAllocationType;
    this.policyAllocation = $event === this.policyAllocationType;
    this.showBalanceRemainingDialog = !this.accountAllocation;

    this.invoicePaymentAllocations = null;
    this.selectedInvoiceIds = [];
    this.selectedDebitTransactionIds = [];
    this.debitTransactions = [];

    this.manualPaymentAllocations = [];
    this.actualAllocationType = $event;

    if (this.allocationType !== AllocationTypeCodeEnum.Dbt) {
      this.blockSearch = false;
      this.toggleSearch(false);
      this.selectedDebtor = null;
    }
    else {
      this.blockSearch = true;
      this.getAccount(this.roleplayerId);
    }

    this.disableSubmit();
  }

  toggleOwnAmount(invoiceId: number, maxAmountAllowed: number) {
    this.message = '';

    if (this.allocatableAmount <= 0) {
      this.message = 'Available funds depleted';
      return;
    }

    this.lastSelectedPartialInvoiceId = invoiceId;

    if (this.allocatableAmount < maxAmountAllowed) {
      this.maxAmountAllowed = this.allocatableAmount;
    } else {
      this.maxAmountAllowed = maxAmountAllowed;
    }

    this.showOwnAmount = !(this.showOwnAmount);
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

  addPartialAmount() {
    this.showMessage = false;
    this.ownAmount = +(this.form.value.partialAmount as number);

    if (this.ownAmount > this.maxAmountAllowed || this.ownAmount === 0) {
      this.showMessage = true;
      return;
    }

    this.invoiceSelected(this.lastSelectedPartialInvoiceId, this.ownAmount);
    this.ownAmount = 0;
    this.lastSelectedPartialInvoiceId = 0;
    this.toggleOwnAmount(0, 0);
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
    let result = true; // disabled

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

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      balance: this.allocatableAmount,
    };

    const dialogRef = this.dialog.open(BalanceRemainingComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.leaveBalanceInSuspenceAccount = data.leaveBalanceInSuspenceAccount as boolean;
        this.manualPaymentAllocations.forEach(manualAllocation => {
          manualAllocation.leaveBalanceInSuspenceAccount = this.leaveBalanceInSuspenceAccount;
        });
        this.allocatePayment(this.manualPaymentAllocations);
      }
    });
  }

  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }

  setTransactionType() {
    const reference = this.selectedPayment.billingReference.trim().replace(/\s/g, '').toUpperCase();
    const isPaymentReversal = this.selectedPayment.documentType === 'DO' || reference.includes('RMA02');
    const isTransfer = !isPaymentReversal && reference.includes('TRF');
    this.selectedTransactionTypeId = isPaymentReversal ? TransactionTypeEnum.PaymentReversal : isTransfer ? TransactionTypeEnum.InterDebtorTransfer : TransactionTypeEnum.Refund;
    if (this.selectedTransactionTypeId === TransactionTypeEnum.PaymentReversal) {
      this.form.patchValue({
        transactionTypes: 'Payment Return'
      });
    } else if (this.selectedTransactionTypeId === TransactionTypeEnum.InterDebtorTransfer) {
      this.form.patchValue({
        transactionTypes: 'Transfer'
      });
    } else {
      this.form.patchValue({
        transactionTypes: 'Refund'
      });
    }
    this.showDebitTransactionLinkSelection = true;
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

  debitTransactionSelected(transactionId: number, partialAmount: number) {
    this.message = '';

    if (this.allocatableAmount <= 0) {
      this.message = 'Available funds depleted';
      return;
    }

    const selectedTransaction = this.debitTransactions.find(transaction => transaction.transactionId === transactionId);
    const index = this.debitTransactions.findIndex(transaction => transaction.transactionId === transactionId);

    selectedTransaction.amountAllocated = partialAmount === 0 ? selectedTransaction.balance : partialAmount;

    this.selectedDebitTransactionIds.push(transactionId);

    selectedTransaction.balance -= selectedTransaction.amountAllocated;
    this.allocatableAmount -= selectedTransaction.amountAllocated;


    this.debitTransactions[index] = selectedTransaction;

    const manualPaymentAllocation = new ManualPaymentAllocation();

    manualPaymentAllocation.unallocatedPaymentId = this.allocationType === AllocationTypeCodeEnum.Dbt ? 0 : this.paymentId;
    manualPaymentAllocation.unallocatedTransactionId = this.allocationType === AllocationTypeCodeEnum.Dbt ? this.paymentId : 0;
    manualPaymentAllocation.allocatedAmount = selectedTransaction.amountAllocated;
    manualPaymentAllocation.allocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Tra].toUpperCase();
    manualPaymentAllocation.rolePlayerId = this.roleplayerId > 0 ? this.roleplayerId : this.selectedDebtor.rolePlayerId;
    manualPaymentAllocation.debitTransaction = selectedTransaction;

    this.manualPaymentAllocations.push(manualPaymentAllocation);

    this.submitDisabled = this.selectedDebitTransactionIds.length === 0;

    this.populateForm();
  }

  debitTransactionRemoved(transactionId: number, amountAllocated: number) {
    const selectedTransaction = this.debitTransactions.find(transaction => transaction.transactionId === transactionId);
    const selectedTransactionIndex = this.debitTransactions.findIndex(s => s.transactionId === transactionId);

    let index = this.selectedDebitTransactionIds.findIndex(id => id === transactionId);
    this.selectedDebitTransactionIds.splice(index, 1);

    selectedTransaction.balance += amountAllocated;
    this.allocatableAmount += amountAllocated;
    selectedTransaction.amountAllocated = undefined;

    this.debitTransactions[selectedTransactionIndex] = selectedTransaction;

    index = this.manualPaymentAllocations.findIndex(transaction => transaction.unallocatedTransactionId === transactionId);
    this.manualPaymentAllocations.splice(index, 1);

    this.submitDisabled = this.selectedInvoiceIds.length === 0;

    this.populateForm();
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.selectedPolicyIds = [];
    if (policies.length === 0) {
      return;
    }
    policies.forEach(c => this.selectedPolicyIds.push(c.policyId));

    if (this.allocationType !== AllocationTypeCodeEnum.Dbt) {
      this.checkCrossAllocation();
    }

    if (this.allocatingOutgoingPayment) {
      this.setTransactionType();
    }

    if (!this.crossAccountAllocation) {
      if (this.invoiceAllocation) {
        this.getUnpaidInvoices(this.selectedDebtor.rolePlayerId);
      }

      if (this.claimRecoveryAllocation) {
        this.getClaimRecoveryInvoices(this.selectedDebtor.rolePlayerId);
      }

      if (this.debitTransactionAllocation) {
        this.getDebitTransactions(this.selectedDebtor.rolePlayerId);
      }
    }
  }

  checkCrossAllocation() {
    this.isCheckingBankAccountClass$.next(true);
    this.roleplayerService.GetDebtorBankAccountNumbers(this.selectedDebtor.finPayeNumber).subscribe(result => {
      const sourceAccNum = this.selectedPayment.bankAccountNumber.replace(/^0+/, '');
      let targetAccount = result.find(x => x === sourceAccNum);

      if (targetAccount) {
        this.submitDisabled = false;
      }
      else {
        const isCrossAllocation = !((sourceAccNum == this.individualClassAccNum) ||
          (sourceAccNum == this.otherClassAccNum && targetAccount == this.individualClassAccNum)); // LEAVE DOUBLE EQUALS
        this.crossAccountAllocation = isCrossAllocation;
        if (this.crossAccountAllocation) {
          this.message = 'Allocation of payments across different classes is not allowed. Payment account number: (' + sourceAccNum + ') --- Debtor account number: (' + result + ')';
          this.submitDisabled = true;
        }

        this.submitDisabled = true;
      }
      this.isCheckingBankAccountClass$.next(false);
    }, error => { this.message = error.message; this.submitDisabled = true; this.isCheckingBankAccountClass$.next(false); });
  }

  getAllocationEnumFromParam(paramValue: string) {
    switch (paramValue) {
      case AllocationTypeCodeEnum[AllocationTypeCodeEnum.Dbt].toUpperCase(): return AllocationTypeCodeEnum.Dbt;
      case AllocationTypeCodeEnum[AllocationTypeCodeEnum.Inv].toUpperCase(): return AllocationTypeCodeEnum.Inv;
      case AllocationTypeCodeEnum[AllocationTypeCodeEnum.Rec].toUpperCase(): return AllocationTypeCodeEnum.Rec;
      case AllocationTypeCodeEnum[AllocationTypeCodeEnum.Tra].toUpperCase(): return AllocationTypeCodeEnum.Tra;
    }
  }

  getPaymentTransactionsAllocatedToDebtorAccount() {
    this.isLoadingCreditTransactions$.next(true);
    this.collectionsService.getPaymentTransactionsAllocatedToDebtorAccount(this.roleplayerId).subscribe((transactions) => {
      if (transactions && transactions.length > 0) {
        this.datasourceReversal.data = [...transactions]
        this.debitTransactions = [...transactions];
      }
      this.isLoadingCreditTransactions$.next(false);
    });
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }


  reversalTransactionSelected(transactionId: number) {
    const selectedTransaction = this.debitTransactions.find(transaction => transaction.transactionId === transactionId);
    const index = this.debitTransactions.findIndex(transaction => transaction.transactionId === transactionId);

    this.selectedDebitTransactionIds.push(transactionId);

    this.debitTransactions[index] = selectedTransaction;
    const manualPaymentAllocation = new ManualPaymentAllocation();

    manualPaymentAllocation.unallocatedPaymentId = this.allocationType === AllocationTypeCodeEnum.Dbt ? 0 : this.paymentId;
    manualPaymentAllocation.unallocatedTransactionId = this.allocationType === AllocationTypeCodeEnum.Dbt ? this.paymentId : 0;
    manualPaymentAllocation.allocatedAmount = this.allocatableAmount;
    manualPaymentAllocation.allocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Rev].toUpperCase();
    manualPaymentAllocation.rolePlayerId = this.roleplayerId > 0 ? this.roleplayerId : this.selectedDebtor.rolePlayerId;
    manualPaymentAllocation.linkedPayment = selectedTransaction;
    manualPaymentAllocation.transactionType = TransactionTypeEnum.PaymentReversal;


    this.manualPaymentAllocations.push(manualPaymentAllocation);
    this.submitDisabled = this.selectedDebitTransactionIds.length === 0;
    this.accountAllocation = false;
    this.populateForm();
  }

  reversalTransactionRemoved(transactionId: number) {
    const selectedTransaction = this.debitTransactions.find(transaction => transaction.transactionId === transactionId);
    const selectedTransactionIndex = this.debitTransactions.findIndex(s => s.transactionId === transactionId);

    let index = this.selectedDebitTransactionIds.findIndex(id => id === transactionId);
    this.selectedDebitTransactionIds.splice(index, 1);
    selectedTransaction.amountAllocated = 0;
    this.debitTransactions[selectedTransactionIndex] = selectedTransaction;
    index = this.manualPaymentAllocations.findIndex(transaction => transaction.unallocatedTransactionId === transactionId);
    this.manualPaymentAllocations.splice(index, 1);

    this.submitDisabled = this.selectedInvoiceIds.length === 0;
    this.populateForm();
  }

  submitReversalTransaction() {
    const manualPaymentAllocation = new ManualPaymentAllocation();

    manualPaymentAllocation.unallocatedPaymentId = this.allocationType === AllocationTypeCodeEnum.Dbt ? 0 : this.paymentId;
    manualPaymentAllocation.unallocatedTransactionId = this.allocationType === AllocationTypeCodeEnum.Dbt ? this.paymentId : 0;
    manualPaymentAllocation.allocatedAmount = this.allocatableAmount;
    manualPaymentAllocation.allocationType = AllocationTypeCodeEnum[AllocationTypeCodeEnum.Rev].toUpperCase();
    manualPaymentAllocation.rolePlayerId = this.roleplayerId > 0 ? this.roleplayerId : this.selectedDebtor.rolePlayerId;
    manualPaymentAllocation.transactionType = TransactionTypeEnum.PaymentReversal;


    this.manualPaymentAllocations.push(manualPaymentAllocation);
    this.accountAllocation = false;
    this.populateForm();
  }

  onPaymentAllocatedSuccessful($event: boolean): void {
    if ($event) {
      this.getOverpaymentTransaction(this.paymentId);
    }
  }

}
