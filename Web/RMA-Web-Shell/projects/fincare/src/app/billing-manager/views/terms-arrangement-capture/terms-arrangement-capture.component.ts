import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { TermArrangementService } from '../../../shared/services/term-arrangement.service';
import { InvoicePaymentAllocation } from '../../models/invoicePaymentAllocation';
import { TermArrangement } from '../../models/term-arrangement';
import { TermArrangementSubsidiary } from '../../models/term-arrangement-subsidiary';
import { TermSubsidiaryDialogComponent } from '../terms-arrangement/term-subsidiary-dialog/term-subsidiary-dialog.component';
import { TermsConditionsDialogComponent } from '../terms-arrangement/terms-conditions-dialog/terms-conditions-dialog.component';
import { TermScheduleCaptureComponent } from '../terms-arrangement/term-schedule-capture/term-schedule-capture.component';
import { TermFlexibleSchedule } from '../../models/term-flexible-schedule';
import { PaymentScheduleEnum } from 'projects/shared-models-lib/src/lib/enums/payment-schedule-enum';
import { TermArrangementProductOption } from '../../models/term-arrangement-productoption';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { TermArrangementPaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-payment-frequency.enum';
import { BankBranchService } from 'projects/shared-services-lib/src/lib/services/lookup/bank-branch.service';

@Component({
  selector: 'app-terms-arrangement-capture',
  templateUrl: './terms-arrangement-capture.component.html',
  styleUrls: ['./terms-arrangement-capture.component.css']
})
export class TermsArrangementCaptureComponent extends WizardDetailBaseComponent<TermArrangement> implements OnInit {

  form: FormGroup;
  paymentFrequencies: { id: number, name: string }[];
  paymentMethods: { id: number, name: string }[];
  selectedPaymentMethodId = 0;
  memberNumber: string;
  memberName: string;
  rolePlayerId: number;
  invoiceNumber: string;
  invoiceBalance: number;
  invoiceId: number;
  selectedPaymentFrequencyId: number;
  selectedInvoiceIds: number[] = [];
  outstandingAmount = 0;
  unpaidInvoices: InvoicePaymentAllocation[] = [];
  agreementAccepted = false;
  sendAgreementToClient = false;
  installmentDays: { id: number, name: string }[] = [];
  selectedInstallmentDay: number;
  isLoadingInvoices$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  verifyingBank$ = new BehaviorSubject(false);
  branchCode = '0';
  accountNumber = '';
  bankAccountTypes: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  bankAccountType = 8;
  editClientEmail = false;
  accountHolderName = 'unknown';
  showAddBanking = false;
  accountValidationErrorMsg = '';
  isSearching: boolean;
  interval: any;
  accountNumberPopulated = new BehaviorSubject(false);
  noAutoApprovalReasons = [];
  ssrsBaseUrl: string;
  subsidiaries: TermArrangementSubsidiary[] = [];
  datasource = new MatTableDataSource<TermArrangementSubsidiary>();
  displayedColumns = ['finpayeeNumber', 'debtorName', 'balance', 'actions'];
  datasourceSchedules = new MatTableDataSource<{ month: number, amount: number }>();
  termFlexibleSchedules: TermFlexibleSchedule[] = [];
  displayedColumnsSchedule = ['month', 'amount', 'actions'];
  canAddFlexibleSchedule = new BehaviorSubject(false);
  selectedPaymentScheduleId = 1;
  selectedBankAccount: RolePlayerBankingDetail;
  rolePlayer: RolePlayer;
  paymentSchedules: any[];
  hidePaymentSchedule = true;
  isLoadingFixedPayment$ = new BehaviorSubject(false);
  minDate: Date;
  hasReadTermsAndConditions = new BehaviorSubject(false);
  mustConfirmTermsAndConditionsRead = false;
  termArrangementProductOptions: TermArrangementProductOption[] = [];
  termsSupportingDocumentsDocSet = DocumentSetEnum.TermsSupportingDocuments;
  finPayeNumber: string;
  wizardId: number;
  displayedColumnsProducts = ['finPayenumber', 'productName', 'amount', 'actions'];
  datasourceProducts = new MatTableDataSource<TermArrangementProductOption>();
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  requiredDocumentsUploaded = false;
  selectedBankId = 0;


  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager,
    private readonly integrationService: IntegrationService,
    private readonly termArrangementService: TermArrangementService,
    public subsidiaryDialog: MatDialog,
    public schedulesCaptureDialog: MatDialog,
    private readonly wizardService: WizardService,
    private readonly rolePlayerService: RolePlayerService, private readonly bankBranchService: BankBranchService) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngOnInit() {
    if (this.isDisabled) {
      this.displayedColumns = ['finpayeeNumber', 'debtorName', 'balance'];
      this.displayedColumnsSchedule = ['month', 'amount'];
    }

    this.onLoadLookups();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    });
    if (this.isDisabled) {
      this.hidePaymentSchedule = true;
    }
  }

  createForm(id: number): void {
    this.minDate = new Date();
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      displayName: [],
      paymentFrequency: [{ value: null }, Validators.required],
      paymentMethod: [{ value: null }, Validators.required],
      outstandingAmount: [null, Validators.required],
      numberOfPayments: [],
      numberOfMonths: [],
      acceptAgreement: [],
      installmentAmount: [],
      sendAgreementToClient: [],
      bankBranchCode: [null],
      bankAccountNumber: [null],
      bankAccountType: [null],
      bankBranchId: [null],
      name: [null],
      bankId: [null],
      paymentSchedule: [{ value: null }, Validators.required],
      termStartDate: [null, Validators.required],
      installmentDay: [0],
    });
  }

  onLoadLookups(): void {
    this.paymentMethods = this.ToKeyValuePair(PaymentMethodEnum).filter((t: { id: number, name: string }) => [+PaymentMethodEnum.EFT, +PaymentMethodEnum.DebitOrder, +PaymentMethodEnum.Cash].includes(t.id));
    this.paymentFrequencies = this.ToKeyValuePair(TermArrangementPaymentFrequencyEnum);
    this.paymentSchedules = this.ToKeyValuePair(PaymentScheduleEnum);
    this.createInstallmentDays();
  }

  getRolePlayer() {
    this.rolePlayerService.getRolePlayer(this.model.rolePlayerId).subscribe(result => {
      if (result) this.rolePlayer = result;
    });
  }

  populateModel(): void {
    this.model.rolePlayerId = this.rolePlayerId;
    this.model.memberName = this.memberName;
    this.model.memberNumber = this.memberNumber;
    this.model.invoiceNumber = this.invoiceNumber;
    this.model.invoiceBalance = this.invoiceBalance;
    this.model.totalAmount = this.form.get('outstandingAmount').value;
    this.model.paymentMethod = this.selectedPaymentMethodId;
    this.model.sendAgreementToClient = this.sendAgreementToClient;
    this.model.termMonths = this.form.get('numberOfMonths').value;
    this.model.numberOfPayments = this.form.get('numberOfPayments').value;
    this.model.termArrangementPaymentFrequency = this.selectedPaymentFrequencyId;
    this.model.startDate = new Date(this.form.get('termStartDate').value).getCorrectUCTDate();
    this.model.noAutoApprovalReasons = this.noAutoApprovalReasons;
    this.model.installmentDay = this.form.get('installmentDay').value;
    if (this.subsidiaries && this.subsidiaries.length > 0) {
      this.model.termArrangementSubsidiaries = [...this.subsidiaries];
    }
    if (this.termFlexibleSchedules && this.termFlexibleSchedules.length > 0) {
      this.model.termFlexibleSchedules = [...this.termFlexibleSchedules];
    }
    if (this.termArrangementProductOptions && this.termArrangementProductOptions.length > 0) {
      this.model.termArrangementProductOptions = [...this.termArrangementProductOptions];
    }
    if (this.selectedBankAccount) {
      this.model.rolePlayerBankingId = this.selectedBankAccount.rolePlayerBankingId;
    }
  }

  calculatenumberOfMonthsMonths(numberOfPayments: number, selectedPaymentFrequencyId: number): number {
    if (selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.Weekly) {
      return numberOfPayments / 4;
    }

    if (selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.BiWeekly) {
      return numberOfPayments / 2;
    }
    this.disableFormControl('numberOfMonths');
    return 0;
  }

  populateForm(): void {
    this.rolePlayerId = this.model.rolePlayerId;
    this.getRolePlayer();
    this.finPayeNumber = this.model.memberNumber;
    this.memberNumber = this.model.memberNumber;
    this.memberName = this.model.memberName;

    if (this.model.paymentMethod) {
      this.selectedPaymentMethodId = this.model.paymentMethod;
    }
    if (this.model.termArrangementPaymentFrequency) {
      this.selectedPaymentFrequencyId = this.model.termArrangementPaymentFrequency;
    }

    this.sendAgreementToClient = this.model.sendAgreementToClient;
    this.wizardId = this.context.wizard.id;

    if (this.model) {
      this.form.patchValue({
        displayName: this.memberName,
        paymentFrequency: this.selectedPaymentFrequencyId ? this.selectedPaymentFrequencyId : 0,
        paymentMethod: this.model.paymentMethod ? this.model.paymentMethod : 0,
        sendAgreementToClient: this.sendAgreementToClient,
        numberOfMonths: this.model.termMonths ? this.model.termMonths : 0,
        installmentDay: this.model.installmentDay,
        numberOfPayments: this.model.numberOfPayments ? this.model.numberOfPayments : 0,
      });

      if (this.model.startDate) {
        if (!this.model.startDate.toString().includes('0001')) {
          this.form.patchValue({
            termStartDate: this.model.startDate
          });
        }
      }

      if (this.model.rolePlayerBankingId != undefined && this.model.rolePlayerBankingId > 0) {
        this.showAddBanking = true;
      }
    }

    if (this.model.noAutoApprovalReasons) {
      this.noAutoApprovalReasons = this.model.noAutoApprovalReasons;
    }

    if (this.model.termArrangementSubsidiaries && this.model.termArrangementSubsidiaries.length > 0) {
      this.subsidiaries = this.model.termArrangementSubsidiaries;
      this.datasource.data = [...this.subsidiaries];
    }

    if (this.model.termArrangementProductOptions && this.model.termArrangementProductOptions.length > 0) {
      this.datasourceProducts.data = [...this.model.termArrangementProductOptions];

      this.outstandingAmount = +(this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2));
      this.form.get('outstandingAmount').setValue(this.outstandingAmount);
      this.termArrangementProductOptions = [...this.model.termArrangementProductOptions];
    }

    if (this.model.termFlexibleSchedules && this.model.termFlexibleSchedules.length > 0) {
      this.termFlexibleSchedules = this.model.termFlexibleSchedules;
      this.datasourceSchedules.data = [...this.termFlexibleSchedules].sort(c => +(c.month));
      this.form.get('paymentSchedule')?.setValue(+PaymentScheduleEnum.Flexible);
    }
    else {
      this.form.get('paymentSchedule')?.setValue(+PaymentScheduleEnum.Fixed);
    }

    if (this.form.get('numberOfPayments').value > 0) {
      this.calculateInstallment();
    }
    this.disableFormControl('outstandingAmount');
    this.disableFormControl('installmentAmount');
    this.disableFormControl('displayName');
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.outstandingAmount <= 0) {
      validationResult.errorMessages.push('Outstanding amount invalid');
      validationResult.errors++;
    }
    if (this.agreementAccepted === false && this.mustConfirmTermsAndConditionsRead) {
      validationResult.errorMessages.push('Agreement not accepted');
      validationResult.errors++;
    }

    if (this.form.get('numberOfPayments').value <= 0 && (this.selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.Monthly || this.selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.Weekly || this.selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.BiWeekly)) {
      validationResult.errorMessages.push('Number of payments is invalid');
      validationResult.errors++;
    }

    if (this.selectedPaymentMethodId === 0) {
      validationResult.errorMessages.push('Payment method is mandatory');
      validationResult.errors++;
    }

    if (this.selectedPaymentFrequencyId === 0) {
      validationResult.errorMessages.push('Payment frequency is mandatory');
      validationResult.errors++;
    }

    if (this.termFlexibleSchedules && this.termFlexibleSchedules.length > 0) {
      if (this.termFlexibleSchedules.length !== this.form.get('numberOfPayments').value) {
        validationResult.errorMessages.push('Schedule number of months dont add up to selected number of months');
        validationResult.errors++;
      }
    }

    if (this.termFlexibleSchedules && this.termFlexibleSchedules.length > 0) {
      const amounts = [...this.termFlexibleSchedules.values()];
      const scheduleAmounts = amounts.reduce((a, b) => a + b.amount, 0);
      if (this.termFlexibleSchedules.length === this.form.get('numberOfPayments').value && scheduleAmounts !== this.form.get('outstandingAmount').value) {
        validationResult.errorMessages.push('Payment Schedule does not sum up to outstanding amount');
        validationResult.errors++;
      }
    }

    return validationResult;
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

  calculateInstallment() {
    this.isLoadingFixedPayment$.next(true);
    let numberOfInstallments = 0;
    switch (this.selectedPaymentFrequencyId) {
      case +TermArrangementPaymentFrequencyEnum.Annually:
        numberOfInstallments = 1;
        break;
      case +TermArrangementPaymentFrequencyEnum.Monthly:
        numberOfInstallments = this.form.get('numberOfPayments').value;
        break;
      case +TermArrangementPaymentFrequencyEnum.Quarterly:
        numberOfInstallments = 4;
        break;
      case +TermArrangementPaymentFrequencyEnum.BiAnnually:
        numberOfInstallments = 2;
        break;
      case +TermArrangementPaymentFrequencyEnum.Weekly:
        numberOfInstallments = this.form.get('numberOfPayments').value;
        break;
      case +TermArrangementPaymentFrequencyEnum.BiWeekly:
        numberOfInstallments = this.form.get('numberOfPayments').value;
        break;
    }
    if (numberOfInstallments > 0) {
      const installment = +(this.outstandingAmount / numberOfInstallments).toFixed(2);

      this.enableFormControl('installmentAmount');
      this.form.get('installmentAmount').setValue(installment);
      this.disableFormControl('installmentAmount');
    }
    this.isLoadingFixedPayment$.next(false);
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  agreementChecked(event: any) {
    if (event.checked) {
      this.agreementAccepted = true;
    } else {
      this.agreementAccepted = false;
    }
  }
  sendAgreementToClientChecked(event: any) {
    if (event.checked) {
      this.sendAgreementToClient = true;
    } else {
      this.sendAgreementToClient = false;
    }
  }

  readTermsAndConditions() {
    this.populateModel();
    if (!this.isDisabled) {
      this.saveWizardDataForMoa();
    }
    else {
      this.openMoaTermsDialog();
    }
  }

  createInstallmentDays() {
    for (let i = 1; i <= 31; i++) {
      this.installmentDays.push({ id: i, name: i.toString() });
    }
  }

  setBankAccount($event: RolePlayerBankingDetail) {
    this.selectedBankAccount = $event;

    if(this.selectedBankAccount)
    {
      this.model.rolePlayerBankingId = this.selectedBankAccount.rolePlayerBankingId;
    }
  }

  getBranch(branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'unknown';
  }

  onBankAccountTypeSelect(event: any) {
    this.bankAccountType = event.value;
  }

  editEmail() {
    this.form.get('clientEmail').enable();
  }

  cancelBankAdd() {
    this.showAddBanking = false;
  }

  logAccountNumberPopulated(accountNumber: string) {
    if (accountNumber.length > 3) {
      this.accountNumberPopulated.next(true);
    } else {
      this.accountNumberPopulated.next(false);
    }
  }

  paymentMethodChanged($event: PaymentMethodEnum) {
    if ($event === +PaymentMethodEnum.DebitOrder) {
      var x= this.rolePlayer;
      this.showAddBanking = true;
    } else {
      this.showAddBanking = false;
    }
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }

  paymentFrequencyChanged() {
    let numberOfInstallments: number;
    switch (this.selectedPaymentFrequencyId) {
      case +TermArrangementPaymentFrequencyEnum.Quarterly:
        numberOfInstallments = 4;
        break;
      case +TermArrangementPaymentFrequencyEnum.BiAnnually:
        numberOfInstallments = 2;
        break;
      case +TermArrangementPaymentFrequencyEnum.Annually:
        numberOfInstallments = 1;
        break;
    }

    if (this.selectedPaymentFrequencyId == +TermArrangementPaymentFrequencyEnum.Quarterly
      || this.selectedPaymentFrequencyId == +TermArrangementPaymentFrequencyEnum.BiAnnually
      || this.selectedPaymentFrequencyId == +TermArrangementPaymentFrequencyEnum.Annually) {
      this.form.get('numberOfPayments').setValue(numberOfInstallments);
      this.disableFormControl('numberOfPayments');
      this.disableFormControl('numberOfMonths');
      this.form.get('numberOfMonths').setValue(0);
    }
    else if (this.selectedPaymentFrequencyId == +TermArrangementPaymentFrequencyEnum.Monthly) {
      this.enableFormControl('numberOfPayments');
      this.disableFormControl('numberOfMonths');
      this.form.get('numberOfMonths').setValue(1);
    }
    else {
      this.disableFormControl('numberOfPayments');
      this.enableFormControl('numberOfMonths');
      this.form.get('numberOfMonths').setValue(0);
      this.form.get('numberOfPayments').setValue(0);
    }

    if (this.selectedPaymentScheduleId === +PaymentScheduleEnum.Fixed) {
      this.calculateInstallment();
    }
  }

  addSubsidiary() {
    const dialogref = this.subsidiaryDialog.open(TermSubsidiaryDialogComponent, {
      width: '80%', height: 'auto'
    });
    dialogref.afterClosed().subscribe((data) => {
      if (data && data.debtor) {
        let balance = 0;
        let subsidairyProductOptions: TermArrangementProductOption[] = [];
        if (data.termArrangementProductOptions as TermArrangementProductOption[]) {
          subsidairyProductOptions = [...data.termArrangementProductOptions];
          this.termArrangementProductOptions.push(...data.termArrangementProductOptions);
          let options = [... this.datasourceProducts.data];
          options.push(...data.termArrangementProductOptions);
          //force datasource refresh
          this.datasourceProducts.data = [...options];
          balance = +data.termArrangementProductOptions.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
          this.form.get('outstandingAmount').setValue(+this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2));
        }
        this.addSubsidiaryToDatasource(data.debtor.roleplayerId, data.debtor.displayName, data.debtor.finPayeNumber, balance);
      }
    });
  }

  addSubsidiaryToDatasource(roleplayerId: number, debtorName: string, finpayeeNumber: string, balance: number) {
    this.subsidiaries.push({ balance, finpayeeNumber, debtorName, roleplayerId });
    this.datasource.data = [...this.subsidiaries];
    this.model.termArrangementSubsidiaries = [...this.subsidiaries];
    this.calculateInstallment();
  }

  removeDebtor(item: TermArrangementSubsidiary) {
    for (let i = 0; i < this.subsidiaries.length; i++) {
      if ((this.subsidiaries[i].roleplayerId === item.roleplayerId)) {
        this.subsidiaries.splice(i, 1);
        break;
      }
    }

    let options = [... this.datasourceProducts.data];
    let indexes = [];
    for (let i = 0; i < options.length; i++) {
      if ((options[i].roleplayerId === item.roleplayerId)) {
        indexes.push(i);
      }
    }

    indexes.forEach(i => { options.splice(i, 1); })
    this.datasourceProducts.data = [...options];
    this.datasource.data = [...this.subsidiaries];
    this.calculateInstallment();
  }

  addScheduleLineItem() {
    const monthsNotCaptured = this.getMonthsNotCaptured();
    const dialogref = this.schedulesCaptureDialog.open(TermScheduleCaptureComponent, {
      width: '80%', height: 'auto', data: { monthsNotCaptured }
    });
    dialogref.afterClosed().subscribe((data) => {
      if (data && data.amount > 0 && data.month) {

        this.termFlexibleSchedules.push({ amount: data.amount, month: data.month });
        this.datasourceSchedules.data = [...this.termFlexibleSchedules.sort(c => +(c.month))];
      }
    });
  }

  getMonthsNotCaptured(): number[] {
    const numberOfPayments = this.form.get('numberOfPayments').value;
    let months = [];
    if (this.termFlexibleSchedules && this.termFlexibleSchedules.length > 0) {
      for (let i = 1; i <= numberOfPayments; i++) {
        if (this.termFlexibleSchedules.findIndex(c => c.month === i) < 0) {
          months.push(i);
        }
      }
    }
    else {
      for (let i = 1; i <= numberOfPayments; i++) {
        months.push(i);
      }
    }
    return months;
  }

  removeSchedule(item: { month: number, amount: number }) {
    for (let i = 0; i < this.termFlexibleSchedules.length; i++) {
      if ((this.termFlexibleSchedules[i].amount === item.amount && this.termFlexibleSchedules[i].month === item.month)) {
        this.termFlexibleSchedules.splice(i, 1);
        break;
      }
    }
    this.datasourceSchedules.data = [...this.termFlexibleSchedules];
  }

  paymentScheduleChanged() {
    if (this.selectedPaymentScheduleId === +PaymentScheduleEnum.Fixed) {
      this.hidePaymentSchedule = true;
      this.calculateInstallment();
      this.termFlexibleSchedules = [];
    } else {
      this.hidePaymentSchedule = false;
      this.enableFormControl('installmentAmount');
      this.form.get('installmentAmount').setValue(0);
      this.disableFormControl('installmentAmount');
    }
  }

  getFlexibleScheduleTotal(): number {
    const total = this.datasourceSchedules.data.reduce((a, b) => a + b.amount, 0).toFixed(2);
    return +total;
  }

  onNumberOfPaymentsChanged(value: number): void {
    if (value > 0 && this.selectedPaymentScheduleId === +PaymentScheduleEnum.Fixed) {
      this.calculateInstallment();

      if (this.selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.Monthly) {
        this.form.get('numberOfMonths').setValue(value)
      }
    }
  }

  onNumberOfMonthsChanged(value: number): void {
    if (value > 0 && this.selectedPaymentScheduleId === +PaymentScheduleEnum.Fixed) {

      let months = this.form.get('numberOfMonths')?.value ?? 0;

      let numberOfInstallments: number;
      switch (this.selectedPaymentFrequencyId) {
        case +TermArrangementPaymentFrequencyEnum.Quarterly:
          numberOfInstallments = 4;
          break;
        case +TermArrangementPaymentFrequencyEnum.BiAnnually:
          numberOfInstallments = 2;
          break;
        case +TermArrangementPaymentFrequencyEnum.Annually:
          numberOfInstallments = 1;
          break;
        case +TermArrangementPaymentFrequencyEnum.BiWeekly:
          numberOfInstallments = 2 * months;
          break;
        case +TermArrangementPaymentFrequencyEnum.Weekly:
          numberOfInstallments = 4 * months;
          break;
      }

      if (this.selectedPaymentFrequencyId !== +TermArrangementPaymentFrequencyEnum.Monthly) {
        this.form.get('numberOfPayments').setValue(numberOfInstallments);
        this.disableFormControl('numberOfPayments');
      }
      else {
        this.enableFormControl('numberOfPayments');
        this.disableFormControl('numberOfMonths');
      }
      this.calculateInstallment();
    }
  }

  getProductTotals(): number {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    return +total;
  }

  saveWizardData(): void {
    const saveWizardRequest = this.context.createSaveWizardRequest();
    saveWizardRequest.updateLockedUser = false;
    this.wizardService.saveWizard(saveWizardRequest).subscribe();
  }

  openMoaTermsDialog() {
    var dialogRerf = this.dialog.open(TermsConditionsDialogComponent, { width: '80%', height: 'auto', data: { wizardId: this.context.wizard.id, ssrsBaseUrl: this.ssrsBaseUrl } });

    dialogRerf.afterClosed().subscribe((data) => {
      if (!this.isDisabled) {
        this.hasReadTermsAndConditions.next(true);
        this.mustConfirmTermsAndConditionsRead = true;
      }
    });
  }

  saveWizardDataForMoa(): void {
    const saveWizardRequest = this.context.createSaveWizardRequest();
    saveWizardRequest.updateLockedUser = false;
    this.wizardService.saveWizard(saveWizardRequest).subscribe(data => {
      this.openMoaTermsDialog();
    });
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }
}
