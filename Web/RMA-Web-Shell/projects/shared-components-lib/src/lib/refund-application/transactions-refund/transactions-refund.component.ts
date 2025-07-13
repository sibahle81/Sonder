import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WizardService } from '../../wizard/shared/services/wizard.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { DebtorSearchResult } from '../../models/debtor-search-result';
import { RolePlayerBankingDetail } from '../../models/banking-details.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DocumentsComponent } from '../../documents/documents.component';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PolicyProductCategory } from 'projects/fincare/src/app/billing-manager/models/policy-product-category';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { refundRmaBankAccountAmount } from 'projects/fincare/src/app/billing-manager/models/refundRmaBankAccountAmounts';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { BillingService } from 'projects/fincare/src/app/billing-manager/services/billing.service';

@Component({
  selector: 'transactions-refund',
  templateUrl: './transactions-refund.component.html',
  styleUrls: ['./transactions-refund.component.css']
})
export class TransactionsRefundComponent implements OnInit, AfterViewInit {
  @Input() rolePlayer: RolePlayer;
  @Output() amount = new EventEmitter<number>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isAllTransactionsSelected$ = new BehaviorSubject(false);
  datasourceRefundBreakDown = new MatTableDataSource<{ rmaBankAccountNumber: string, refundAmount: number }>();
  currentQuery: string;
  rowCount: number;
  form: FormGroup;
  selectedTransactions: Transaction[] = [];
  transactions: Transaction[];
  policyId: number;
  selectedTabIndex = 0;
  selectedPolicyIds = [];
  selectedTransactionIds = [];
  refundTypes: { id: number, name: string }[] = [];
  refundType: RefundTypeEnum;
  refundBankAccounAmounts: refundRmaBankAccountAmount[] = [];
  rmaBankAccounts: RmaBankAccount[] = [];
  debtorSearchResult: DebtorSearchResult;
  requestCode: string;
  transactiontypeText: string;
  refundDocSet = 0;
  fullRefundAmount = 0;
  showAmountInput = false;
  showTransactions = false;
  canEditAmount = false;
  canUpdateAmount = false;
  refundWizardinProgress = false;
  wizardInProgressName = '';
  searchFailedMessage = '';
  backLink = '/fincare/billing-manager';
  rolePlayerBankingDetails: RolePlayerBankingDetail[];
  selectedPolicies: PolicyProductCategory[] = [];
  showOwnAmount: boolean;
  message: string;
  refundableAmount: number;
  netBalance: number;
  refundAmount = 0;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  hideButtons = false;
  hasPermission: boolean; 

  createRefundPermission = 'Create Refund';

