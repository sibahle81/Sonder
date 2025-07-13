import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionTypeEnum } from '../../../shared/enum/transactionTypeEnum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Refund } from '../../models/refund';
import { RefundTypeEnum } from '../../../shared/enum/refund-type.enum';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { DocumentsComponent } from '../documents/documents.component';
import { BehaviorSubject } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { Transaction } from '../../models/transaction';
import { TransactionsService } from '../../services/transactions.service';
import { RefundTransaction } from '../../models/refund-transactions';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { PolicyProductCategory } from '../../models/policy-product-category';
import { MatDialog } from '@angular/material/dialog';
import { RefundPartialDialogComponent } from './refund-partial-dialog/refund-partial-dialog.component';
import { refundRmaBankAccountAmount } from '../../models/refundRmaBankAccountAmounts';
import { InterBankTransferService } from '../../services/interbanktransfer.service';
import { RmaBankAccount } from '../../models/rmaBankAccount';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { BillingService } from '../../services/billing.service';
import { DebtorProductCategoryBalance } from '../../models/debtor-product-category-balance';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { ReclassificationRefundBreakDown } from '../../models/reclassification-refund-break-down';
import { CancellationRefundBreakDown } from '../../models/cancellation-refund-breakdown';
import { TermArrangementService } from '../../../shared/services/term-arrangement.service';
import { TermScheduleRefundBreakDown } from '../../models/termschedule-refund-breakdown';
import { BankAccountService } from 'projects/shared-services-lib/src/lib/services/bank-account/bank-account.service';
import { BankAccount } from 'projects/shared-models-lib/src/lib/common/bank-account';
@Component({
  selector: 'app-transactions-refund',
  templateUrl: './transactions-refund.component.html',
  styleUrls: ['./transactions-refund.component.css']
})
export class TransactionsRefundComponent implements OnInit, AfterViewInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  currentQuery: string;
  rowCount: number;
  form: UntypedFormGroup;
  selectedTransactions: Transaction[] = [];
  transactions: Transaction[];
  policyId: number;
  rolePlayerId = 0;
  selectedTabIndex = 0;
  policyNumber = '';
  rolePlayerName = '';
  debtorSearchResult: DebtorSearchResult;
  requestCode: string;
  transactiontypeText: string;
  refundWizardinProgress = false;
  wizardInProgressName = '';
  searchFailedMessage = '';
  backLink = '/fincare/billing-manager';
  rolePlayerBankingDetails: RolePlayerBankingDetail[];
  showOwnAmount: boolean;
  message: string;
  refundableAmount: number;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  hideButtons = false;
  hasPermission: boolean;
  createRefundPermission = 'Create Refund';
  refundTypes: { id: number, name: string }[] = [];
  showTransactions = false;
  isAllTransactionsSelected$ = new BehaviorSubject(false);
  selectedTransactionIds = [];
  documentKeyValue = '';
  refundDocSet = 0;
  showAmountInput = false;
  interdebtorDocSet = DocumentSetEnum.InterdebtorTransfer;
  canEditAmount = false;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  fullRefundAmount = 0;
  fullRefundableAmount = 0;
  refundType: RefundTypeEnum;
  selectedPolicyIds = [];
  isLoadingRefundAmount$ = new BehaviorSubject(false);
  isLoadingClaimRecoveriesBalance$ = new BehaviorSubject(false);
  canUpdateAmount = false;
  refundBankAccounAmounts: refundRmaBankAccountAmount[] = [];
  selectedPolicies: PolicyProductCategory[] = [];
  rmaBankAccounts: BankAccount[] = [];
  displayedColumns = ['transactionType', 'documentNumber', 'transactionAmount', 'balance', 'refundAmount', 'documentDate', 'action'];
  displayedBreakDownColumns = ['rmaBankAccountNumber', 'refundAmount'];
  displayedColumnsReclassification = ['bankAccountNumber', 'balance', 'claimsTotal', 'refundAmount'];
  displayedColumnsCancellation = ['bankAccountNumber', 'policyNumber', 'refundAmount'];
  displayedTermsColumns = ['transactionType', 'reference', 'amount', 'overpayment', 'transactionDate', 'action'];
  datasource = new MatTableDataSource<Transaction>();
  datasourceRefundBreakDown = new MatTableDataSource<{ rmaBankAccountNumber: string, refundAmount: number }>();
  datasourceReclassification = new MatTableDataSource<ReclassificationRefundBreakDown>();
  datasourceCancellation = new MatTableDataSource<CancellationRefundBreakDown>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('sort2') sort2: MatSort;
  @ViewChild('sort3') sort3: MatSort;

  @ViewChild(DocumentsComponent, { static: false }) documentsComponent: DocumentsComponent;
  requiredDocumentsUploaded: any;
  canSubmit = false;
  hasRefundableCreditBalance = false;
  creditBalanceChecked = false;
  periodIsValid = false;
  selectedPeriodStatus: PeriodStatusEnum;
  showPeriodControl = true;
  refundableCreditBalance = 0;
  debtorProductCategoryBalances: DebtorProductCategoryBalance[] = [];
  showDebtorPolicies = false;
  termScheduleRefundBalances: TermScheduleRefundBreakDown[] = [];
  datasourceTerms= new MatTableDataSource<TermScheduleRefundBreakDown>();
  selectedTermsTransactions: TermScheduleRefundBreakDown[] = [];
  selectedTermsTransactionIds = [];
  debtorClaimRecoveryBalance : number = undefined;

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly transactionService: TransactionsService,
    private readonly billingService: BillingService,
    private readonly toastr: ToastrManager,
    private readonly formbuilder: UntypedFormBuilder, public dialog: MatDialog, private readonly interBankTransferService: InterBankTransferService,
    private readonly termArrangementService: TermArrangementService,
    private readonly bankAccountService: BankAccountService) { }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.datasourceRefundBreakDown.sort = this.sort2;
    this.datasourceCancellation.sort = this.sort3;
  }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.createRefundPermission);
    this.rolePlayerBankingDetails = new Array();
    this.refundTypes = this.ToKeyValuePair(RefundTypeEnum).filter(c =>  c.id == +RefundTypeEnum.Overpayment
      || c.id == +RefundTypeEnum.PolicyCancellation
      || c.id == +RefundTypeEnum.PolicyReclassification || c.id == +RefundTypeEnum.TermsOverPayment);
    this.documentKeyValue = this.generateUUID();
    this.bankAccountService.getBankAccounts().subscribe(data => {
      if (data) {
        this.rmaBankAccounts = data;
      }
    });
    this.createForm();
  }

  createForm() {
    this.form = this.formbuilder.group({
      partialAmount: [null],
      refundTypeId: [null],
      amount:  [null,
        [Validators.required, 
        (control: AbstractControl) => Validators.max(this.fullRefundableAmount)(control)]
      ],
      debtorClaimRecoveryBalance: [{ value:'', disabled: true}],
    });
    this.disableFormControl('amount');
  }

  getTransactions() {
    this.isLoading$.next(true);
    this.transactionService.getTransactionsForRefund(this.rolePlayerId, this.selectedPolicyIds).subscribe(results => {
      if (results && results.length > 0) {
        this.transactions = results;
        this.datasource.data = this.transactions;
        this.isLoading$.next(false);
      }
      else {
        this.message = 'No credit transactions found for refund';
        this.isLoading$.next(false);
      }

    }, error => { this.toastr.errorToastr(error.message); this.isLoading$.next(false); });
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

  submitRefunds() {

    if(this.form.valid)
      {
        this.isSubmitting$.next(true);
        this.validateNoExistingWizardsExist();
      }
  }

  validateNoExistingWizardsExist() {
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.rolePlayerId, 'refund')
      .subscribe(data => {
        if (data[0]) {
          if (data[0].id > 0) {
            this.refundWizardinProgress = true;
            this.wizardInProgressName = data[0].name;
            this.isSubmitting$.next(false);
          } else {
            this.refundWizardinProgress = false;
            const startWizardRequest = new StartWizardRequest();
            this.instantiateRefundWizard(startWizardRequest);
            console.log(startWizardRequest.data);
            this.createWizard(startWizardRequest);
            this.isSubmitting$.next(false);
          }
        } else {
          this.refundWizardinProgress = false;
          const startWizardRequest = new StartWizardRequest();
          this.instantiateRefundWizard(startWizardRequest);
          console.log(startWizardRequest.data);
          this.createWizard(startWizardRequest);
          this.isSubmitting$.next(false);
        }
      }
      );
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.submitDisabled$ = new BehaviorSubject(true);
    this.wizardService.startWizard(startWizardRequest).subscribe(
      wizard => {
        this.toastr.successToastr('Refund task has created successfully.', '', true);
        this.submitDisabled$ = new BehaviorSubject(false);
        if (wizard) {
          this.router.navigateByUrl(`${this.backLink}/refund/continue/${wizard.id}`);
        }
        else {
          this.router.navigateByUrl('fincare/billing-manager');
        }
      }
    );
  }

  instantiateRefundWizard(startWizardRequest: StartWizardRequest) {
    const refund = new Refund();

    startWizardRequest.type = 'refund';
    refund.overrideMembershipApprover = false;
    switch (this.refundType) {
      case RefundTypeEnum.Overpayment:
        refund.trigger = RefundTypeEnum.Overpayment;
        refund.overrideMembershipApprover = true;
        break;
      case RefundTypeEnum.PolicyReclassification:
        refund.trigger = RefundTypeEnum.PolicyReclassification;
        break;
      case RefundTypeEnum.Adjustment:
        refund.trigger = RefundTypeEnum.Transactional;
        break;
      case RefundTypeEnum.PolicyCancellation:
        refund.trigger = RefundTypeEnum.PolicyCancellation;
        break;      
      case RefundTypeEnum.TermsOverPayment:
        refund.trigger = RefundTypeEnum.TermsOverPayment;
        refund.overrideMembershipApprover = true;
        break;
    }

    if(this.canDoClaimsRevovery()){
        refund.debtorClaimRecoveryBalance = this.debtorClaimRecoveryBalance;
    }

    startWizardRequest.linkedItemId = this.rolePlayerId;
    const policy = new RolePlayerPolicy();
    const filtered: number[] = [];
    refund.partialRefundTransactions = [];
    this.selectedTransactions.forEach(t => {
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
      refund.partialRefundTransactions.push(partialRefundTran);
    });
    refund.refundRmaBankAccountAmounts = this.refundBankAccounAmounts;
    refund.rolePlayerId = this.rolePlayerId;
    refund.rolePlayerName = this.debtorSearchResult.displayName;
    refund.refundDate = new Date();
    refund.refundAmount = this.fullRefundAmount;
    refund.tempDocumentKeyValue = this.documentKeyValue;
    refund.requestCode = this.requestCode;
    refund.finPayeNumber = this.debtorSearchResult.finPayeNumber;
    refund.periodStatus = this.selectedPeriodStatus;
    startWizardRequest.data = JSON.stringify(refund);
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.rolePlayerBankingDetails = new Array();
    this.panelOpenState$.next(false);
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.requestCode = debtorSearchResult.finPayeNumber;
    this.transactionService.getDebtorCreditBalance(this.rolePlayerId).subscribe(amount => {
      if (amount && amount < 1) {
        this.hasRefundableCreditBalance = true;
        this.creditBalanceChecked = true;
        this.refundableCreditBalance = -1 * (amount);
      }
      else {//positive means client owes
        this.hasRefundableCreditBalance = false;
        this.creditBalanceChecked = true;
        this.refundableCreditBalance = 0;
        this.refundTypes = this.ToKeyValuePair(RefundTypeEnum).filter(c => c.id == +RefundTypeEnum.TermsOverPayment);
      }
    });

    this.getDebtorClaimRecoveriesBalance();
  }

  next() {
    this.selectedTabIndex += 1;
  }


  back() {
    this.router.navigateByUrl(this.backLink);
  }

  transactionSelected($event: Transaction, partialAmount = 0) {
    this.message = '';

    const index = this.selectedTransactions.indexOf($event);

    if (index <= -1) {
      if (partialAmount > 0) {
        $event.refundAmount = partialAmount;
        $event.balance = $event.balance - partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].refundAmount = partialAmount;
        this.transactions.filter(t => t.transactionId === $event.transactionId)[0].balance = $event.balance;
      } else {
        if ($event.amount < $event.balance) {
          this.message = 'You cannot refund more than the balance';
          return;
        }

        $event.refundAmount = $event.balance;
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

  addOwnAmount(transaction: Transaction) {
    var dialogRerf = this.dialog.open(RefundPartialDialogComponent, { width: '50%', height: 'auto', data: { balance: transaction.balance }, disableClose: true });

    dialogRerf.afterClosed().subscribe((amount) => {
      if (amount && amount > 0) {
        this.selectedTransactionIds.push(transaction.transactionId);
        transaction.refundAmount = amount;
        this.selectedTransactions.push(transaction);
        this.setTotalRefund();
      }
    });
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

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  canDoClaimsRevovery()
  {
    return (this.refundType === RefundTypeEnum.PolicyReclassification || this.refundType === RefundTypeEnum.PolicyCancellation);
  }

  refundTypeChanged(event: any) {
    this.resetForm();
    this.showDebtorPolicies = false;
    if (event.value === +RefundTypeEnum.Overpayment) {
      this.refundType = RefundTypeEnum.Overpayment;
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.getCreditBalanceBreakDown();
      this.showTransactions = true;
      this.canEditAmount = true;
    }
    else if (event.value === +RefundTypeEnum.PolicyReclassification) {
      this.refundType = RefundTypeEnum.PolicyReclassification;
      this.getCreditBalanceBreakDown();
      this.refundDocSet = DocumentSetEnum.CoidPolicyRefund;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    else if (event.value === +RefundTypeEnum.PolicyCancellation) {
      this.refundType = RefundTypeEnum.PolicyCancellation;
      this.refundDocSet = DocumentSetEnum.PolicyCancellation;
      this.getCreditBalanceBreakDown();
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    if (event.value === +RefundTypeEnum.CreditBalance) {
      this.refundType = RefundTypeEnum.CreditBalance;
      this.getCreditBalanceBreakDown();
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    if (event.value === +RefundTypeEnum.TermsOverPayment) {
      this.refundType = RefundTypeEnum.TermsOverPayment;
      this.getTermTransactionsToRefund();
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
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

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
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

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
    if (this.requiredDocumentsUploaded) {
      if (this.fullRefundAmount > 0) {
        this.canSubmit = true;
      }
    }
  }

  editAmount() {
    this.enableFormControl('amount');
    this.toggleEditUpdate();
  }

  updateAmount() {
    let enteredAmount = Number(this.form.get('amount').value);
    if(enteredAmount != 0 &&  !isNaN(enteredAmount))
      {

        if(enteredAmount >  this.fullRefundableAmount)
          {
            this.form.get('amount').setErrors({'max': true});
          }
          else
          {
            this.fullRefundAmount = this.form.get('amount').value;
            this.disableFormControl('amount');
            this.toggleEditUpdate();
          }
      }
      else{
        this.form.get('amount').setErrors({'required': true});
      }
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    }
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.selectedPolicyIds = [...policies.map(p => p.policyId)];
    this.selectedPolicies = [...policies.map(c => c)];

    if (this.refundType === RefundTypeEnum.Overpayment) {
      this.getTransactions();
      this.showAmountInput = false;
      this.showTransactions = true;
      this.canEditAmount = false;
    }
    else if (this.refundType === RefundTypeEnum.PolicyCancellation) {
      this.getDebtorCancellationRefundBreakDown();
      this.refundDocSet = DocumentSetEnum.PolicyCancellation;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
  }

  setTotalRefund() {
    this.refundBankAccounAmounts = [];
    const total = this.selectedTransactions.reduce((a, b) => a + b.refundAmount, 0);
    this.enableFormControl('amount');
    this.form.get('amount').setValue(total);

    if (this.selectedTransactions.length > 0) {
      this.selectedTransactions.forEach(c => {
        const account = new refundRmaBankAccountAmount();
        account.amount = c.refundAmount; account.rmaBankAccountId = c.rmaBankAccountId; account.policyId = c.policyId; account.transactionId = c.transactionId; account.accountNumber = this.rmaBankAccounts.find(y => y.id == c.rmaBankAccountId).accountNumber
        this.refundBankAccounAmounts.push(account);
      }
      );
    }

    const grouped: { accountId: number, accountNumber: string, refundAmount: number }[] = [];

    this.refundBankAccounAmounts.forEach(element => {
      if (grouped.findIndex(c => c.accountId === element.rmaBankAccountId) < 0) {
        grouped.push({ accountId: element.rmaBankAccountId, accountNumber: element.accountNumber, refundAmount: element.amount });
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
    this.fullRefundAmount = this.form.get('amount').value;
    this.fullRefundableAmount =  this.fullRefundAmount ;
    this.disableFormControl('amount');
  }

  getDebtorClaimRecoveriesBalance()
  {
    this.isLoadingClaimRecoveriesBalance$.next(true);
    this.debtorClaimRecoveryBalance = undefined;
    this.transactionService.getDebtorClaimRecoveriesBalance(this.rolePlayerId).subscribe(
      data => {
        this.debtorClaimRecoveryBalance = data;
        this.form.get('debtorClaimRecoveryBalance').setValue(data);
        this.isLoadingClaimRecoveriesBalance$.next(false)
      }
      , error => { this.toastr.errorToastr(error.message); this.isLoadingClaimRecoveriesBalance$.next(false); }
    );
  }

  getDebtorReclassficationRefundBreakDown() {
    this.isLoadingRefundAmount$.next(true);
    let total = 0;
    const breakdowns = [];
    this.refundBankAccounAmounts = [];
    this.transactionService.getDebtorReclassficationRefundBreakDown(this.rolePlayerId).subscribe(data => {
      if (data && data.length > 0) {
        data.forEach(c => {
          const result = {
            refundAmount: (c.balance * -1) - c.claimsTotal,
            balance: c.balance * -1,
            claimsTotal: c.claimsTotal,
            bankAccountNumber: c.bankAccountNumber
          };
          total += result.refundAmount;
          breakdowns.push(result);

          const account = new refundRmaBankAccountAmount();
          account.amount = result.refundAmount;
          account.rmaBankAccountId = this.rmaBankAccounts.find(y => y.accountNumber == c.bankAccountNumber).id;
          account.policyId = 0; account.transactionId = 0;
          account.accountNumber = result.bankAccountNumber;
          this.refundBankAccounAmounts.push(account);
        });
      }

      this.datasourceReclassification.data = [...breakdowns];
      this.enableFormControl('amount');
      this.form.get('amount').setValue(total);
      this.fullRefundAmount = total;
      this.fullRefundableAmount =  this.fullRefundAmount ;
      this.disableFormControl('amount');
      this.isLoadingRefundAmount$.next(false);
      this.checkCanSubmit();
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false); });
  }

  getDebtorCancellationRefundBreakDown() {
    this.isLoadingRefundAmount$.next(true);
    let total = 0;
    const breakdowns = [];
    this.refundBankAccounAmounts = [];
    this.transactionService.getDebtorCancellationRefundBreakDown(this.rolePlayerId).subscribe(data => {
      if (data && data.length > 0) {
        data.forEach(c => {
          if (this.selectedPolicyIds.includes(c.policyId)) {
            const result = {
              refundAmount: (c.balance * -1),
              balance: c.balance,
              policyNumber: c.policyNumber,
              bankAccountNumber: c.bankAccountNumber,
              policyId: c.policyId
            };
            total += result.refundAmount;
            breakdowns.push(result);

            const account = new refundRmaBankAccountAmount();
            account.amount = result.refundAmount;
            account.rmaBankAccountId = this.rmaBankAccounts.find(y => y.accountNumber == c.bankAccountNumber).id;
            account.policyId = result.policyId ? result.policyId : 0;
            account.transactionId = 0;
            account.accountNumber = result.bankAccountNumber;
            this.refundBankAccounAmounts.push(account);
          }
        });
      }

      this.datasourceCancellation.data = [...breakdowns];
      this.enableFormControl('amount');
      this.form.get('amount').setValue(total);
      this.fullRefundAmount = total;
      this.fullRefundableAmount =  this.fullRefundAmount ;
      this.disableFormControl('amount');
      this.isLoadingRefundAmount$.next(false);
      this.checkCanSubmit();
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false); });
  }

  setRefundableCreditBalance(amount) {
    this.enableFormControl('amount');
    this.form.get('amount').setValue(amount);
    this.fullRefundAmount = amount;
    this.fullRefundableAmount =  this.fullRefundAmount ;
    this.disableFormControl('amount');
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

  resetForm() {
    this.selectedTransactionIds = [];
    this.selectedTransactions = [];
    this.datasource.data = [];
    this.datasourceReclassification.data = [];
    this.form.get('amount').setValue(null);
    this.fullRefundAmount = 0;
    this.fullRefundableAmount =  this.fullRefundAmount ;
    this.showTransactions = false;
    this.datasourceRefundBreakDown.data = [];
    this.datasourceCancellation.data = [];
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }

  getCreditBalanceBreakDown() {
    this.isLoadingRefundAmount$.next(true);
    let total = 0;
    this.billingService.getDebtorProductCategoryBalances(this.rolePlayerId).subscribe(data => {

      if (data) {
        this.debtorProductCategoryBalances = [...data];
        this.setTotalRefundFromCreditBreakDown();
      }

      this.isLoadingRefundAmount$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false); });
  }

  setTotalRefundFromCreditBreakDown() {
    this.refundBankAccounAmounts = [];
    const total = this.debtorProductCategoryBalances.reduce((a, b) => a + b.balance, 0);
    this.enableFormControl('amount');
    this.form.get('amount').setValue(-1 * total);

    if (this.debtorProductCategoryBalances.length > 0) {
      this.debtorProductCategoryBalances.forEach(c => {
        const account = new refundRmaBankAccountAmount();
        account.amount = -1 * c.balance; account.rmaBankAccountId = this.rmaBankAccounts.find(y => y.accountNumber == c.bankAccountNumber).id; account.accountNumber = c.bankAccountNumber
        this.refundBankAccounAmounts.push(account);
      }
      );
    }

    const grouped: { accountId: number, accountNumber: string, refundAmount: number }[] = [];

    this.refundBankAccounAmounts.forEach(element => {
      if (grouped.findIndex(c => c.accountId === element.rmaBankAccountId) < 0) {
        grouped.push({ accountId: element.rmaBankAccountId, accountNumber: element.accountNumber, refundAmount: element.amount });
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
    this.fullRefundAmount = this.form.get('amount').value;
    this.fullRefundableAmount =  this.fullRefundAmount ;
    this.disableFormControl('amount');

    this.checkCanSubmit();
  }

  checkCanSubmit() {
    if (this.requiredDocumentsUploaded && this.fullRefundAmount > 0 && this.debtorClaimRecoveryBalance != undefined) {
      this.canSubmit = true;
    }
    else {
      this.canSubmit = false;
    }
  }

  getTermTransactionsToRefund() {
    this.isLoadingRefundAmount$.next(true);
    this.termArrangementService.getTermTransactionsToRefund(this.rolePlayerId).subscribe(data => {
      if (data) {
        this.datasourceTerms.data = [...data];
       // this.setTotalRefundTermBreakDown();
      }

      this.isLoadingRefundAmount$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false); });
  }


  setTotalRefundTermBreakDown() {
    this.refundBankAccounAmounts = [];
    const total = this.selectedTermsTransactions.reduce((a, b) => a + b.overpayment, 0);
    this.enableFormControl('amount');
    this.form.get('amount').setValue(total);

    if (this.selectedTermsTransactions.length > 0) {
      this.selectedTermsTransactions.forEach(c => {
        const account = new refundRmaBankAccountAmount();
        account.amount =  c.overpayment; 
        account.rmaBankAccountId = this.rmaBankAccounts.find(y => y.accountNumber == c.bankAccountNumber).id; 
        account.accountNumber = c.bankAccountNumber;
        account.transactionId = c.transactionId;
        account.refundableTermScheduleIds = c.refundableTermScheduleIds;
        this.refundBankAccounAmounts.push(account);
      }
      );
    }

    const grouped: { accountId: number, accountNumber: string, refundAmount: number }[] = [];

    this.refundBankAccounAmounts.forEach(element => {
      if (grouped.findIndex(c => c.accountId === element.rmaBankAccountId) < 0) {
        grouped.push({ accountId: element.rmaBankAccountId, accountNumber: element.accountNumber, refundAmount: element.amount });
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
    this.fullRefundAmount = this.form.get('amount').value;
    this.fullRefundableAmount =  this.fullRefundAmount ;
    this.disableFormControl('amount');

    this.checkCanSubmit();
  }


  termsTransactionChecked(event: any, item: TermScheduleRefundBreakDown) {
    if (event.checked) {
      this.selectedTermsTransactionIds.push(item.transactionId);
      this.selectedTermsTransactions.push(item);
    } else {
      this.isAllTransactionsSelected$.next(false);
      this.unTickTermTransactionItem(item.transactionId);
    }
    this.setTotalRefundTermBreakDown();
  }

  unTickTermTransactionItem(itemId: number) {
    for (let i = 0; i < this.selectedTermsTransactionIds.length; i++) {
      if ((this.selectedTermsTransactionIds[i] === itemId)) {
        this.selectedTermsTransactionIds.splice(i, 1);
        const itemIndex = this.selectedTermsTransactions.findIndex(c => c.transactionId === itemId);
        this.selectedTermsTransactions.splice(itemIndex, 1);
        break;
      }
    }
    this.setTotalRefundTermBreakDown();
  }
}
