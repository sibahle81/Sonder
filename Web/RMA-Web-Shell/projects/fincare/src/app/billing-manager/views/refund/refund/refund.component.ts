import { Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Refund } from '../../../models/refund';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { RefundTransaction } from '../../../models/refund-transactions';
import { Transaction } from '../../../models/transaction';
import { TransactionsService } from '../../../services/transactions.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { InterBankTransferService } from '../../../services/interbanktransfer.service';
import { RmaBankAccount } from '../../../models/rmaBankAccount';
@Component({
  selector: 'app-refund',
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css']
})
export class RefundComponent extends WizardDetailBaseComponent<Refund> {
  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  minDate: Date;
  documentSet: DocumentSetEnum; // default
  reasons: Lookup[];
  isLoadingReasons = false;
  requestCode: string;
  transactions: Transaction[];
  showOwnAmount: boolean;
  message: string;
  refundableAmount: number;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  hideButtons = false;
  selectedTransactions: RefundTransaction[] = [];
  showAddBanking = false;
  accountValidationErrorMsg = '';
  verifyingBank$ = new BehaviorSubject(false);
  branchCode = '0';
  accountNumber = '';
  bankAccountTypes: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  bankAccountType = 8;
  editClientEmail = false;
  accountHolderName = 'unknown';
  accountNumberPopulated = new BehaviorSubject(false);
  cleintEmailPopulated = new BehaviorSubject(false);
  wizardId: number;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  rolePlayer: RolePlayer;
  finPayeNumber: string;
  rolePlayerBankingId = 0;

  displayedColumns = ['transactionType', 'documentNumber', 'transactionAmount', 'balance', 'refundAmount', 'transactionDate'];
  datasource = new MatTableDataSource<RefundTransaction>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  refundReason: string;
  displayedBreakDownColumns = ['rmaBankAccountNumber', 'refundAmount'];
  datasourceRefundBreakDown = new MatTableDataSource<{ rmaBankAccountNumber: string, refundAmount: number }>();
  @ViewChild('sort2') sort2: MatSort;

