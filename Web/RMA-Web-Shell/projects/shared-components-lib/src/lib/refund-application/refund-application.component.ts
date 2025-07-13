import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrManager } from "ng6-toastr-notifications";
import { RolePlayer } from "projects/clientcare/src/app/policy-manager/shared/entities/roleplayer";
import { Refund } from "projects/fincare/src/app/billing-manager/models/refund";
import { TransactionsService } from "projects/fincare/src/app/billing-manager/services/transactions.service";
import { RefundReasonEnum } from "projects/fincare/src/app/shared/enum/refund-reason.enum";
import { Transaction } from "projects/fincare/src/app/shared/models/transaction";
import { BehaviorSubject } from "rxjs";
import { DebtorSearchResult } from "../models/debtor-search-result";
import { RolePlayerBankingDetail } from "../models/banking-details.model";
import { StartWizardRequest } from "../wizard/shared/models/start-wizard-request";
import { WizardService } from "../wizard/shared/services/wizard.service";
import { Router } from "@angular/router";
import { RolePlayerService } from "projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service";
import { DocumentSetEnum } from "projects/shared-models-lib/src/lib/enums/document-set.enum";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { RefundTransaction } from "projects/fincare/src/app/billing-manager/models/refund-transactions";
import { BankAccountTypeEnum } from "projects/shared-models-lib/src/lib/enums/bank-account-type-enum";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { BankBranch } from "projects/shared-models-lib/src/lib/lookup/bank-branch";
import { DocumentSystemNameEnum } from "../document/document-system-name-enum";
import { FinPayee } from "projects/fincare/src/app/shared/models/finpayee";
import { IntegrationService } from "projects/shared-services-lib/src/lib/services/integrations.service";
import { RefundTypeEnum } from "projects/fincare/src/app/shared/enum/refund-type.enum";
import { RolePlayerPolicy } from "projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy";
import { PolicyProductCategory } from "projects/fincare/src/app/billing-manager/models/policy-product-category";
import { MatTableDataSource } from "@angular/material/table";
import { BillingService } from "projects/fincare/src/app/billing-manager/services/billing.service";
import { DebtorProductCategoryBalance } from "projects/fincare/src/app/billing-manager/models/debtor-product-category-balance";
import { refundRmaBankAccountAmount } from "projects/fincare/src/app/billing-manager/models/refundRmaBankAccountAmounts";
import { RmaBankAccount } from "projects/fincare/src/app/billing-manager/models/rmaBankAccount";
import { MatPaginator } from "@angular/material/paginator";
import { TransactionTypeEnum } from "projects/fincare/src/app/shared/enum/transactionTypeEnum";
import { InterBankTransferService } from "projects/fincare/src/app/billing-manager/services/interbanktransfer.service";
import { TermArrangementService } from "projects/fincare/src/app/shared/services/term-arrangement.service";
import { TermScheduleRefundBreakDown } from "projects/fincare/src/app/billing-manager/models/termschedule-refund-breakdown";
import { BankAccount } from 'projects/shared-models-lib/src/lib/common/bank-account';
import { BankAccountService } from "projects/shared-services-lib/src/lib/services/bank-account/bank-account.service";


@Component({
  selector: "refund-application",
  templateUrl: "./refund-application.component.html",
  styleUrls: ["./refund-application.component.css"],
})
export class RefundApplicationComponent implements OnInit, AfterViewInit {
  @Input() rolePlayer: RolePlayer;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() wizardId: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  datasourceRefundBreakDown = new MatTableDataSource<{ rmaBankAccountNumber: string, refundAmount: number }>();
  form: FormGroup;

