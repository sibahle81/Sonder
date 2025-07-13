import { Statement } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Validators } from 'ngx-editor';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { AdjustmentDirection } from 'projects/fincare/src/app/shared/enum/adjustment-direction.enum';
import { ReinstateReasonEnum } from 'projects/fincare/src/app/shared/enum/reinstate-reason-enum';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { BadDebtReinstate } from '../../../models/bad-debt-reinstate';
import { DebtorDebtReinstate } from '../../../models/debtor-debt-reinstate';

@Component({
  selector: 'app-bad-debt-reinstate-details',
  templateUrl: './bad-debt-reinstate-details.component.html',
  styleUrls: ['./bad-debt-reinstate-details.component.css']
})
export class BadDebtReinstateDetailsComponent extends WizardDetailBaseComponent<DebtorDebtReinstate>{

  isLoading = false;
  displayedColumns = ['documentNumber', 'description', 'amount'];
  displayedColumnsInvoices = ['documentNumber', 'description', 'amount'];
  currentQuery: string;
  datasourceInvoices = new MatTableDataSource<BadDebtReinstate>();
  datasourceTransactions = new MatTableDataSource<BadDebtReinstate>();
  form: UntypedFormGroup;

  @ViewChild('paginatorInvoices', { static: false }) paginatorInvoices: MatPaginator;
  @ViewChild('paginatorInterest', { static: false }) paginatorInterest: MatPaginator;

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
  reinstateReasons: { id: number, name: string }[] = [];
  selectedReasonId: number;
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
    this.datasourceTransactions.paginator = this.paginatorInterest;
  }

  populateForm() {
    this.reinstateReasons = this.ToKeyValuePair(ReinstateReasonEnum);

    if (!this.model) { return; }
    let reinstates: BadDebtReinstate[] = [];
    if (this.model.badDebtReinstateRequest.badDebtReinstates) {
      reinstates = this.model.badDebtReinstateRequest.badDebtReinstates;
      this.selectedReasonId = +ReinstateReasonEnum.PremiumReinstate;
    }

    if (reinstates.length > 0) {
      this.datasourceTransactions.data =  reinstates;

    }
  }

  populateModel() {

  }

  createForm() {
    this.form = this.formbuilder.group({
      reinstateReason: [{ value: null }, Validators.required]
    });
    this.form.get('reinstateReason').setValue(this.selectedReasonId);
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
    const total = this.datasourceTransactions.data.reduce((a, b) => a + b.amount, 0).toFixed(2);
    return +total;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}