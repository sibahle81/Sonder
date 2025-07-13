//import { Statement } from '@angular/compiler';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { AdjustmentDirection } from 'projects/fincare/src/app/shared/enum/adjustment-direction.enum';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DebtorDebtWriteOff } from '../../../models/debtor-debt-write-off';
import { WriteOffReasonEnum } from 'projects/fincare/src/app/shared/enum/write-off-reason-enum';
import { BadDebtWriteOff } from '../../../models/bad-debt-write-off';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Statement } from 'projects/fincare/src/app/shared/models/statement';

@Component({
  selector: 'app-write-off-details',
  templateUrl: './write-off-details.component.html',
  styleUrls: ['./write-off-details.component.css']
})
export class WriteOffDetailsComponent extends WizardDetailBaseComponent<DebtorDebtWriteOff>{

  isLoading = false;
  displayedColumns = ['documentNumber', 'description', 'amount'];
  displayedColumnsInvoices = ['documentNumber', 'description', 'amount'];
  displayedColumnsTransactionsSummary = ['transactionType', 'balance'];
  currentQuery: string;
  datasourceInvoices = new MatTableDataSource<BadDebtWriteOff>();
  datasourceInterest = new MatTableDataSource<BadDebtWriteOff>();
  datasourceTransactionsSummary = new MatTableDataSource<Statement>();
  form: UntypedFormGroup;

  @ViewChild('paginatorInvoices', { static: false }) paginatorInvoices: MatPaginator;
  @ViewChild('paginatorInterest', { static: false }) paginatorInterest: MatPaginator;
  @ViewChild('paginatorTransactionsSummary', { static: false }) paginatorTransactionsSummary: MatPaginator;

  rowCount: number;

  transactions: Statement[];
  transactiontypeText: string;
  showSubmit = false;
  rolePlayerId: number;
  rolePlayerName = '';
  isSubmitting: boolean;
  policies: RolePlayerPolicy[] = [];
  isLoadingPolicies: boolean;
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
  selectedTransactionId: number;
  adjustmentDirection: AdjustmentDirection
  adjustmentAmount: number;
  periodStatus: PeriodStatusEnum;
  writeOffReasons: { id: number, name: string }[]=[];
  selectedReasonId: number;
  debtorNetBalance: number;
  constructor(
    readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    appEventsManager: AppEventsManager,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.createForm();
  }

  onLoadLookups() {  
  }

  ngAfterViewInit() {
    this.datasourceInvoices.paginator = this.paginatorInvoices;
    this.datasourceInterest.paginator = this.paginatorInterest;
    this.paginatorTransactionsSummary = this.paginatorTransactionsSummary;
  }

  populateForm() {
    this.datasourceTransactionsSummary.data= [];
    this.writeOffReasons = this.ToKeyValuePair(WriteOffReasonEnum);
   
    if (!this.model) { return; } 
    let writeOffs: BadDebtWriteOff[] = [];
    if (this.model.badDebtWriteOffRequest.badDebtWriteOffs) {
      writeOffs = this.model.badDebtWriteOffRequest.badDebtWriteOffs;

     let selectedReason  = this.writeOffReasons
        .find(c => this.formatLookup(c.name).toLocaleLowerCase() === this.model.badDebtWriteOffRequest.reason.toLocaleLowerCase()); 
        this.selectedReasonId = selectedReason.id;
    }
 
    if (writeOffs.length > 0) {
      this.datasourceInterest.data = [...writeOffs.filter(w => w.transactionType == TransactionTypeEnum.Interest)];
      this.datasourceInvoices.data = [...writeOffs.filter(w => w.transactionType == TransactionTypeEnum.Invoice)];
    }

    this.debtorNetBalance = this.model.badDebtWriteOffRequest.amount;

    let totalBalanceInvoices = 0;
    writeOffs.filter(w => w.transactionType == TransactionTypeEnum.Invoice).forEach(element => {
      totalBalanceInvoices =totalBalanceInvoices+ element.amount; 
    });

    var invoicesSummary = new  Statement(); 
    invoicesSummary.transactionType = "Invoice Transactions";
    invoicesSummary.balance = totalBalanceInvoices;
    this.datasourceTransactionsSummary.data.push(invoicesSummary);

    let totalBalanceInterest = 0;
    writeOffs.filter(w => w.transactionType == TransactionTypeEnum.Interest).forEach(element => {
      totalBalanceInterest =totalBalanceInterest+ element.amount; 
    });

    var InterestSummary = new  Statement(); 
    InterestSummary.transactionType = "Interest Transactions";
    InterestSummary.balance = totalBalanceInterest;
    this.datasourceTransactionsSummary.data.push(InterestSummary);

  }

  populateModel() {
    if (this.selectedReasonId === +WriteOffReasonEnum.ClientQueryWriteOff) {
      this.model.badDebtWriteOffRequest.reason = 'Client Query Write Off';
    }
    else if (this.selectedReasonId === +WriteOffReasonEnum.LegalWriteOff) {
      this.model.badDebtWriteOffRequest.reason= 'Legal Write Off';
    }
    else if (this.selectedReasonId === +WriteOffReasonEnum.PartiallyCancelledWriteOff) {
      this.model.badDebtWriteOffRequest.reason= 'Partially Cancelled Write Off';
    }
  }

  createForm() {
    this.form = this.formbuilder.group({
      writeOffReason: [{ value: null }, Validators.required]
    });
     this.form.get('writeOffReason').setValue( this.selectedReasonId);
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
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

  getInvoiceTotals(): number {
    const total = this.datasourceInvoices.data.reduce((a, b) => a + b.amount, 0).toFixed(2);
    return +total;
  }

  getInterestTotals(): number {
    const total = this.datasourceInterest.data.reduce((a, b) => a + b.amount, 0).toFixed(2);
    return +total;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}