  transactions: Transaction[];
  reasons: Lookup[];
  refund: Refund;
  debtor: FinPayee;
  netBalance = 0;
  groupEmail = '';
  reason = '';
  refundAmount = 0;
  total = 0;
  bankAccountType = 8;
  branchCode = '';
  accountNumber = '';
  accountHolderName = 'unknown';
  accountValidationErrorMsg = '';
  wizardInProgressName = '';
  documentKeyValue = '';
  isLoadingReasons = false;
  refundWizardinProgress = false;
  showTransactions: boolean = false;
  showAmountInput = false;
  canEditAmount = false;
  canUpdateAmount = false;
  canSubmit = false;
  showCreditBalance = false;
  showOverPayment = false;
  showBanking = false;
  hasRefundableCreditBalance = false;
  creditBalanceChecked = false;
  refundableCreditBalance = 0;
  message: string;
  refundReason: RefundReasonEnum;
  refundTypes: { id: number, name: string }[] = [];
  refundType: RefundTypeEnum;
  bankAccountTypes: BankAccountTypeEnum[];
  selectedTransactions: RefundTransaction[] = [];
  debtorSearchResult: DebtorSearchResult;
  rolePlayerBankingDetails: RolePlayerBankingDetail[];
  selectedBankAccount: RolePlayerBankingDetail;
  selectedPolicies: PolicyProductCategory[] = [];
  debtorProductCategoryBalances: DebtorProductCategoryBalance[] = [];
  refundBankAccounAmounts: refundRmaBankAccountAmount[] = [];
  rmaBankAccounts: BankAccount[] = [];
  banks: Lookup[];
  showOwnAmount: boolean;
  requiredDocumentsUploaded = false;
  documentSet: DocumentSetEnum;
  selectedPolicyIds = [];
  selectedTransactionIds = [];
  refundDocSet = 0;
  fullRefundAmount = 0;
  rolePlayerBankingId = 0;
  termScheduleRefundBalances: TermScheduleRefundBreakDown[] = [];

  refundSupportingDocumentSet = DocumentSetEnum.MaintainRefundOverpayment;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  verifyingBank$ = new BehaviorSubject(false);
  accountNumberPopulated = new BehaviorSubject(false);
  cleintEmailPopulated = new BehaviorSubject(false);
  isLoadingRefundAmount$ = new BehaviorSubject(false);
  isLoadingCreditBalanceInfo$ = new BehaviorSubject(false);

  datasource = new MatTableDataSource<Transaction>();
  datasourceCreditBalance = new MatTableDataSource<DebtorProductCategoryBalance>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns = ['transactionType', 'transactionAmount', 'balance', 'refundAmount', 'action'];
  displayCreditBalanceColumns = ['creditBalance', 'action'];

  constructor(
    private readonly transactionService: TransactionsService,
    private readonly lookupService: LookupService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly billingService: BillingService,
    private readonly termArrangementService: TermArrangementService,
    private readonly bankAccountService: BankAccountService,
    private readonly alert: ToastrManager,
    private readonly formBuilder: FormBuilder,
    private readonly wizardService: WizardService,
    private readonly router: Router,
    public toastr: ToastrManager
  ) { }

  ngAfterViewInit(): void {
    this.datasourceCreditBalance.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.validateNoExistingWizardsExist();
    this.getLookups();
    this.rolePlayerBankingDetails = new Array();

    this.refundTypes = this.ToKeyValuePair(RefundTypeEnum).filter(c =>
      c.id === +RefundTypeEnum.Overpayment ||
      c.id === +RefundTypeEnum.PolicyCancellation ||
      c.id === +RefundTypeEnum.PolicyReclassification ||
      c.id === +RefundTypeEnum.TermsOverPayment
    );
    this.documentKeyValue = this.generateUUID();
    this.bankAccountService.getBankAccounts().subscribe(data => {
      this.rmaBankAccounts = data;
    })
    this.createForm();
  }


  createForm(): void {
    this.form = this.formBuilder.group({
      bankId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bankBranchId: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      bankAccountType: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      refundBankBranchCode: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      name: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      refundBankAccountNumber: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      groupEmail: [{ value: null, disabled: true }, Validators.required],
      clientEmail: [{ value: null, disabled: false }, Validators.required,],
      amount: [{ value: null, disabled: true }],
      partialAmount: [{ value: null }],
      refundDate: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      reason: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      refundTypeId: [{ value: null, disabled: this.isReadOnly }],
    });
  }

  readForm() {
    this.refund = new Refund();
    this.refund.groupEmail = this.form.controls.groupEmail.value;
    this.refund.clientEmail = this.form.controls.clientEmail.value;
    this.refund.refundAmount = this.refundAmount;
    this.refund.refundDate = new Date(
      this.form.controls.refundDate.value
    ).getCorrectUCTDate();
    this.refund.refundReason = this.refundReason;
  }

  setForm() {
    this.form.patchValue({
      groupEmail: this.rolePlayer.emailAddress,
    });
    this.isLoading$.next(false);
  }

