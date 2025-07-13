import { Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { InterestReversal } from '../../../models/interest-reversal';
import { Statement } from '../../../../shared/models/statement';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

@Component({
  selector: 'app-interest-reversal-details',
  templateUrl: './interest-reversal-details.component.html',
  styleUrls: ['./interest-reversal-details.component.css']
})
export class InterestReversalDetailsComponent extends WizardDetailBaseComponent<InterestReversal>  {
  isLoading = false;
  displayedColumns = ['transactionType', 'documentNumber', 'description', 'transactionDate', 'amount', 'balance', 'period'];
  currentQuery: string;
  datasource = new MatTableDataSource<Statement>();
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  rowCount: number;

  transactions: Statement[];
  selectedTransactionIds: number[] = [];
  transactiontypeText: string;
  showSubmit = false;
  rolePlayerId: number;
  rolePlayerName = '';
  isSubmitting: boolean;
  policies: RolePlayerPolicy[] = [];
  isLoadingPolicies: boolean;
  policyId: number;
  accountSearchResult: DebtorSearchResult;
  debtorSearchResult: DebtorSearchResult;
  hasCreateReversalPermission = false;
  isAuthorized = false;
  isRefreshing = false;
  message: string;
  selectedPeriodStatus: PeriodStatusEnum;
  backLink = '/fincare/billing-manager';
  selectedTransactions: Statement[] = [];


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

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm() {
    if (!this.model) { return; }

    if (this.model.transactions) {
      this.selectedTransactions = [...this.model.transactions];
      this.datasource.data = [...this.model.transactions];
    }

  }

  populateModel() {
    this.model.note.text = this.form.value.reason as string;
  }

  createForm() {
    this.form = this.formbuilder.group({
      reason: [null]
    });
    if (this.model?.note.text) {
      this.form.get('reason').setValue(this.model.note.text);
    }
    if (this.isDisabled) {
      this.form.get('reason').disable();
    }
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }  
}