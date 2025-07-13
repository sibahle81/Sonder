import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DeclarationService } from "projects/clientcare/src/app/member-manager/services/declaration.service";
import { PolicyService } from "projects/clientcare/src/app/policy-manager/shared/Services/policy.service";
import { RolePlayerService } from "projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service";
import { ComplianceResult } from "projects/clientcare/src/app/policy-manager/shared/entities/compliance-result";
import { Policy } from "projects/clientcare/src/app/policy-manager/shared/entities/policy";
import { TermArrangement } from "projects/fincare/src/app/billing-manager/models/term-arrangement";
import { DebtorStatusEnum } from "projects/fincare/src/app/shared/enum/debtor-status.enum";
import { TermArrangementService } from "projects/fincare/src/app/shared/services/term-arrangement.service";
import { BankAccountTypeEnum } from "projects/shared-models-lib/src/lib/enums/bank-account-type-enum";
import { PaymentFrequencyEnum } from "projects/shared-models-lib/src/lib/enums/payment-frequency.enum";
import { PaymentScheduleEnum } from "projects/shared-models-lib/src/lib/enums/payment-schedule-enum";
import { PaymentMethodEnum } from "projects/shared-models-lib/src/lib/enums/payment-method-enum";
import { TermArrangementStatusEnum } from "projects/shared-models-lib/src/lib/enums/term-arrangement-status";
import { BankBranch } from "projects/shared-models-lib/src/lib/lookup/bank-branch";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { BehaviorSubject } from "rxjs";
import { StartWizardRequest } from "../wizard/shared/models/start-wizard-request";
import { FinPayee } from "projects/fincare/src/app/shared/models/finpayee";
import { WizardService } from "../wizard/shared/services/wizard.service";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router } from "@angular/router";
import { DocumentSetEnum } from "projects/shared-models-lib/src/lib/enums/document-set.enum";
import { DocumentSystemNameEnum } from "../document/document-system-name-enum";
import { RolePlayerBankingDetail } from "../models/banking-details.model";
import { RolePlayer } from "projects/clientcare/src/app/policy-manager/shared/entities/roleplayer";
import { InvoiceStatusEnum } from "projects/shared-models-lib/src/lib/enums/invoice-status-enum";
import { TermFlexibleSchedule } from "projects/fincare/src/app/billing-manager/models/term-flexible-schedule";
import { TermsConditionsDialogComponent } from "projects/fincare/src/app/billing-manager/views/terms-arrangement/terms-conditions-dialog/terms-conditions-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { TermSubsidiaryDialogComponent } from "projects/fincare/src/app/billing-manager/views/terms-arrangement/term-subsidiary-dialog/term-subsidiary-dialog.component";
import { TermArrangementSubsidiary } from "projects/fincare/src/app/billing-manager/models/term-arrangement-subsidiary";
import { map } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { TermScheduleCaptureComponent } from "projects/fincare/src/app/billing-manager/views/terms-arrangement/term-schedule-capture/term-schedule-capture.component";
import { Wizard } from "../wizard/shared/models/wizard";
import { TermArrangementProductOption } from "projects/fincare/src/app/billing-manager/models/term-arrangement-productoption";
import { WizardStatus } from "../wizard/shared/models/wizard-status.enum";
import { AutoApproveNotificationDialogComponent } from "../auto-approve-notification-dialog/auto-approve-notification-dialog.component";
import { IntegrationService } from "projects/shared-services-lib/src/lib/services/integrations.service";
import { PolicyProductCategory } from "projects/fincare/src/app/billing-manager/models/policy-product-category";
import { TermArrangementPaymentFrequencyEnum } from "projects/shared-models-lib/src/lib/enums/term-arrangement-payment-frequency.enum";

@Component({
  selector: "terms-arrangement-application",
  templateUrl: "./terms-arrangement-application.component.html",
  styleUrls: ["./terms-arrangement-application.component.css"],
})
export class TermsArrangementApplicationComponent implements OnInit, OnChanges {
  @Input() rolePlayer: RolePlayer;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() wizardId: number;

  //For wizard
  @Input() model: TermArrangement;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  hasReadTermsAndConditions = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  termMonthsPopulated = new BehaviorSubject(false);
  accountNumberPopulated = new BehaviorSubject(false);
  form: FormGroup;