  displayedColumns = ['transactionType', 'documentNumber', 'transactionAmount', 'balance', 'refundAmount', 'documentDate', 'action'];
  datasource = new MatTableDataSource<Transaction>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @ViewChild(DocumentsComponent, { static: false }) documentsComponent: DocumentsComponent;
  requiredDocumentsUploaded: any;
  canSubmit = false;

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly transactionService: TransactionsService,
    private readonly toastr: ToastrManager,
    private readonly lookupService: LookupService,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly billingService: BillingService,
    private readonly formbuilder: FormBuilder
    ) { }

    ngAfterViewInit(): void {
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    }

  ngOnInit(): void {
    this.rolePlayerBankingDetails = new Array();
    this.refundTypes = this.ToKeyValuePair(RefundTypeEnum).filter(c => c.id == +RefundTypeEnum.Adjustment
      || c.id == +RefundTypeEnum.Overpayment
      || c.id == +RefundTypeEnum.PolicyCancellation
      || c.id == +RefundTypeEnum.PolicyReclassification
      || c.id == +RefundTypeEnum.CreditBalance);
    this.interBankTransferService.getRmaBankAccounts().subscribe(data => {
      if (data) {
        this.rmaBankAccounts = data;
      }
    });
    this.createForm();
  }

  createForm() {
    this.form = this.formbuilder.group({
      partialAmount: [null],
    });
  }

  getTransactions() {
    this.isLoading$.next(true);
    this.transactionService.getTransactionsForRefund(this.rolePlayer.rolePlayerId, this.selectedPolicyIds).subscribe(results => {
      this.transactions = results;
      this.datasource.data = this.transactions;
      this.isLoading$.next(false);
    }, error => { 
      this.message = 'No credit transaction found for refund';
      this.isLoading$.next(false); 
    });
  }

  getDebtorNetBalance() {
    this.transactionService
      .getDebtorNetBalance(this.rolePlayer.rolePlayerId)
      .subscribe((debtorNetBalance) => {
        this.netBalance = debtorNetBalance;
      });
  }

  getAccountType(accountTypeId: number): string {
    if (!accountTypeId || accountTypeId === 0) { return 'unknown'; }
    return (BankAccountTypeEnum[accountTypeId].replace(/([a-z])([A-Z])/g, '$1 $2'));
  }

  getTransactionTypeText(typeId: number) {
    switch (typeId) {
      case TransactionTypeEnum.CreditNote:
        this.transactiontypeText = TransactionTypeEnum[4];
        return this.transactiontypeText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
      case TransactionTypeEnum.Payment:
        this.transactiontypeText = TransactionTypeEnum[3];
        return this.transactiontypeText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }
  }

  toggleSubmit() {
    if (this.selectedTransactions.length > 0) {
      this.submitDisabled$.next(false);
    } else {
      this.submitDisabled$.next(true);
    }
  }

  transactionSelected($event: Transaction, partialAmount = 0) {
    this.message = '';

    const index = this.selectedTransactions.indexOf($event);

    if (index <= -1) {
      if (partialAmount > 0) {
        $event.refundAmount = partialAmount;
        this.populateAmount(partialAmount);
        $event.balance = $event.balance - partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = $event.balance;
      } else {
         if ($event.amount < $event.balance) {
          this.message = 'You cannot refund more than the balance';
          return;
        }

        $event.refundAmount = $event.balance;
        this.populateAmount($event.balance);
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = $event.balance;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = 0;
      }
    } else {
      $event.balance = $event.originalUnallocatedAmount;
      $event.refundAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = 0;
      this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = $event.balance;
    }

    index > -1 ? this.selectedTransactions.splice(index, 1) : this.selectedTransactions.push($event);

    this.toggleSubmit();
  }

  toggleOwnAmount(tran: Transaction) {
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

  populateAmount(amount: number) {
    this.amount.emit(amount);
  }

  getDocumentNumber(tran: Transaction): string {
    if (tran.rmaReference && tran.rmaReference !== '') {
      return tran.rmaReference;
    } else {
      return tran.bankReference;
    }
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.selectedPolicyIds = [...policies.map(p => p.policyId)];
  }

  setTotalRefund() {
    this.refundBankAccounAmounts = [];
    const total = this.selectedTransactions.reduce((a, b) => a + b.refundAmount, 0);
    this.enableFormControl('amount');
    this.form.get('amount').setValue(total);

    if (this.selectedTransactions.length > 0) {
      this.selectedTransactions.forEach(c => {
        const account = new refundRmaBankAccountAmount();
        account.amount = c.refundAmount; account.rmaBankAccountId = c.rmaBankAccountId; account.policyId = c.policyId; account.transactionId = c.transactionId; 
        account.accountNumber = this.rmaBankAccounts
                                    .find(y => y.rmaBankAccountId == c.rmaBankAccountId).accountNumber
        this.refundBankAccounAmounts.push(account);
      }
      );
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

  transactionsAllChecked(event: any) {
    if (event.checked) {
      this.isAllTransactionsSelected$.next(true);
      this.selectedTransactionIds = [];
      this.selectedTransactions = [];
      [...this.datasource.data].forEach(item => {
        this.selectedTransactionIds.push(item.transactionId);
        this.selectedTransactions.push(item);
      });
    } else {
      this.selectedTransactionIds = [];
      this.selectedTransactions = [];
      this.isAllTransactionsSelected$.next(false);
    }
    this.setTotalRefund();
  }

  resetForm() {
    this.selectedTransactionIds = [];
    this.selectedTransactions = [];
    this.datasource.data = [];
    this.form.get('amount').setValue(null);
    this.fullRefundAmount = 0;
    this.showTransactions = false;
    this.datasourceRefundBreakDown.data = [];
  }

  toggleEditUpdate() {
    if (this.canEditAmount) {
      this.canEditAmount = false;
      this.canUpdateAmount = true;
      return;
    }
    else if (this.canUpdateAmount) {
      this.canUpdateAmount = false;
      this.canEditAmount = true;
    }
  }

  editAmount() {
    this.enableFormControl('amount');
    this.toggleEditUpdate();
  }

  refundTypeChanged(event: RefundTypeEnum) {
    this.resetForm();
    if (event === +RefundTypeEnum.Overpayment) {
      this.refundType = RefundTypeEnum.Overpayment;
      this.getTransactions();
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = false;
      this.showTransactions = true;
      this.canEditAmount = false;
    }
    else if (event === +RefundTypeEnum.PolicyReclassification) {
      this.refundType = RefundTypeEnum.PolicyReclassification;
      this.refundDocSet = DocumentSetEnum.CoidPolicyRefund;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    else if (event === +RefundTypeEnum.PolicyCancellation) {
      this.refundType = RefundTypeEnum.PolicyCancellation;
      this.refundDocSet = DocumentSetEnum.PolicyCancellation;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    if (event === +RefundTypeEnum.CreditBalance) {
      this.refundType = RefundTypeEnum.CreditBalance;
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    }
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  transactionChecked(event: any, item: Transaction) {
    if (event.checked) {
      this.selectedTransactionIds.push(item.transactionId);
      item.refundAmount = item.balance;
      this.selectedTransactions.push(item);
    } else {
      this.isAllTransactionsSelected$.next(false);
      this.unTickTransactionItem(item.transactionId);
    }
    this.setTotalRefund();
  }

  unTickTransactionItem(itemId: number) {
    for (let i = 0; i < this.selectedTransactionIds.length; i++) {
      if ((this.selectedTransactionIds[i] === itemId)) {
        this.selectedTransactionIds.splice(i, 1);
        const itemIndex = this.selectedTransactions.findIndex(c => c.transactionId === itemId);
        this.selectedTransactions.splice(itemIndex, 1);
        break;
      }
    }
    this.setTotalRefund();
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
    if (this.requiredDocumentsUploaded) {
      if (this.fullRefundAmount > 0) {
        this.canSubmit = true;
      }
    }
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }


}