  constructor(
    private readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager,
    private readonly integrationService: IntegrationService, private readonly rolePlayerService: RolePlayerService, private readonly interBankTransferService: InterBankTransferService) {
    super(appEventsManager, authService, activatedRoute);
    this.minDate = new Date();
  }


  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.datasourceRefundBreakDown.sort = this.sort2;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.rolePlayerBankingId === 0) {
      validationResult.errorMessages.push('Refund Banking details are mandatory');
      validationResult.errors++;
    }
    return validationResult;
  }

  onLoadLookups(): void {
  }

  getTransactions() {
    const refundTransactions = [];
    [...this.model.partialRefundTransactions].forEach(c => {
      let refund = new RefundTransaction();
      refund.amount = c.amount;
      refund.balance = c.balance;
      refund.refundAmount = c.refundAmount;
      refund.bankReference = c.rmaReference;
      refund.transactionType = c.transactionType;
      refund.transactionDate = c.transactionDate;
      refundTransactions.push(refund);
      this.datasource.data = [...refundTransactions];
    }
    );
  }

  populateForm() {
    this.wizardId = this.context.wizard.id;
    if (this.model) {
      this.finPayeNumber = this.model.finPayeNumber;
      this.getRolePlayer();
      this.requestCode = this.model.requestCode;
      if (!this.model.note) {
        const note = new Note();
        this.model.note = note;
      }
      if (this.model.trigger === RefundTypeEnum.Transactional) {
        this.selectedTransactions = this.model.partialRefundTransactions;
        this.getTransactions();
      }
      this.setReasons(this.model.trigger);
      this.getDocumentSet(this.model.trigger);
    }

    if (this.model.refundRmaBankAccountAmounts && this.model.refundRmaBankAccountAmounts.length > 0) {
      this.groupRefundBankAccounts();
    }
    this.form.patchValue({
      refundAmount: parseFloat(this.model.refundAmount.toFixed(2)),
      refundDate: !this.model.refundDate ? new Date() : this.model.refundDate,
      refundNote: this.model.note.text
    });

    if (this.model.groupEmail) {
      this.form.get('groupEmail').setValue(this.model.groupEmail);
    }

    if (this.model.clientEmail) {
      this.form.get('clientEmail').setValue(this.model.clientEmail);
    }

    this.showAddBanking = this.model && this.model.rolePlayerBankingId && this.model.rolePlayerBankingId > 0 ? true : false;
    this.disableFormControl('groupEmail');
  }

  populateModel() {
    if (!this.model.note) {
      const note = new Note();
      this.model.note = note;
    }

    this.model.refundDate = this.form.value.refundDate;
    this.model.note.text = this.form.value.refundNote;
    this.model.requestCode = this.requestCode;
    this.model.partialRefundTransactions = this.selectedTransactions;
    this.model.clientEmail = this.form.get('clientEmail').value;
    this.model.groupEmail = this.form.get('groupEmail').value;
  }

  createForm() {
    this.form = this.formbuilder.group({
      refundDate: [null, [Validators.required]],
      refundNote: [null],
      groupEmail: [null],
      clientEmail: [null],
    });
  }

  getAccountType(accountTypeId: number): string {
    if (!accountTypeId || accountTypeId === 0) { return 'unknown'; }
    return (BankAccountTypeEnum[accountTypeId].replace(/([a-z])([A-Z])/g, '$1 $2'));
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  getDocumentSet(trigger: number) {
    switch (trigger) {
      case RefundTypeEnum.PolicyInception:
        this.documentSet = DocumentSetEnum.PolicyMaintanance;
        break;
      case RefundTypeEnum.PolicyCancellation:
        this.documentSet = DocumentSetEnum.PolicyCancellation;
        break;
      case RefundTypeEnum.Overpayment:
        this.documentSet = DocumentSetEnum.MaintainRefundOverpayment;
        break;
      case RefundTypeEnum.PolicyReclassification:
        this.documentSet = DocumentSetEnum.CoidPolicyRefund;
        break;
    }
  }

  setReasons(trigger: number) {
    switch (trigger) {
      case RefundTypeEnum.PolicyInception:
        this.refundReason = this.splitPascalCaseWord(RefundTypeEnum[RefundTypeEnum.PolicyInception]);
        break;
      case RefundTypeEnum.PolicyCancellation:
        this.refundReason = this.splitPascalCaseWord(RefundTypeEnum[RefundTypeEnum.PolicyCancellation]);
        break;
      case RefundTypeEnum.Overpayment:
        this.refundReason = this.splitPascalCaseWord(RefundTypeEnum[RefundTypeEnum.Overpayment]);
        break;
      case RefundTypeEnum.PolicyReclassification:
        this.refundReason = this.splitPascalCaseWord(RefundTypeEnum[RefundTypeEnum.PolicyReclassification]);
        break;
        case RefundTypeEnum.CreditBalance:
          this.refundReason = this.splitPascalCaseWord(RefundTypeEnum[RefundTypeEnum.CreditBalance]);
          break;
          case RefundTypeEnum.TermsOverPayment:
            this.refundReason = this.splitPascalCaseWord(RefundTypeEnum[RefundTypeEnum.TermsOverPayment]);
            break;
    }
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  getDocumentNumber(tran: RefundTransaction): string {
    if (tran.rmaReference && tran.rmaReference !== '') {
      return tran.rmaReference;
    } else {
      return tran.bankReference;
    }
  }

  transactionSelected($event: Transaction, partialAmount = 0) {
    if (this.context.wizard.wizardStatusId !== WizardStatus.Disputed && this.context.wizard.wizardStatusId !== WizardStatus.InProgress) {
      return;
    }

    this.message = '';

    const result = this.selectedTransactions.find(tran => tran.transactionId === $event.transactionId);

    if (!result) {
      if (partialAmount > 0) {
        $event.refundAmount = partialAmount;
        $event.balance = $event.balance - partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = $event.balance;
      } else {
        if ($event.amount > $event.balance) {
          this.message = 'You cannot refund more than the balance';
          return;
        }

        $event.refundAmount = $event.amount;
        $event.balance = 0;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = $event.amount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = 0;
      }
    } else {
      $event.balance = $event.originalUnallocatedAmount;
      $event.refundAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = $event.balance;
    }

    result ? this.selectedTransactions = this.selectedTransactions.filter(tran => tran.transactionId !== $event.transactionId) :
      this.addRefundTransaction($event);

    this.form.patchValue({
      refundAmount: this.selectedTransactions.reduce((sum, current) => sum + current.refundAmount, 0)
    });
  }

  addRefundTransaction(t: Transaction) {
    const partialRefundTran = new RefundTransaction();
    partialRefundTran.transactionId = t.transactionId;
    partialRefundTran.transactionDate = t.transactionDate;
    partialRefundTran.amount = t.amount;
    partialRefundTran.refundAmount = t.refundAmount;
    partialRefundTran.balance = t.balance;
    partialRefundTran.rmaReference = t.rmaReference;
    partialRefundTran.bankReference = t.bankReference;
    partialRefundTran.rolePlayerId = t.rolePlayerId;
    partialRefundTran.transactionType = t.transactionType;
    this.selectedTransactions.push(partialRefundTran);
  }

  toggleOwnAmount(tran: Transaction) {
    if (this.context.wizard.wizardStatusId !== WizardStatus.Disputed && this.context.wizard.wizardStatusId !== WizardStatus.InProgress) {
      return;
    }

    this.message = '';
    if (tran) {
      this.refundableAmount = tran.balance;

      if (this.refundableAmount <= 0) {
        this.message = 'Available balance depleted';
        return;
      }

      this.lastSelectedPartialTranId = tran.transactionId;
      this.maxAmountAllowed = this.refundableAmount;
    } else {
      this.lastSelectedPartialTranId = 0;
      this.maxAmountAllowed = 0;
    }
    this.showOwnAmount = !(this.showOwnAmount);
  }

  addPartialAmount() {
    if (this.context.wizard.wizardStatusId !== WizardStatus.Disputed && this.context.wizard.wizardStatusId !== WizardStatus.InProgress) {
      return;
    }

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
  }

  isTransactionSelected(tran: Transaction): boolean {
    if (this.selectedTransactions) {
      return this.selectedTransactions.filter(t => t.transactionId === tran.transactionId).length > 0;
    } else { return false; }
  }

  showAddBankingDetails() {
    if (this.showAddBanking) {
      this.showAddBanking = false;
    } else {
      this.showAddBanking = true;
    }
  }

  addEmail() {
    if (this.form.get('clientEmail')) {
      this.model.clientEmail = this.form.get('clientEmail').value;
      this.toastr.successToastr('client email successfully saved/updated');
      this.populateForm();
    } else {
      this.toastr.errorToastr('please provide client email');
    }
  }


  editEmail() {
    this.form.get('clientEmail').enable();
  }

  cancelBankAdd() {
    this.showAddBanking = false;
  }

  logAccountNumberPopulated(accountNumber: string) {
    if (accountNumber.length > 3) {
      this.accountNumberPopulated.next(true);
    } else {
      this.accountNumberPopulated.next(false);
    }
  }

  logClientEmailPopulated() {
    if (this.form.get('clientEmail').valid) {
      this.cleintEmailPopulated.next(true);
    } else {
      this.cleintEmailPopulated.next(false);
    }
  }

  getRolePlayer() {
    this.rolePlayerService.getRolePlayer(this.model.rolePlayerId).subscribe(result => {
      if (result) this.rolePlayer = result;
    });
  }

  setBankAccount($event: RolePlayerBankingDetail) {
    if ($event && $event.rolePlayerBankingId && $event.rolePlayerBankingId > 0) {
      this.model.rolePlayerBankingId = $event.rolePlayerBankingId;
      this.rolePlayerBankingId = $event.rolePlayerBankingId;
    }
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }

  groupRefundBankAccounts() {
    const grouped: { accountId: number, accountNumber: string, refundAmount: number }[] = [];
    this.model.refundRmaBankAccountAmounts.forEach(element => {
      if (grouped.findIndex(c => c.accountId === element.rmaBankAccountId) < 0) {
        grouped.push({
          accountId: element.rmaBankAccountId,
          accountNumber: element.accountNumber,
          refundAmount: element.amount
        });
      }
      else {
        grouped.find(c => c.accountId === element.rmaBankAccountId).refundAmount += element.amount;
      }
    });
    const results: { rmaBankAccountNumber: string, refundAmount: number }[] = [];
    grouped.forEach(element => {
      results.push({ rmaBankAccountNumber: element.accountNumber, refundAmount: element.refundAmount });
    });
    this.datasourceRefundBreakDown.data = [...results];
  }
}