  policy: Policy;
  debtor: FinPayee;
  wizard: Wizard;
  amount: number = 0;
  total: number = 0;
  installmentAmount: number = 0;
  selectedPaymentFrequencyId: number;
  selectedPaymentScheduleId = PaymentScheduleEnum.Fixed;
  selectedPaymentMethodId = 0;
  bankAccountType = BankAccountTypeEnum.ChequeAccount;
  selectedPolicyIds: number[] = [];
  selectedPolicies: PolicyProductCategory[] = []
  termWizardinProgress = false;
  displayedColumns = ["finpayeeNumber", "debtorName", "balance", "actions"];
  displayedColumnsProducts = ['finPayenumber', 'productName', 'amount'];
  displayedColumnsSchedule = ["month", "amount", "actions"];
  hidePaymentSchedule = true;
  wizardInProgressName = '';
  paymentSchedules: any[];
  agreementAccepted = false;
  hasZeroBalance = false;
  productsSearched = false;
  showSubmit = false;
  ssrsBaseUrl: string;
  mustConfirmTermsAndConditionsRead = false;
  banks: Lookup[];
  branches: BankBranch[];
  paymentFrequencies: PaymentFrequencyEnum[];
  paymentMethods: PaymentMethodEnum[];
  bankAccountTypes: BankAccountTypeEnum[];
  termFlexibleSchedules: TermFlexibleSchedule[] = [];
  subsidiaries: TermArrangementSubsidiary[] = [];
  termArrangement: TermArrangement;
  installmentDays: { id: number; name: string }[] = [];
  complianceResult: ComplianceResult;
  selectedBankAccount: RolePlayerBankingDetail;
  declarationsCompliant: boolean;
  activeTermArrangementProductOptions: TermArrangementProductOption[] = [];
  termArrangementProductOptions: TermArrangementProductOption[] = [];
  retrievingActiveTermArrangementProductOptions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showProductOnActiveTermsError = false;
  requiredDocumentsUploaded = false;

  debtorStatusTerms = DebtorStatusEnum.TermsArrangement;
  termsSupportingDocumentsDocSet = DocumentSetEnum.TermsSupportingDocuments;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  showAddBanking = false;

