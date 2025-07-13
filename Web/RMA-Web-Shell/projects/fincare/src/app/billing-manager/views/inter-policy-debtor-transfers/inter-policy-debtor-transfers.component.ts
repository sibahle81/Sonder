import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionType } from '../../models/transactiontype';
import { TransactionTypeEnum } from '../../../shared/enum/transactionTypeEnum';
import { BehaviorSubject } from 'rxjs';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { AccountSearchResult } from '../../../shared/models/account-search-result';
import { PolicyService } from '../../../shared/services/policy.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { BillingService } from '../../services/billing.service';
import { TransactionsService } from '../../services/transactions.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import * as moment from 'moment';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { PolicyPaymentTransaction } from '../../models/policy-payment-transaction';
import { PolicyPaymentAllocation } from '../../models/policy-payment-allocation';
import { TransferPaymentFromPolicyToPolicyRequest } from '../../models/transfer-payment-from-policy-to-policy-request';
import { BillingAllocationTypeEnum } from '../../../shared/enum/billing-allocation-type.enum';


@Component({
  templateUrl: './inter-policy-debtor-transfers.component.html',
  styleUrls: ['./inter-policy-debtor-transfers.component.css']
})
export class InterPolicyDebtorTransfersComponent implements OnInit {

  form: UntypedFormGroup;
  selectedTransactionTypeId = 0;
  transactionTypes = [new TransactionType(TransactionTypeEnum.Payment, 'Policy Payment')];
  tranfertypeSelected = false;
  isReversalTransfertype = false;
  maxAmountAllowed = 0;
  isLoadingDebtorPolicies$ = new BehaviorSubject<boolean>(false);
  isProcessingPaymentTransfer$ = new BehaviorSubject<boolean>(false);
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  documentSet = DocumentSetEnum.InterdebtorTransfer;
  requiredDocumentsUploaded = false;
  documentKeyValue: string = '';
  readonly startDate = moment(new Date()).add(-12, 'months');
  selectedDebtor: AccountSearchResult = null;
  debtorPolicies: Policy[] = []
  currentPolicyBilling: PolicyPaymentTransaction = null;
  transferableTransactions: PolicyPaymentAllocation[] = [];
  selectedTransactionToTransferFrom: PolicyPaymentAllocation = null;
  uploadingDocs: boolean = false;
  displayedColumns: string[] = ['select', 'createdDate', 'createdBy', 'amount', 'transactionType', 'reason'];
  paymentTransactionFormArry: FormArray;

  constructor(
    public readonly router: Router,
    public readonly formbuilder: UntypedFormBuilder,
    public policyService: PolicyService,
    public billingService: BillingService,
    public transactionService: TransactionsService,
    private authService: AuthService,
    private readonly toastr: ToastrManager,
    private readonly confirmService: ConfirmationDialogsService,
  ) { }

  ngOnInit(): void {
    this.initializeFormControls();

    this.form.controls["fromPolicyDebtorNumber"].valueChanges.subscribe(() => {
      this.onFetchPolicyTransactions();
    })

    this.form.controls["fromBillingMonth"].valueChanges.subscribe(() => {
      this.onFetchPolicyTransactions();
    });
  }

  initializeFormControls() {
    this.form = this.formbuilder.group({
      fromPolicyDebtorNumber: [null, Validators.required],
      fromBillingMonth: [null, Validators.required],
      fromTransaction: [null, [Validators.required]],
      transferAmount: ['0', [Validators.required]],
      toPolicyDebtorNumber: [null, Validators.required],
      toBillingMonth: [null, Validators.required],
      notes: [null],
    });
  }
  transactionTypeChanged($event: any) {
    this.selectedTransactionTypeId = $event.value;
    this.tranfertypeSelected = true;
    if (this.selectedTransactionTypeId == +TransactionTypeEnum.PaymentReversal) {
      this.isReversalTransfertype = true;
    }
  }

  onSubmitClicked(): void {

    if (!this.form.valid || !this.canTransferPayment()) {
      return;
    }

    let toPolicyNumber = this.debtorPolicies.find(p => p.policyId === this.form.controls['toPolicyDebtorNumber'].value).policyNumber;
    let fromPolicyNumber = this.debtorPolicies.find(p => p.policyId === this.form.controls['fromPolicyDebtorNumber'].value).policyNumber;
    this.confirmService.confirmWithoutContainer('Transfer', `Please confirm transfer of R ${this.form.controls['transferAmount'].value} from policy ${fromPolicyNumber} to policy ${toPolicyNumber}`, 'Center', 'Center', 'Yes', 'No').subscribe(dialogResult => {
      if (dialogResult === true) {
        const currentUser = this.authService.getCurrentUser();
        this.isProcessingPaymentTransfer$.next(true);
        let input = new TransferPaymentFromPolicyToPolicyRequest()
        input.rolePlayerId = this.selectedDebtor.rolePlayerId;
        input.amountToTransfer = this.form.controls['transferAmount'].value;
        input.fromPolicyBillingMonth = this.form.controls['fromBillingMonth'].value;
        input.fromPolicyId = this.form.controls['fromPolicyDebtorNumber'].value;
        input.toPolicyBillingMonth = this.form.controls['toBillingMonth'].value;
        input.toPolicyId = this.form.controls['toPolicyDebtorNumber'].value;
        input.notes = this.form.controls['notes'].value;
        input.fromPaymentAllocationId = this.selectedTransactionToTransferFrom.id;
        this.billingService.transferPaymentFromPolicyToPolicy(input).subscribe(r => {
          this.isProcessingPaymentTransfer$.next(false);
          if (r) {
            this.clearControls();
            this.toastr.successToastr('Payment transferred successfully...');
          } else {
            this.toastr.errorToastr('Payment transfer Failed...');
          }
        }, err => {
          this.isProcessingPaymentTransfer$.next(false);
          this.toastr.errorToastr('Payment transfer Failed...' + err.error.Error);
        });
      }
    });

  }

