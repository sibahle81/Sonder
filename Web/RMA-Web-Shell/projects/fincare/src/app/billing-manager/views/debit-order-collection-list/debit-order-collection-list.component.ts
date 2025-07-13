import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DebitOrderCollectionDatasource } from './debit-order-collection-list.datasource';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AdhocPaymentInstruction } from '../../models/adhoc-payment-instruction';
import { BehaviorSubject } from 'rxjs';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ValidateMinDateToday } from 'projects/shared-utilities-lib/src/lib/validators/min-date-today.validator';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import * as moment from 'moment';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  templateUrl: './debit-order-collection-list.component.html',
  styleUrls: ['./debit-order-collection-list.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})

export class DebitOrderCollectionListComponent extends WizardDetailBaseComponent<AdhocPaymentInstruction[]> {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoadingDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  debtors: SearchAccountResults[];
  selectedDebtorNumber = null;
  selectedDebtorId = null;
  selectedDebtorName = null;

  minDate: Date;
  displayedColumns = ['finPayeNumber', 'rolePlayerName', 'amount', 'dateToPay', 'bankAccountHolder', 'bank', 'bankAccountNumber', 'bankAccountType', 'actions'];

  debitOrderForm: UntypedFormGroup;

  activeSection = 'showDebitOrders';

  isDisabled = true;
  isWizard = false;

  hasNoActiveBankingDetails = false;
  isLoadingBankingDetails$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly invoiceService: InvoiceService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly alertService: AlertService,
    public readonly dataSource: DebitOrderCollectionDatasource,
    private readonly toastr: ToastrManager) {
    super(appEventsManager, authService, activatedRoute);
    this.minDate = this.getMinDate();
  }

  getMinDate(): Date {
    const today = new Date();
    const format = 'HH:mm:ss';
    const time = moment();
    const beforeTime = moment('00:00:00', format);
    const afterTime = moment('12:00:00', format);

    if (time.isBetween(beforeTime, afterTime)) {
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else {
      return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    }
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.dataSource.setControls(this.paginator, this.sort);

    this.debitOrderForm = this.formBuilder.group({
      debtorQuery: ['', [Validators.minLength(3), Validators.required]],
      debtorNumber: [null, Validators.required],
      debtor: [null],
      debitOrderDate: ['', [Validators.required, ValidateMinDateToday]],
      amount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  showAddDebitOrder(): void {
    this.debtors = null;
    this.selectedDebtorNumber = null;
    this.selectedDebtorId = null;
    this.selectedDebtorName = null;

    this.debitOrderForm.patchValue({
      debtorQuery: '',
      debtorNumber: '',
      debtor: '',
      amount: null,
      debitOrderDate: new Date().getDate() + 1
    });

    this.showSection('addDebitOrder');
  }

  showSection(section: string) {
    this.hasNoActiveBankingDetails = false;
    this.activeSection = section;
  }

  populateForm(): void {
    this.isWizard = this.context.wizard.wizardStatusId === WizardStatus.InProgress;
    this.dataSource.getData(this.model);
    this.dataSource.isLoading$.next(false);
  }

  populateModel(): void {
    if (this.dataSource.data.length > 0) {
      this.model = this.dataSource.data;
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model || this.model.length === 0) {
      validationResult.errors++;
    }

    return validationResult;
  }

  getDebtors(query: string) {
    this.isLoadingDebtors$.next(true);
    this.invoiceService.searchDebtors(query).subscribe(results => {
      this.debtors = results;
      this.isLoadingDebtors$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingDebtors$.next(false); });
  }

  searchForDebtor() {
    const query = this.debitOrderForm.get('debtorQuery').value as string;
    if (query.length > 2) {
      this.getDebtors(query);
    }
  }

  selectedDebtorChanged(selectedDebtorId: number, selectedDebtorNumber: string, selectedDebtorName: string) {
    this.selectedDebtorNumber = selectedDebtorNumber;
    this.selectedDebtorId = selectedDebtorId;
    this.selectedDebtorName = selectedDebtorName;
    this.debitOrderForm.patchValue({
      debtorNumber: this.selectedDebtorNumber,
      debtor: this.selectedDebtorName
    });
    this.debtors = null;
  }

  undoDebtorChanged() {
    this.selectedDebtorNumber = null;
    this.selectedDebtorId = null;
    this.selectedDebtorName = null;
    this.debitOrderForm.patchValue({
      debtorNumber: null,
      debtor: null,
      amount: null,
      debitOrderDate: new Date().getDate() + 1
    });
  }

  enable(): void {
    this.isDisabled = false;
    this.debitOrderForm.enable();
  }

  disable(): void {
    this.isDisabled = true;
    this.debitOrderForm.disable();
  }

  readDebitOrderForm(): AdhocPaymentInstruction {
    const value = this.debitOrderForm.value;
    const debitOrder = new AdhocPaymentInstruction();
    debitOrder.adhocPaymentInstructionId = 0;
    const dateToPay = new Date(value.debitOrderDate);
    dateToPay.setHours(0, 0, 0, 0);
    debitOrder.rolePlayerId = this.selectedDebtorId;
    debitOrder.rolePlayerName = this.selectedDebtorName;
    debitOrder.finPayeNumber = this.selectedDebtorNumber;
    debitOrder.dateToPay = dateToPay;
    debitOrder.amount = value.amount;
    debitOrder.adhocPaymentInstructionStatus = 1;
    return debitOrder;
  }

  addDebitOrder(): void {
    if (!this.debitOrderForm.valid) { return; }
    const debitOrder = this.readDebitOrderForm();
    this.hasNoActiveBankingDetails = false;
    this.isLoadingBankingDetails$.next(true);
    this.rolePlayerService.getActiveBankingDetails(debitOrder.rolePlayerId).
      subscribe((data: RolePlayerBankingDetail) => {
        this.isLoadingBankingDetails$.next(false);
        if (data) {
          this.hasNoActiveBankingDetails = false;
          debitOrder.bank = data.bankName;
          debitOrder.bankAccountEffectiveDate = data.effectiveDate;
          debitOrder.bankAccountNumber = data.accountNumber;
          debitOrder.bankBranchCode = data.branchCode;
          debitOrder.bankAccountHolder = data.accountHolderName;
          debitOrder.bankAccountType = BankAccountTypeEnum[data.bankAccountType];
          this.model.push(debitOrder);
          this.dataSource.dataChange.next(this.model);
          this.showSection('showDebitOrders');
        } else {
          this.hasNoActiveBankingDetails = true;
        }
      });
  }

  remove(debitOrder: AdhocPaymentInstruction): void {
    if (!this.isWizard) {
      return;
    }

    this.model = this.model.filter(item => item.finPayeNumber !== debitOrder.finPayeNumber);
    this.dataSource.dataChange.next(this.model);
  }
}