  datasource = new MatTableDataSource<TermArrangementSubsidiary>();
  datasourceProducts = new MatTableDataSource<TermArrangementProductOption>();
  datasourceSchedules = new MatTableDataSource<{
    month: number;
    amount: number;
  }>();

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly termArrangementService: TermArrangementService,
    private readonly lookupService: LookupService,
    private readonly formBuilder: FormBuilder,
    private readonly wizardService: WizardService,
    private readonly alert: ToastrManager,
    private readonly integrationService: IntegrationService,
    private readonly router: Router,
    public dialog: MatDialog,
    public subsidiaryDialog: MatDialog,
    public schedulesCaptureDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.validateNoExistingWizardsExist();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getDebtor();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      paymentFrequency: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      paymentMethod: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      outstandingAmount: [{ value: null, disabled: true }],
      termStartDate: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      termEndDate: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      installmentDay: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      bankId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bankBranchId: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      bankAccountType: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      bankBranchCode: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      name: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bankAccountNumber: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      installmentAmount: [{ value: null, disabled: true }, Validators.required],
      paymentSchedule: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      numberOfMonths: [
        { value: null, disabled: this.isReadOnly },
        Validators.required,
      ],
      acceptAgreement: [{ value: null, disabled: this.isReadOnly }],
      numberOfMonthsMonths: [{ value: null, disabled: this.isReadOnly }]
    });

    if (this.form.get('numberOfMonths').value > 0) {
      this.calculateInstallment();
    }
  }

  readForm() {
    this.termArrangement = new TermArrangement();
    this.termArrangement.termArrangementPaymentFrequency = this.selectedPaymentFrequencyId;
    this.termArrangement.paymentMethod = this.selectedPaymentMethodId;
    this.termArrangement.startDate = new Date(
      this.form.controls.termStartDate.value
    ).getCorrectUCTDate();
    this.termArrangement.termMonths = this.form.controls.numberOfMonths.value;
    this.termArrangement.totalAmount = this.amount;
  }

  setForm() {
    this.form.patchValue({
      outstandingAmount: this.amount,
      installmentAmount: this.installmentAmount,
      termStartDate: new Date(),
      paymentFrequency:
        this.termArrangement && this.termArrangement.termArrangementPaymentFrequency
          ? PaymentFrequencyEnum[this.termArrangement.termArrangementPaymentFrequency]
          : null,
      paymentMethod:
        this.termArrangement && this.termArrangement.paymentMethod
          ? PaymentMethodEnum[this.termArrangement.paymentMethod]
          : null,
      paymentSchedule: PaymentScheduleEnum.Fixed,
    });

    this.isLoading$.next(false);
  }

  getMonthsForPaymentFrequency(paymentFrequencyId: number): number {
    switch (paymentFrequencyId) {
      case PaymentFrequencyEnum.Annually:
        return 12;
        break;
      case PaymentFrequencyEnum.BiAnnually:
        return 6;
        break;
      case PaymentFrequencyEnum.Quarterly:
        return 3;
        break;
      case PaymentFrequencyEnum.Monthly:
        return 1;
        break;
      default:
        break;
    }
  }

  calculateMonths(startDate: Date, endDate: Date): number {
    return (
      endDate.getMonth() -
      startDate.getMonth() +
      12 * (endDate.getFullYear() - startDate.getFullYear())
    );
  }

  calculateInstallment() {
    this.isLoading$.next(true);
    let numberOfInstallments = 0;
    switch (this.selectedPaymentFrequencyId) {
      case +TermArrangementPaymentFrequencyEnum.Annually:
        numberOfInstallments = 1;
        break;
      case +TermArrangementPaymentFrequencyEnum.Monthly:
        numberOfInstallments = this.form.get('numberOfMonths').value;
        break;
      case +TermArrangementPaymentFrequencyEnum.Quarterly:
        numberOfInstallments = 4;
        break;
      case +TermArrangementPaymentFrequencyEnum.BiAnnually:
        numberOfInstallments = 2;
        break;
    }

    if (numberOfInstallments > 0) {
      const installment = +(this.amount / numberOfInstallments).toFixed(2);
      this.installmentAmount = installment;

      this.enableFormControl('installmentAmount');
      this.form.get('installmentAmount').setValue(installment);
      this.disableFormControl('installmentAmount');
    }
    this.isLoading$.next(false);
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
      this.form.get('numberOfMonths').setValue(numberOfInstallments);
      this.disableFormControl('numberOfMonths');
      this.disableFormControl('numberOfMonthsMonths');
      this.form.get('numberOfMonthsMonths').setValue(0);
    }
    else if (this.selectedPaymentFrequencyId == +TermArrangementPaymentFrequencyEnum.Monthly) {
      this.enableFormControl('numberOfMonths');
      this.disableFormControl('numberOfMonthsMonths');
      this.form.get('numberOfMonthsMonths').setValue(1);
    }
    else {
      this.disableFormControl('numberOfMonths');
      this.enableFormControl('numberOfMonthsMonths');
      this.form.get('numberOfMonthsMonths').setValue(0);
      this.form.get('numberOfMonths').setValue(0);
    }

    if (this.selectedPaymentScheduleId === +PaymentScheduleEnum.Fixed) {
      this.calculateInstallment();
    }
  }

  paymentMethodChanged($event: PaymentMethodEnum) {
    if ($event == +PaymentMethodEnum.DebitOrder) {
      this.showAddBanking = true;
    } else {
      this.showAddBanking = false;
    }
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

  onMonthsChanged(value: number) {
    if (value > 0 && this.selectedPaymentScheduleId === +PaymentScheduleEnum.Fixed) {
      this.calculateInstallment();

      if (this.selectedPaymentFrequencyId === TermArrangementPaymentFrequencyEnum.Monthly) {
        this.form.get('numberOfMonthsMonths').setValue(value)
      }
    }
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  agreementChecked($event: any) {
    if ($event.checked) {
      this.agreementAccepted = true;
      this.requestApproval(this.wizard.id);
    } else {
      this.agreementAccepted = false;
      this.wizard.wizardStatusId = +WizardStatus.Cancelled;
    }
  }

  addSubsidiary() {
    const dialogref = this.subsidiaryDialog.open(
      TermSubsidiaryDialogComponent,
      {
        width: "800px",
        height: "500px",
      }
    );
    dialogref.afterClosed().subscribe((result) => {
      if (result && result.rolePlayerId > 0) {
        this.addSubsidiaryToDatasource(
          result.roleplayerId,
          result.debtorName,
          result.finpayeeNumber
        );
      }
    });
  }

  addSubsidiaryToDatasource(
    roleplayerId: number,
    debtorName: string,
    finpayeeNumber: string
  ) {
    this.termArrangementService
      .getDebtorNetBalance(roleplayerId)
      .pipe(
        map((value) => {
          this.subsidiaries.push({
            balance: value,
            finpayeeNumber,
            debtorName, roleplayerId
          });
          this.datasource.data = [...this.subsidiaries];
        })
      )
      .subscribe();
  }

  removeDebtor(item: TermArrangementSubsidiary) {
    for (let i = 0; i < this.subsidiaries.length; i++) {
      if (this.subsidiaries[i].roleplayerId === item.roleplayerId) {
        this.subsidiaries.splice(i, 1);
        break;
      }
    }
    this.datasource.data = [...this.subsidiaries];
  }

  addScheduleLineItem() {
    const monthsNotCaptured = this.getMonthsNotCaptured();
    const dialogref = this.schedulesCaptureDialog.open(TermScheduleCaptureComponent, {
      width: '800px', height: '500px', data: { monthsNotCaptured }
    });
    dialogref.afterClosed().subscribe((data) => {
      if (data && data.amount > 0 && data.month) {

        this.termFlexibleSchedules.push({ amount: data.amount, month: data.month });
        this.datasourceSchedules.data = [...this.termFlexibleSchedules.sort(c => +(c.month))];
      }
    });
  }

  getMonthsNotCaptured() {
    const numberOfMOnths = this.form.get('numberOfMonths').value;
    let months = [];
    if (this.termFlexibleSchedules && this.termFlexibleSchedules.length > 0) {
      for (let i = 1; i <= numberOfMOnths; i++) {
        if (this.termFlexibleSchedules.findIndex(c => c.month === i) < 0) {
          months.push(i);
        }
      }
    }
    else {
      for (let i = 1; i <= numberOfMOnths; i++) {
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

  policiesSelected($event: PolicyProductCategory[]) {
    this.getActiveTermArrangementsProductOptionsByRolePlayerId(this.rolePlayer.rolePlayerId);
    this.selectedPolicyIds = [];
    this.selectedPolicies = [];
    this.selectedPolicies = $event;
    this.selectedPolicies.forEach(c => {
      this.selectedPolicyIds.push(c.policyId);

      let option = new TermArrangementProductOption();
      option.productOptionId = c.productOption.id;
      option.contractAmount = c.productBalance;
      option.productOptionName = c.productOption.code;
      option.roleplayerId = this.rolePlayer.rolePlayerId;
      option.finPayenumber = this.rolePlayer.finPayee.finPayeNumber;
      option.policyId = c.policyId;

      if (this.termArrangementProductOptions
        .findIndex(d => d.productOptionId === c.productOption.id
          && d.roleplayerId === this.rolePlayer.rolePlayerId) < 0) {
        this.termArrangementProductOptions.push(option);
      }
    });
    const total = this.datasourceProducts.data.reduce((a,b) => a + b.contractAmount, 0).toFixed(2);
    this.amount = +total;
    this.form.get('outstandingAmount').patchValue(this.amount);
    this.datasourceProducts.data = [...this.termArrangementProductOptions];
    this.validateProductBalances();
  }

  setProductComplianceResult($event: ComplianceResult, termArrangementProductOption: TermArrangementProductOption ) {
    let complianceResult = $event;
    termArrangementProductOption.complianceResult = complianceResult;
  }

  getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId: number)
  {
    if(this.activeTermArrangementProductOptions.find(x=>x.roleplayerId === roleplayerId) == undefined)
    {
      this.retrievingActiveTermArrangementProductOptions$.next(true);
      this.termArrangementService.getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId).subscribe(
        res=>
        {
          this.activeTermArrangementProductOptions.push(...res);
          this.retrievingActiveTermArrangementProductOptions$.next(false);
        }
      );
    }
  }

  validateIfRolePlayerProductIsOnActiveTermArrangement(roleplayerId: number, productOptionId: number): Boolean
  {
     return (this.activeTermArrangementProductOptions.find(x => x.roleplayerId === roleplayerId && x.productOptionId === productOptionId)) === undefined ? false : true;
  }

  readTermsAndConditions() {
    this.readForm();
    this.instantiateTermsWizard();

    if(this.wizard) {
       var dialogRef = this.dialog.open(TermsConditionsDialogComponent, {
       width: '800px',
        height: '800px',
         data: {wizardId: this.wizard.id, ssrsBaseUrl: this.ssrsBaseUrl}
       });

       dialogRef.afterClosed().subscribe((data) => {
         this.hasReadTermsAndConditions.next(true);
         this.mustConfirmTermsAndConditionsRead = true;
       });
     }
  }

  getDebtor() {
    this.rolePlayerService
      .getFinPayee(this.rolePlayer.rolePlayerId)
      .subscribe((result) => {
        this.debtor = result;
        if (!this.isWizard) {
          this.getDebtorPolicyBalances();
        } else {
          this.setForm();
          this.paymentMethodChanged(this.termArrangement.paymentMethod);
        }
      });
  }

  getDebtorPolicyBalances() {
    this.termArrangementService
      .getDebtorTermProductBalances(this.rolePlayer.rolePlayerId, 0)
      .subscribe((result) => {
        if (result && result.length > 0) {
          const total = [...result]
            .reduce((a, b) => a + b.balance, 0)
            .toFixed(2);
          // this.amount = +total;
          if (
            this.form.get("paymentSchedule").value ===
            +PaymentScheduleEnum.Fixed &&
            this.form.get("numberOfMonths").value > 0
          ) {
            this.calculateInstallment();
          }
        }
        this.setForm();
      });
  }

  setBankAccount($event: RolePlayerBankingDetail) {
    this.selectedBankAccount = $event;
  }

  setComplianceResult($event: ComplianceResult) {
    this.complianceResult = $event;
  }

  isApplicationInvalid(): boolean {
    return (
      !this.complianceResult.isDeclarationCompliant ||
      (this.complianceResult.debtorStatus &&
        this.complianceResult.debtorStatus == this.debtorStatusTerms) ||
      (this.selectedBankAccount &&
        +this.form.controls.paymentMethod.value == PaymentMethodEnum.DebitOrder)
    );
  }

  getLookups() {
    this.paymentFrequencies = this.ToKeyValuePair(TermArrangementPaymentFrequencyEnum);
    this.paymentMethods = this.ToKeyValuePair(PaymentMethodEnum).filter((t: { id: number, name: string }) => [+PaymentMethodEnum.EFT, +PaymentMethodEnum.DebitOrder, +PaymentMethodEnum.Cash].includes(t.id));
    this.bankAccountTypes = this.ToKeyValuePair(BankAccountTypeEnum);
    this.paymentSchedules = this.ToKeyValuePair(PaymentScheduleEnum);
    this.createInstallmentDays();
    this.getBanks();
    this.createForm();
    this.lookupService.getItemByKey("ssrsBaseUrl").subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    });
  }

  getBanks(): void {
    this.lookupService.getBanks().subscribe((result) => {
      this.banks = result;
    });
  }

  createInstallmentDays() {
    for (let i = 1; i <= 31; i++) {
      this.installmentDays.push({ id: i, name: i.toString() });
    }
  }

  isRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
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

  getKey(): string {
    return `${this.rolePlayer.rolePlayerId} | TermsApplication`;
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2") : "N/A";
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  submit() {
    this.alert.successToastr("Application submitted successfully");
    this.router.navigateByUrl("member/member-manager/home");
  }

  back() {
    this.router.navigateByUrl("member/member-manager/home");
  }

  checkIfAutoApproved() {
    this.readForm();
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.rolePlayer.rolePlayerId, 'terms-arrangement')
      .subscribe(data => {
        if (data[0] && (+data[0].wizardStatus == WizardStatus.AwaitingApproval)) {
          //if not auto approved
          const parsedData = JSON.parse(data[0].data);
          const noAutoApprovalReasons = parsedData[0].noAutoApprovalReasons;
          const dialogRef = this.dialog.open(AutoApproveNotificationDialogComponent, {
            data: { noAutoApprovalReasons }
          });
          dialogRef.afterClosed().subscribe(() => {
            this.submit();
          });
        } else {
          //If auto approved
          const dialogRef = this.dialog.open(AutoApproveNotificationDialogComponent, {
            data: {}
          });
          dialogRef.afterClosed().subscribe(() => {
            this.submit();
          });
        }
      });
  }

  instantiateTermsWizard() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = "terms-arrangement";
    this.termArrangement.rolePlayerId = this.rolePlayer.rolePlayerId;
    this.termArrangement.memberNumber = this.rolePlayer.finPayee.finPayeNumber;
    this.termArrangement.memberName = this.rolePlayer.displayName;
    this.termArrangement.termArrangementStatus =
      TermArrangementStatusEnum.ApplicationInProgress;
    this.termArrangement.isActive = true;
  
    const amount = +this.termArrangementProductOptions.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    let termSubsidiaries: TermArrangementSubsidiary[] = [];
    const termSubsidiary = new TermArrangementSubsidiary();
    termSubsidiary.debtorName = this.rolePlayer.displayName;
    termSubsidiary.finpayeeNumber = this.rolePlayer.finPayee.finPayeNumber;
    termSubsidiary.roleplayerId = this.rolePlayer.rolePlayerId;
    termSubsidiary.balance = amount;
    this.termArrangement.balance = amount;
    termSubsidiaries.push(termSubsidiary);
    this.termArrangement.termArrangementSubsidiaries = [...termSubsidiaries.concat([...this.subsidiaries])];
    this.termArrangement.totalAmount = amount;
    this.termArrangement.termArrangementProductOptions = this.termArrangementProductOptions;
   
    startWizardRequest.linkedItemId = this.rolePlayer.rolePlayerId;
    startWizardRequest.data = JSON.stringify(this.termArrangement);
    this.createWizard(startWizardRequest);
  }

  validateNoExistingWizardsExist() {
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.rolePlayer.rolePlayerId, 'terms-arrangement')
      .subscribe(data => {
        if (data[0]) {
          if (data[0].id > 0) {
            this.termWizardinProgress = true;
            this.wizardInProgressName = data[0].name;
            this.applicationExists();
          } else {
            this.termWizardinProgress = false;
          }
        } else {
          this.termWizardinProgress = false;
        }
      }
      );
  }

  applicationExists() {
    if (this.termWizardinProgress || this.complianceResult.isDeclarationCompliant) {
      this.disableFormControl('numberOfMonths');
      this.disableFormControl('paymentFrequency');
      this.disableFormControl('paymentMethod');
      this.disableFormControl('paymentSchedule');
      this.disableFormControl('termStartDate');
    }
  }

  requestApproval(id: number) {
    this.wizardService.requestApproval(id).subscribe((result) => { });
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.wizard = result;
      if(this.wizard) {
        var dialogRef = this.dialog.open(TermsConditionsDialogComponent, {
        width: '80%',
         height: 'auto',
          data: {wizardId: this.wizard.id, ssrsBaseUrl: this.ssrsBaseUrl}
        });
 
        dialogRef.afterClosed().subscribe((data) => {
          this.hasReadTermsAndConditions.next(true);
          this.mustConfirmTermsAndConditionsRead = true;
        });
      }
    });
  }

  validateProductBalances()
  {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    if ( Number.isNaN(+total) || (+total < 1) ) {
      this.productsSearched = true;
      this.hasZeroBalance = true;
      this.showSubmit = false;
      this.applicationExists();
    }
    else {
      this.hasZeroBalance = false;
      this.showSubmit = true;
    }
  }

  getProductTotals(): number {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    this.amount = +total;
    
    return +total;
  }

  removeProductOption(item: TermArrangementProductOption) {
    for (let i = 0; i < this.termArrangementProductOptions.length; i++) {
      if ((this.termArrangementProductOptions[i].roleplayerId === item.roleplayerId && this.termArrangementProductOptions[i].productOptionId === item.productOptionId)) {
        this.termArrangementProductOptions.splice(i, 1);
        break;
      }
    }
    const options = [... this.termArrangementProductOptions]
      .sort((a, b) => b.finPayenumber.localeCompare(a.finPayenumber));
    this.datasourceProducts.data = [...options];
    this.validateProductBalances();
  }
}