  clearControls(): void {
    this.form.reset();
    this.currentPolicyBilling = null;
    this.debtorPolicies = [];
    this.selectedDebtor = null;
    this.transferableTransactions = [];
    this.selectedTransactionToTransferFrom = null;
  }

  onDedtorSelected($event: AccountSearchResult) {
    this.isLoadingDebtorPolicies$.next(true);
    this.selectedDebtor = $event;
    this.policyService.getOnlyPoliciesByRolePlayer(this.selectedDebtor.rolePlayerId).subscribe(p => {
      this.isLoadingDebtorPolicies$.next(false);
      if (p) {
        this.debtorPolicies = p;
      }

    }, err => {

      this.isLoadingDebtorPolicies$.next(false);
    });
  }

  onFetchPolicyTransactions(): void {
    const policyId = this.form.controls['fromPolicyDebtorNumber'].value;
    const billingMonth = this.form.controls['fromBillingMonth'].value;
    if (policyId === 0 || billingMonth === null) {
      return;
    }
    this.isLoadingDebtorPolicies$.next(true);
    this.billingService.getPolicyBillingTransactions(policyId, billingMonth).subscribe(data => {
      this.isLoadingDebtorPolicies$.next(false);
      this.currentPolicyBilling = data;
      this.transferableTransactions = this.getTransactionsToTransfer();
      if (this.transferableTransactions.length > 0) {
        this.paymentTransactionFormArry = new FormArray(
          this.transferableTransactions.map(
            (x: any) =>
              new FormGroup({
                isSelected: new FormControl(x.isSelected === 'yes' ? true : false),
              })))
      }

    }, err => {
      this.isLoadingDebtorPolicies$.next(false);
    });

  }

  canTransferPayment(): boolean {
    if (this.uploadingDocs) {
      this.toastr.warningToastr('Document(s) upload in progress...');
      return false;
    }

    let fromPolicyNumber = this.form.controls['fromPolicyDebtorNumber'].value;
    let toPolicyNumber = this.form.controls['toPolicyDebtorNumber'].value;
    if (fromPolicyNumber === toPolicyNumber) {
      this.toastr.warningToastr('From and To policy numbers cannot be the same.');
      return false;
    }
    if (this.selectedTransactionToTransferFrom === null) {
      this.toastr.warningToastr('Transaction to transfer from not selected.');
      return false;

    }
    let amountToTranfer = this.form.controls['transferAmount'].value;
    if (amountToTranfer === '0' || amountToTranfer === ' ') {
      this.toastr.warningToastr('Transfer amount cannot be zero.');
      return false;
    }

    if (this.selectedTransactionToTransferFrom.amount < amountToTranfer) {
      this.toastr.warningToastr('Transfer amount cannot be more than available balance.');
      return false;
    }

    return true;
  }

  documentUploading($event: boolean): void {
    this.uploadingDocs = $event;
  }

  getTransactionsToTransfer(): PolicyPaymentAllocation[] {

    let toReturn: PolicyPaymentAllocation[] = [];

    if (this.currentPolicyBilling === undefined || this.currentPolicyBilling === null) {
      return toReturn;
    }

    if (this.currentPolicyBilling.allocations === null || this.currentPolicyBilling.allocations.length === 0) {
      return toReturn;
    }

    this.currentPolicyBilling.allocations.forEach(a => {
      if (!a.isDeleted && a.transactionTypeLinkId === 2) {
        toReturn.push(a);
      }

    });
    return toReturn;
  }

  mapBillingAllocationType(billingAllocationType: BillingAllocationTypeEnum): string {

    return this.formatLookup(BillingAllocationTypeEnum[+billingAllocationType]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');

  }

  getControl(index: number, controlName: string): FormControl {
    return (this.paymentTransactionFormArry.at(index) as FormGroup).get(controlName) as FormControl;
  }

  checked($event, i): void {

    if ($event.checked) {
      let index = 0;
      this.transferableTransactions.forEach(a => {

        if (index !== i) {
          this.getControl(i, 'isSelected').disable();
        }

      })
      const amount = this.transferableTransactions[i].amount;
      this.form.controls['fromTransaction'].patchValue(amount);
      this.form.controls['fromTransaction'].disable();
      this.selectedTransactionToTransferFrom = this.transferableTransactions[i];

    } else {
      this.transferableTransactions.forEach(a => {
        this.getControl(i, 'isSelected').enable();
        this.selectedTransactionToTransferFrom = null;

      })
      this.form.controls['fromTransaction'].patchValue(0);

    }

  }

}
