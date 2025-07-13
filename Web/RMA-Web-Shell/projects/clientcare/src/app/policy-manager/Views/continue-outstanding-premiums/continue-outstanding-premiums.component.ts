import { AlertService } from './../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { UntypedFormGroup, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { Invoice } from 'projects/fincare/src/app/shared/models/invoice';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-continue-outstanding-premiums',
  templateUrl: './continue-outstanding-premiums.component.html',
  styleUrls: ['./continue-outstanding-premiums.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ContinueOutstandingPremiumsComponent extends WizardDetailBaseComponent<Case> {

  form: UntypedFormGroup;
  displayedColumns = ['invoiceNumber', 'invoiceDate', 'totalInvoiceAmount', 'invoiceStatus'];
  currentQuery: string;
  datasource = new MatTableDataSource<Invoice>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  insuredLivesToContinuePolicy: RolePlayer[];
  rowCount: number;
  isLoading: boolean;
  totalAmountUnpaid = 0;
  totalPendingToBeRaised = 0;
  totalAmountOutstanding = 0;
  actionEffectiveDate: string;
  effectiveDateMessage: string;
  effectiveDateCaptured: any;
  
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly invoiceService: InvoiceService,
    private readonly alertService: AlertService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      totalUnpaid: [''],
      adhocDebitDate: [null, [Validators.required]]
    });
  }

  populateForm() {
    if (this.model) {
      this.getOutstandingPremiums();
      const adhocDebit = this.model.mainMember.policies[0].adhocDebitDate;
      this.form.patchValue({ adhocDebitDate: adhocDebit ? this.getDateFormattedDate(adhocDebit) : null });
    }
  }

  populateModel() {
    this.model.mainMember.policies[0].adhocDebitDate = this.form.get('adhocDebitDate').value;
  }

  private getOutstandingPremiums(): void {
    this.isLoading = true;
    this.totalAmountUnpaid = 0;
    this.totalAmountOutstanding = 0;
    this.effectiveDateMessage = '';

    const policy = this.model.mainMember.policies[0];
    let effectiveDate: Date;

    switch (this.model.caseTypeId) {
      case CaseTypeEnum.ContinuePolicy:
        if (!this.model.newMainMember) {
          this.effectiveDateMessage = `New Main Member is required to continue the policy`;
        } else {
          effectiveDate = this.model.newMainMember.policy.policyInceptionDate;
          if (!effectiveDate) {
            this.effectiveDateMessage = `Continuation Effective Date is required on previous step to get an accurate calculation`;
          }
        }

        break;
      case CaseTypeEnum.ReinstatePolicy:
        effectiveDate = policy.lastReinstateDate;
        if (!effectiveDate) {
          this.effectiveDateMessage = `Reinstatement Effective Date is required on previous step to get an accurate calculation`;
        }
        break;
    }

    if (effectiveDate) {
      const policyId = policy.policyId;
      this.actionEffectiveDate = this.getDateFormattedDate(effectiveDate);
      this.invoiceService.getPartiallyAndUnpaidInvoicesByPolicyId(policyId).subscribe(
        (invoices) => {
          this.datasource.data = invoices;
          if (this.datasource.data && this.totalAmountUnpaid === 0) {
            this.datasource.data.forEach(c => this.totalAmountUnpaid += c.totalInvoiceAmount);
          }
          switch (this.model.caseTypeId) {
            case CaseTypeEnum.ContinuePolicy:
              this.invoiceService.getTotalPendingRaisedForContinuation(policyId, this.actionEffectiveDate).subscribe(
                (total: number) => this.calculateTotalOutstanding(total),
                (error: HttpErrorResponse) => this.handleError(error)
              );
              break;
            case CaseTypeEnum.ReinstatePolicy:
              this.invoiceService.getTotalPendingRaisedForReinstatement(policyId, this.actionEffectiveDate).subscribe(
                (total: number) => this.calculateTotalOutstanding(total),
                (error: HttpErrorResponse) => this.handleError(error)
              );
              break;
          }
        },
        (error: HttpErrorResponse) => this.handleError(error)
      );
    } else {
      this.isLoading = false;
    }
  }

  private calculateTotalOutstanding(total: number): void {
    this.totalPendingToBeRaised = total;
    this.totalAmountOutstanding = this.totalAmountUnpaid + this.totalPendingToBeRaised;
    this.isLoading = false;
  }

  private handleError(error: HttpErrorResponse): void {
    this.alertService.error(error.message);
    this.isLoading = false;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.form.get('adhocDebitDate').setErrors(null);
    if (!this.form.get('adhocDebitDate').value && this.totalAmountUnpaid > 0) {
      validationResult.errorMessages.push('Adhoc Debit Date is required');
      validationResult.errors += 1;
      this.form.get('adhocDebitDate').setErrors({ adhocDebitNoSet: true });
    }
    if (this.form.get('adhocDebitDate').value) {
      const dtm = new Date();
      dtm.setHours(0, 0, 0, 0);
      const today = new Date(dtm).getTime();
      const adhocDebitDate = new Date(this.form.get('adhocDebitDate').value).getTime();
      if (adhocDebitDate < today) {
        validationResult.errorMessages.push('Adhoc Debit Date cannot be in the past');
        validationResult.errors += 1;
        this.form.get('adhocDebitDate').setErrors({ invalidAdhoc: true });
      }
    }
    return validationResult;
  }

  getInvoiceStatusText(statusId: number) {
    switch (statusId) {
      case InvoiceStatusEnum.Unpaid:
        return 'Unpaid';
      case InvoiceStatusEnum.Paid:
        return 'Paid';
      case InvoiceStatusEnum.Partially:
        return 'Partially';
      case InvoiceStatusEnum.Pending:
        return 'Pending';
    }
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }
}
