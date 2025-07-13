import { Component, OnInit, ViewChild } from '@angular/core';
import { AdhocInterestWizard } from '../../wizards/adhoc-interest-wizard';

import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { tap } from 'rxjs/operators';
import { AdjustmentDirection } from '../../../shared/enum/adjustment-direction.enum';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { InterestAdjustment } from '../../models/interest-adjustment';
import { TransactionsService } from '../../services/transactions.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Statement } from '../../../shared/models/statement';

@Component({
  selector: 'app-interst-adjustment-details',
  templateUrl: './interst-adjustment-details.component.html',
  styleUrls: ['./interst-adjustment-details.component.css']
})
export class InterstAdjustmentDetailsComponent extends WizardDetailBaseComponent<InterestAdjustment>{
  isLoading = false;
  displayedColumns = ['description','documentNumber', 'transactionDate', 'amount', 'period'];
  currentQuery: string;
  datasource = new MatTableDataSource<Statement>();
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

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
  originalAmount = 0;
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

    if (this.model.transaction) {
      this.datasource.data.push(this.model.transaction);
    }   
  }

  populateModel() {
  }

  createForm() {
    this.form = this.formbuilder.group({
      transactionAmount: [null],
      totalAfterAdjustment: [null],
      adjustmentDirection: [null],
      adjustmentAmount: [null]
    });

    if (this.model?.transaction?.amount) {
      this.form.get('transactionAmount').setValue(this.model?.transaction?.amount);
      this.originalAmount = this.model?.transaction?.amount;
    }

    if (this.model?.isUpwardAdjustment) {
      this.form.get('adjustmentDirection').setValue("Upward");
      const adjustementAmount = this.originalAmount + (+this.model?.adjustmentAmount);
      this.enableFormControl('totalAfterAdjustment');
      this.form.get('totalAfterAdjustment').setValue(adjustementAmount.toFixed(2));
      this.disableFormControl('totalAfterAdjustment');
    }
    else {
      this.form.get('adjustmentDirection').setValue("Downward");
      const adjustementAmount = this.originalAmount - (+this.model?.adjustmentAmount);
      this.enableFormControl('totalAfterAdjustment');
      this.form.get('totalAfterAdjustment').setValue(adjustementAmount.toFixed(2));
      this.disableFormControl('totalAfterAdjustment');
    }

    if (this.model?.adjustmentAmount) {
      this.form.get('adjustmentAmount').setValue(this.model?.adjustmentAmount);
    }
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }
}