  resetForm() {
    this.selectedTransactionIds = [];
    this.selectedTransactions = [];
    this.datasource.data = [];
    this.form.get('amount').setValue(null);
    this.refundAmount = 0;
    this.showTransactions = false;
    this.datasourceRefundBreakDown.data = [];
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.rolePlayerBankingDetails = new Array();
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayer.rolePlayerId = debtorSearchResult.roleplayerId;

    this.rolePlayerService
      .getBankingDetailsByRolePlayerId(this.rolePlayer.rolePlayerId)
      .subscribe((bankDetails) => {
        this.rolePlayerBankingDetails = bankDetails;
      });
    this.transactionService.getDebtorCreditBalance(this.rolePlayer.rolePlayerId).subscribe(amount => {
      if (amount && amount < 1) {
        this.hasRefundableCreditBalance = true;
        this.creditBalanceChecked = true;
        this.refundableCreditBalance = -1 * (amount)
      } else {
        this.hasRefundableCreditBalance = false;
        this.creditBalanceChecked = true;
        this.refundableCreditBalance = 0;
        this.refundTypes = this.ToKeyValuePair(RefundTypeEnum)
          .filter(c => c.id == +RefundTypeEnum.TermsOverPayment);
      }
    });
  }


  getTransactions() {
    this.isLoading$.next(true);
    this.transactionService.getTransactionsForRefund(this.rolePlayer.rolePlayerId, this.selectedPolicyIds).subscribe(results => {
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

  refundTypeChanged($event: RefundTypeEnum) {
    if ($event === +RefundTypeEnum.Overpayment) {
      this.refundType = RefundTypeEnum.Overpayment;
      this.getCreditBalanceBreakDown();
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = false;
      this.canEditAmount = true;
    }
    else if ($event === +RefundTypeEnum.PolicyReclassification) {
      this.refundType = RefundTypeEnum.PolicyReclassification;
      this.getCreditBalanceBreakDown();
      this.refundDocSet = DocumentSetEnum.CoidPolicyRefund;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    else if ($event === +RefundTypeEnum.PolicyCancellation) {
      this.refundType = RefundTypeEnum.PolicyCancellation;
      this.refundDocSet = DocumentSetEnum.PolicyCancellation;
      this.getCreditBalanceBreakDown();
      this.showTransactions = false;
      this.showAmountInput = true;
      this.canEditAmount = true;
    }
    if ($event === +RefundTypeEnum.CreditBalance) {
      this.refundType = RefundTypeEnum.CreditBalance;
      this.getCreditBalanceBreakDown();
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
    if ($event === +RefundTypeEnum.TermsOverPayment) {
      this.refundType = RefundTypeEnum.TermsOverPayment;
      this.getTermTransactionsToRefund();
      this.refundDocSet = DocumentSetEnum.MaintainRefundOverpayment;
      this.showAmountInput = true;
      this.showTransactions = false;
      this.canEditAmount = true;
    }
  }

  getTermTransactionsToRefund() {
    this.isLoadingRefundAmount$.next(true);
    this.termArrangementService.getTermTransactionsToRefund(this.rolePlayer.rolePlayerId).subscribe(data => {
      if (data) {
        this.termScheduleRefundBalances = [...data];
        this.setTotalRefundTermBreakDown();
      }

      this.isLoadingRefundAmount$.next(false);
    }, error => {
      this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false);
    });
  }

  getCreditBalanceBreakDown() {
    this.isLoadingRefundAmount$.next(true);
    this.isLoadingCreditBalanceInfo$.next(true);
    let total = 0;
    this.billingService.getDebtorProductCategoryBalances(this.rolePlayer.rolePlayerId).subscribe(data => {
      if (data && data.length > 0) {
        this.debtorProductCategoryBalances = [...data];
        this.debtorProductCategoryBalances.forEach(c => {
          if (c.balance > 0) {
            c.balance = 0; // if it's positive amount no refundable amount
          }
        });

        this.datasourceCreditBalance.data = this.debtorProductCategoryBalances;
        this.setTotalRefundFromCreditBreakDown();
      }

      this.isLoadingRefundAmount$.next(false);
      this.isLoadingCreditBalanceInfo$.next(false);
    }, error => {
      this.toastr.errorToastr(error.message);
      this.isLoadingRefundAmount$.next(false);
      this.isLoadingCreditBalanceInfo$.next(false);
    });
  }

  getDebtorReclassficationRefundBreakDown() {
    this.isLoadingRefundAmount$.next(true);
    let total = 0;
    const breakdowns = [];
    this.refundBankAccounAmounts = [];
    this.transactionService.getDebtorReclassficationRefundBreakDown(this.rolePlayer.rolePlayerId).subscribe(data => {
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

      this.enableFormControl('amount');
      this.form.get('amount').setValue(total);
      this.fullRefundAmount = total;
      this.disableFormControl('amount');
      this.isLoadingRefundAmount$.next(false);
      this.checkCanSubmit();
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false); });
  }


  toggleSubmit() {
    if (this.selectedTransactions.length > 0) {
      this.submitDisabled$.next(false);
    } else {
      this.submitDisabled$.next(true);
    }
  }

  setTotalRefundFromCreditBreakDown() {
    this.refundBankAccounAmounts = [];
    const total = this.debtorProductCategoryBalances.reduce((a, b) => a + b.balance, 0);
    this.enableFormControl('amount');
    this.form.get('amount').setValue(total * -1);
    this.refundAmount = this.form.get('amount').value;
    if (total == 0) {
      this.hasRefundableCreditBalance = false;
      this.creditBalanceChecked = true;
      return;
    }
    else if (this.debtorProductCategoryBalances.length > 0) {
      this.debtorProductCategoryBalances.forEach(c => {
        const account = new refundRmaBankAccountAmount();
        account.amount = -1 * c.balance;
        account.rmaBankAccountId = this.rmaBankAccounts.find(y => y.accountNumber == c.bankAccountNumber).id;
        account.accountNumber = c.bankAccountNumber
        this.refundBankAccounAmounts.push(account);
      }
      );
    }
    this.displayBankingDetails()
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
    this.disableFormControl('amount');

    this.checkCanSubmit();
  }

  displayBankingDetails() {
    this.showBanking = true;
    this.setForm();
  }

  setBankAccount($event: RolePlayerBankingDetail) {
    this.selectedBankAccount = $event;
  }

  getLookups() {
    this.bankAccountTypes = this.ToArray(BankAccountTypeEnum);
    this.createForm();
  }

  addEmail() {
    this.readForm();
    if (this.form.get("clientEmail")) {
      this.refund.clientEmail = this.form.get("clientEmail").value;
      this.toastr.successToastr("Email successfully saved/updated");
    } else {
      this.toastr.errorToastr("please provide email");
    }
  }

  populateAmount(amount: number) {
    this.refundAmount = amount;
    this.form.controls.refundAmount.setValue(amount);
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map((key) => anyEnum[key]);
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  logClientEmailPopulated() {
    if (this.form.get("clientEmail").valid) {
      this.cleintEmailPopulated.next(true);
    } else {
      this.cleintEmailPopulated.next(false);
    }
  }

  isRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
    if (this.requiredDocumentsUploaded) {
      if (this.fullRefundAmount > 0) {
        this.canSubmit = true;
      }
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

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2") : "N/A";
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  getKey(): string {
    return `${this.rolePlayer.rolePlayerId} | RefundApplication`;
  }

  back() {
    this.router.navigateByUrl("member/member-manager/home");
  }

  submitRefunds() {
    this.isSubmitting$.next(true);
    this.readForm();
    this.instantiateRefundWizard();
  }

  instantiateRefundWizard() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'refund';
    this.refund.overrideMembershipApprover = false;
    switch (this.refundType) {
      case RefundTypeEnum.Overpayment:
        this.refund.trigger = RefundTypeEnum.Overpayment;
        this.refund.overrideMembershipApprover = true;
        break;
      case RefundTypeEnum.PolicyReclassification:
        this.refund.trigger = RefundTypeEnum.PolicyReclassification;
        break;
      case RefundTypeEnum.Adjustment:
        this.refund.trigger = RefundTypeEnum.Transactional;
        break;
      case RefundTypeEnum.PolicyCancellation:
        this.refund.trigger = RefundTypeEnum.PolicyCancellation;
        break;
      case RefundTypeEnum.TermsOverPayment:
        this.refund.trigger = RefundTypeEnum.TermsOverPayment;
        this.refund.overrideMembershipApprover = true;
        break;
    }
    startWizardRequest.linkedItemId = this.rolePlayer.rolePlayerId;
    const policy = new RolePlayerPolicy();
    const filtered: number[] = [];
    this.refund.partialRefundTransactions = [];
    this.selectedTransactions.forEach((t) => {
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
      this.refund.partialRefundTransactions.push(partialRefundTran);
    });
    this.refund.refundRmaBankAccountAmounts = this.refundBankAccounAmounts;
    this.refund.rolePlayerId = this.rolePlayer.rolePlayerId;
    this.refund.rolePlayerName = this.rolePlayer.displayName;
    this.refund.finPayeNumber = this.rolePlayer.finPayee.finPayeNumber;
    this.refund.refundReason = this.refundReason;
    this.refund.refundDate = new Date();
    this.refund.refundAmount = this.refundAmount;
    this.refund.tempDocumentKeyValue = this.documentKeyValue;
    this.refund.rolePlayerBankingId = this.selectedBankAccount.rolePlayerBankingId;
    startWizardRequest.data = JSON.stringify(this.refund);
    this.createWizard(startWizardRequest);
  }

  validateNoExistingWizardsExist() {
    this.wizardService
      .getWizardsInProgressByTypeAndLinkedItemId(
        this.rolePlayer.rolePlayerId,
        "refund"
      )
      .subscribe((data) => {
        if (data[0]) {
          if (data[0].id > 0) {
            this.refundWizardinProgress = true;
            this.applicationExists();
          } else {
            this.refundWizardinProgress = false;
          }
        } else {
          this.refundWizardinProgress = false;
        }
      });
  }

  applicationExists() {
    if (this.refundWizardinProgress) {
      this.disableFormControl('bankId');
      this.disableFormControl('bankBranchId');
      this.disableFormControl('bankAccountType');
      this.disableFormControl('refundBankBranchCode');
      this.disableFormControl('refundBankAccountNumber');
      this.disableFormControl('clientEmail');
      this.disableFormControl('reason');
      this.disableFormControl('name');
    }
  }

  requestApproval(id: number) {
    this.wizardService.requestApproval(id).subscribe((result) => { });
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.submitDisabled$ = new BehaviorSubject(true);
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.alert.successToastr("Application submitted successfully");
      this.submitDisabled$ = new BehaviorSubject(false);
      this.router.navigateByUrl("member/member-manager/home");
      this.requestApproval(result.id);
    });
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.selectedPolicyIds = [...policies.map(p => p.policyId)];

    if (this.refundType === RefundTypeEnum.Overpayment) {
      this.getTransactions();
    } else if (this.refundType === RefundTypeEnum.PolicyCancellation) {
      this.getDebtorCancellationRefundBreakDown();
    }
  }

  getDebtorCancellationRefundBreakDown() {
    this.isLoadingRefundAmount$.next(true);
    let total = 0;
    const breakdowns = [];
    this.refundBankAccounAmounts = [];
    this.transactionService.getDebtorCancellationRefundBreakDown(this.rolePlayer.rolePlayerId).subscribe(data => {
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

      this.enableFormControl('amount');
      this.form.get('amount').setValue(total);
      this.fullRefundAmount = total;
      this.disableFormControl('amount');
      this.isLoadingRefundAmount$.next(false);
      this.checkCanSubmit();
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingRefundAmount$.next(false); });
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }

  checkCanSubmit() {
    if (this.requiredDocumentsUploaded && this.fullRefundAmount > 0) {
      this.canSubmit = true;
    }
    else {
      this.canSubmit = false;
    }
  }

  toggleEditUpdate() {
    if (this.canEditAmount) {
      this.canEditAmount = false;
      this.canUpdateAmount = true;
      return;
    } else if (this.canUpdateAmount) {
      this.canUpdateAmount = false;
      this.canEditAmount = true;
    }
  }

  updateAmount() {
    this.disableFormControl('amount');
    this.toggleEditUpdate();
  }

  editAmount() {
    this.enableFormControl('amount');
    this.toggleEditUpdate();
  }

  setTotalRefundTermBreakDown() {
    this.refundBankAccounAmounts = [];
    const total = this.termScheduleRefundBalances.reduce((a, b) => a + b.overpayment, 0);
    this.enableFormControl('amount');
    this.form.get('amount').setValue(total);

    if (this.termScheduleRefundBalances.length > 0) {
      this.termScheduleRefundBalances.forEach(c => {
        const account = new refundRmaBankAccountAmount();
        account.amount = c.overpayment;
        account.rmaBankAccountId = this.rmaBankAccounts
          .find(y => y.accountNumber == c.bankAccountNumber).id;
        account.accountNumber = c.bankAccountNumber;
        account.transactionId = c.transactionId;
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
    this.disableFormControl('amount');

    this.checkCanSubmit();
  }
}
