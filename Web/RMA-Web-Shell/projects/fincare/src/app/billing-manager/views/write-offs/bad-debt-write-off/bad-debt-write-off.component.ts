
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { WriteOffType } from 'projects/shared-models-lib/src/lib/enums/writeoff-type-enum';
import { tap } from 'rxjs/operators';
import { TransactionsService } from '../../../services/transactions.service';
import { ConfirmWriteOffComponent } from '../confirm-write-off/confirm-write-off.component';
import { Statement } from 'projects/fincare/src/app/shared/models/statement';
import { BadDebtWriteOffRequest } from '../../../models/bad-debt-writeoff-request';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { BadDebtWriteOff } from '../../../models/bad-debt-write-off';
import { WriteOffReasonEnum } from 'projects/fincare/src/app/shared/enum/write-off-reason-enum';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { DebtorDebtWriteOff } from '../../../models/debtor-debt-write-off';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-bad-debt-write-off',
  templateUrl: './bad-debt-write-off.component.html',
  styleUrls: ['./bad-debt-write-off.component.css']
})
export class BadDebtWriteOffComponent implements OnInit, AfterViewInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingPremiums$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingInterest$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingDebtorNetBalance$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  displayedColumnsTransactionsSummary = ['transactionType', 'amount', 'balance'];


  currentQuery: string;
  datasourceInvoices: Statement[] = [];
  datasourceInterest: Statement[] = [];
  datasourceTransactionsSummary = new MatTableDataSource<Statement>();

  form: UntypedFormGroup;

  @ViewChild('paginatorTransactionsSummary', { static: false }) paginatorTransactionsSummary: MatPaginator;
  rowCount: number;
  transactiontypeText: string;
  showSubmit = false;
  rolePlayerId = 0;
  rolePlayerName = '';
  isSubmitting: boolean;
  panelOpenState = true;
  policyNumber = '';
  accountSearchResult: DebtorSearchResult;
  hideToDebtorDetails = true;
  debtorSearchResult: DebtorSearchResult;
  isAuthorized = false;
  isRefreshing = false;
  searchFailedMessage = '';
  message: string;
  backLink = '/fincare/billing-manager';
  periodStatus: PeriodStatusEnum;
  selectedWriteOffs: BadDebtWriteOff[] = [];
  writeOffType: WriteOffType;
  public interestWriteOffType = WriteOffType.Interest;
  public interestPlusPremiumWriteOffType = WriteOffType.InterestPlusPremium;
  public premiumWriteOffType = WriteOffType.Premium;
  statements: Statement[] = [];
  writeOffReasons: { id: number, name: string }[];
  selectedReasonId: number;
  writeOffTypeId = 0;
  selectedInvoiceTransactionIds: number[] = [];
  selectedPolicyIds: number[] = [];
  hidePolicies = true;
  transactionsSearched = false;
  selectedInterestTransactionIds: number[] = [];
  selectedInterestTransactions: Statement[] = [];
  selectedInvoiceTransactions: Statement[] = [];
  isLoadingPolicies = false;

  hasCreateBadDebtWriteOffPermission = false;
  periodIsValid = false;
  selectedPeriodStatus: PeriodStatusEnum;
  periodTitle = 'Period To Post To';
  showPeriodControl = true;
  debtorNetBalance: number;

  constructor(
    private readonly router: Router,
    private readonly transactionService: TransactionsService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly roleplayerPolicyService: RolePlayerPolicyService,
    private readonly wizardService: WizardService
  ) { }

  ngOnInit() {
    this.hasCreateBadDebtWriteOffPermission = userUtility.hasPermission('Create Bad Debt WriteOff');
    this.isAuthorized = this.hasCreateBadDebtWriteOffPermission;
    this.form = this.formBuilder.group({
      writeOffType: [{ value: null }, Validators.required],
      writeOffReason: [{ value: null }, Validators.required]
    });
    this.writeOffReasons = this.ToKeyValuePair(WriteOffReasonEnum);

    this.onWriteOffTypeSelected(this.interestPlusPremiumWriteOffType);
  }

  ngAfterViewInit() {
    this.datasourceTransactionsSummary.paginator = this.paginatorTransactionsSummary;
  }

  submitWriteOffs() {

    if(!this.validateDebtorNetBalance()){ return;}

    this.showSubmit = false;
    this.isSubmitting = true;
    let writeOffRequest = new BadDebtWriteOffRequest();
    if (this.selectedInterestTransactions.length > 0) {
      this.statements = this.statements.concat([...this.selectedInterestTransactions]);
    }
    if (this.selectedInvoiceTransactions.length > 0) {
      this.statements = this.statements.concat([...this.selectedInvoiceTransactions]);
    }
    this.statements.filter(x=> x.balance && x.balance > 0).forEach(item => {
      let writeOff = new BadDebtWriteOff();
      writeOff.amount = item.balance;
      writeOff.transactionId = item.transactionId;
      writeOff.invoiceId = item.invoiceId;
      writeOff.description = item.description;
      writeOff.documentNumber = item.documentNumber;
      writeOff.productId = item.productId;

      switch (item.transactionType.toLowerCase()) {
        case 'interest': writeOff.transactionType = TransactionTypeEnum.Interest;
          break;
        case 'invoice': writeOff.transactionType = TransactionTypeEnum.Invoice;
          break;
      }
      this.selectedWriteOffs.push(writeOff);
    }
    );

    writeOffRequest.roleplayerId = this.rolePlayerId;
    writeOffRequest.reason = 'Write Off';
    if (this.selectedReasonId === +WriteOffReasonEnum.ClientQueryWriteOff) {
      writeOffRequest.reason = 'Client Query Write Off';
    }
    else if (this.selectedReasonId === +WriteOffReasonEnum.LegalWriteOff) {
      writeOffRequest.reason = 'Legal Write Off';
    }
    else if (this.selectedReasonId === +WriteOffReasonEnum.PartiallyCancelledWriteOff) {
      writeOffRequest.reason = 'Partially Cancelled Write Off';
    }

    writeOffRequest.badDebtWriteOffs = this.selectedWriteOffs;
    writeOffRequest.period = this.selectedPeriodStatus;
    writeOffRequest.amount = this.debtorNetBalance;

    const startWizardRequest = new StartWizardRequest();
   
    startWizardRequest.type = 'debtor-debt-writeoff';
    const debtorDebtWriteOff =new  DebtorDebtWriteOff();
    debtorDebtWriteOff.badDebtWriteOffRequest = writeOffRequest;
    debtorDebtWriteOff.roleplayerId = this.rolePlayerId;
    debtorDebtWriteOff.finPayeNumber = this.debtorSearchResult.finPayeNumber;
    startWizardRequest.linkedItemId = this.rolePlayerId;
    startWizardRequest.data = JSON.stringify(debtorDebtWriteOff);

    this.createWizard(startWizardRequest);
  }

  validateDebtorNetBalance(): boolean
  {
    this.searchFailedMessage = "";
    if(this.debtorNetBalance == null || this.debtorNetBalance == undefined || isNaN(this.debtorNetBalance))
    {
      this.searchFailedMessage = "Can not write off debt. Debtor Net Balance not determined.";
      return false;
    }

    if(this.debtorNetBalance <= 0)
    {
      this.searchFailedMessage = "Can not write off debt. Debtor net balance is zero or is a credit.";
      return false;
    }
  
    return true;
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.isRefreshing = false;
    this.selectedPolicyIds = [];

    this.isLoadingPolicies = true;
    this.roleplayerPolicyService.getPoliciesByPolicyPayeeIdNoRefData(this.rolePlayerId).pipe(tap(data => {

      data.forEach(element => {
        this.selectedPolicyIds.push(element.policyId)
      });
      if (data.length === 0) {
        this.searchFailedMessage = 'No policies found';
      }
      else
      {
        this.getTransactions();
        this.getDebtorNetBalance();
      }
      this.isLoadingPolicies = false;
    }
    )).subscribe();

  }

  getInvoiceTransactions() {
    this.isLoadingPremiums$.next(true);
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.transactionService.getDebtorInvoiceTransactionHistoryByPolicy(this.rolePlayerId, this.selectedPolicyIds).pipe(tap(data => {
      this.datasourceInvoices = [...data];

      let totalAmount= 0;
      let totalBalance= 0;
      [...this.datasourceInvoices].forEach(element => {
        this.selectedInvoiceTransactionIds.push(element.transactionId);
        this.selectedInvoiceTransactions.push(element);
        totalAmount= totalAmount + element.amount;
        totalBalance = totalBalance  + element.balance;

      });

      var invoicesSummary = new  Statement(); 
      invoicesSummary.transactionType = "Invoice Transactions";
      invoicesSummary.amount = totalAmount;
      invoicesSummary.balance = totalBalance;
      this.datasourceTransactionsSummary.data.push(invoicesSummary);
      this.isLoadingPremiums$.next(false);
    }
    )).subscribe();
  }

  getInterestTransactions() {
    this.isLoadingInterest$.next(true);
    this.panelOpenState = false;
    this.searchFailedMessage = '';
    this.transactionService.getDebtorInterestTransactionHistoryByPolicy(this.rolePlayerId, this.selectedPolicyIds).pipe(tap(data => {
      this.datasourceInterest = [...data];

      let totalAmount= 0;
      let totalBalance= 0;
      [...this.datasourceInterest].forEach(element => {
        this.selectedInterestTransactionIds.push(element.transactionId);
        this.selectedInterestTransactions.push(element);

        totalAmount= totalAmount + element.amount;
        totalBalance = totalBalance  + element.balance;
      });

      var interestSummary = new  Statement(); 
      interestSummary.transactionType = "Interest Transactions";
      interestSummary.amount = totalAmount;
      interestSummary.balance = totalBalance;
      this.datasourceTransactionsSummary.data.push(interestSummary);
      this.isLoadingInterest$.next(false);
    }
    )).subscribe();
  }

  getDebtorNetBalance() {
    this.isLoadingDebtorNetBalance$.next(true);
    this.transactionService
      .getDebtorNetBalance(this.rolePlayerId)
      .subscribe((debtorNetBalance) => {
        this.debtorNetBalance = debtorNetBalance;
        this.isLoadingDebtorNetBalance$.next(false);
      });
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmWriteOffComponent, {width: '50%', data: { writeoffType: this.writeOffType }, disableClose: true });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        if (data.confirmation === true) {
          this.submitWriteOffs();
        }
      }
    });
  }

  onWriteOffTypeSelected(value: WriteOffType) {
    this.resetForm();
    this.writeOffType = value;
    this.writeOffTypeId = +value;
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

  getInvoiceTotals(): number {
    const total = this.datasourceInvoices.reduce((a, b) => a + b.balance, 0).toFixed(2);
    return +total;
  }

  getUnallocatedTransactionsTotalBalance(): number {
    const total = this.datasourceTransactionsSummary.data.reduce((a, b) => a + b.balance, 0).toFixed(2);
    return +total;
  }


  getInterestTotals(): number {
    const total = this.datasourceInterest.reduce((a, b) => a + b.balance, 0).toFixed(2);
    return +total;
  }

  writeOffReasonChanged() {
    if (this.transactionsSearched) {
      this.showSubmit = true;
    }
    else {
      this.getTransactions();
      this.showSubmit = true;
    }
  }

  getTransactions() {
    this.hidePolicies = true;
    this.transactionsSearched = true;
    this.datasourceTransactionsSummary.data = [];
    this.selectedInvoiceTransactionIds = [];
    this.selectedInvoiceTransactions =[];

    if (this.writeOffType === WriteOffType.Interest) {
      this.getInterestTransactions();
    }
    else if (this.writeOffType === WriteOffType.Premium) {
      this.getInvoiceTransactions();
    }
    else if (this.writeOffType === WriteOffType.InterestPlusPremium) {
      this.getInterestTransactions();
      this.getInvoiceTransactions();
    }
  }

  resetForm() {
    this.form.get('writeOffReason').setValue(null);
    this.datasourceInterest = [];
    this.datasourceInvoices = [];
    this.selectedInterestTransactionIds = [];
    this.selectedInterestTransactions = [];
    this.selectedPolicyIds = [];
    this.selectedInvoiceTransactionIds = [];
    this.selectedInvoiceTransactions = [];
    this.transactionsSearched = false;
    this.showSubmit = false;
  }

  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe((data: Wizard) => {
      this.isSubmitting = false;
      this.router.navigateByUrl(`${this.backLink}/debtor-debt-writeoff/continue/${data.id}`);
      this.toastr.successToastr('Debt write-off task has created successfully.', '', true);
    });
  }  
}
