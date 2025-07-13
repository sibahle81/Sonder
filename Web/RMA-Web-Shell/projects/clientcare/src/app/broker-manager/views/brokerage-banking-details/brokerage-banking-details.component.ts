import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { BankBranch } from '../../../../../../shared-models-lib/src/lib/lookup/bank-branch';
import { Brokerage } from '../../models/brokerage';
import { BrokerageBankAccount } from '../../models/brokerage-bank-account';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { BankAccountVerificationFeedbackEnum } from 'projects/shared-models-lib/src/lib/enums/bank-verification-status';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { Bank } from 'projects/shared-models-lib/src/lib/lookup/bank';

@Component({
  selector: 'app-brokerage-banking-details',
  templateUrl: './brokerage-banking-details.component.html',
  styleUrls: ['./brokerage-banking-details.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})
export class BrokerageBankingDetailsComponent extends WizardDetailBaseComponent<Brokerage> {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  bankAccountTypes: Lookup[];
  paymentMethods: Lookup[];
  paymentFrequencies: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  addForm: UntypedFormGroup;
  loadingPaymentMethods = false;
  loadingPaymentFrequencies = false;
  accountValidationErrorMsg = '';
  statusText: string;
  verificationStatus: string;
  isBankVerification = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private readonly integrationService: IntegrationService,
    private readonly router: Router,
    public dialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
    this.createAddForm();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    super.ngOnInit();
  }

  onLoadLookups(): void {
    this.getBanks();
    this.getBankBranches();
    this.getBankAccountTypes();
    this.getPaymentMethods();
    this.getPaymentFrequencies();
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      paymentMethod: ['', [Validators.min(1)]],
      paymentFrequency: ['', [Validators.min(1)]]
    });
  }

  createAddForm(): void {
    this.addForm = this.formBuilder.group({
      id: [''],
      bankId: ['', [Validators.min(1)]],
      bankBranchId: ['', [Validators.min(1)]],
      effectiveDate: ['', [Validators.required]],
      bankAccountType: ['', [Validators.min(1)]],
      accountNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(13)]],
      name: ['', [Validators.required]],
      branchCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
      statusText: [''],
      verificationStatus: ['']
    });

    this.addForm.get('statusText').disable();
    this.addForm.get('verificationStatus').disable();
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.id,
      paymentMethod: this.model.paymentMethod,
      paymentFrequency: this.model.paymentFrequency
    });

    if (this.model.brokerageBankAccounts === null || !this.model.brokerageBankAccounts[0]) 
    { 
      this.model.brokerageBankAccounts = [];
      return;
    }

    const bank = this.getBank(this.model.brokerageBankAccounts[0].bankBranchId);
    this.filteredBranches = bank ? this.branches.filter(b => b.bankId === bank.id) : [];

    this.setCalculatedStatus();
    this.statusText = this.model.brokerageBankAccounts[0].statusText;
    this.verificationStatus = BankAccountVerificationFeedbackEnum[this.model.brokerageBankAccounts[0].bankAccountVerificationFeedback];

    this.addForm.patchValue({
      id: this.model.brokerageBankAccounts[0].id,
      bankId: bank ? bank.id : 0,
      bankBranchId: this.model.brokerageBankAccounts[0].bankBranchId,
      effectiveDate: this.model.brokerageBankAccounts[0].effectiveDate,
      bankAccountType: this.model.brokerageBankAccounts[0].bankAccountType,
      accountNumber: this.model.brokerageBankAccounts[0].accountNumber,
      name: this.model.brokerageBankAccounts[0].accountHolderName,
      branchCode: this.model.brokerageBankAccounts[0].branchCode,
      statusText: this.model.brokerageBankAccounts[0].statusText,
      verificationStatus: BankAccountVerificationFeedbackEnum[this.model.brokerageBankAccounts[0].bankAccountVerificationFeedback]
    });
  }

  disable(): void {
    this.isDisabled = true;
    this.form.disable();
    this.addForm.disable(); 
  }

  enable(): void {
    this.isDisabled = false;
    this.form.enable();
    this.addForm.enable();
  }

  setCalculatedStatus() {
    const today = new Date();
    const current = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.model.brokerageBankAccounts.length; ++i) {

      if (new Date(this.model.brokerageBankAccounts[i].effectiveDate) > new Date(today)) {
        this.model.brokerageBankAccounts[i].statusText = 'Future';
      }

      if (new Date(this.model.brokerageBankAccounts[i].effectiveDate) < new Date(today)) {
        this.model.brokerageBankAccounts[i].statusText = 'History';
        current.push(this.model.brokerageBankAccounts[i]);
      }
    }

    if (this.model.brokerageBankAccounts.length === 1) {
      this.model.brokerageBankAccounts[0].statusText = 'Current';
    }

    if (current.length > 1) {
      current.sort((a, b) => (new Date(a.effectiveDate) > new Date(b.effectiveDate)) ? -1 : 1);
      current[0].statusText = 'Current';
    }
  }

  populateModel(): void {
    const form = this.form.value;
    this.model.paymentMethod = form.paymentMethod;
    this.model.paymentFrequency = form.paymentFrequency;

    const account = this.readBankAccountForm();

    if (this.model.brokerageBankAccounts[0]) {
        this.model.brokerageBankAccounts[0].id = account.id;
        this.model.brokerageBankAccounts[0].brokerageId = account.brokerageId;
        this.model.brokerageBankAccounts[0].effectiveDate = account.effectiveDate;
        this.model.brokerageBankAccounts[0].accountNumber = account.accountNumber;
        this.model.brokerageBankAccounts[0].bankBranchId = account.bankBranchId;
        this.model.brokerageBankAccounts[0].bankAccountType = account.bankAccountType;
        this.model.brokerageBankAccounts[0].accountHolderName = account.accountHolderName;
        this.model.brokerageBankAccounts[0].branchCode = account.branchCode;
        this.model.brokerageBankAccounts[0].isDeleted = false;
        this.model.brokerageBankAccounts[0].statusText = account.statusText;
        this.model.brokerageBankAccounts[0].bankAccountVerificationFeedback = account.bankAccountVerificationFeedback
    } else {        
        this.model.brokerageBankAccounts.push(account);
    }    
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.addForm.markAllAsTouched();

    if (!this.addForm.valid && this.addForm.enabled) {
        validationResult.errorMessages.push('Bank Account details not valid');
        validationResult.errors += 1;
    }

    // Added Check for NULL if no banking was captured.
    if (this.model.brokerageBankAccounts == null || this.model.brokerageBankAccounts.length === 0) {
      validationResult.errorMessages.push('At least one bank account is required');
      validationResult.errors = 1;
    }
    return validationResult;
  }

  getBankAccountTypes(): void {
    this.lookupService.getBankAccountTypes().subscribe(
      data => {
        this.bankAccountTypes = data;
      }
    );
  }

  getPaymentMethods(): void {
    this.loadingPaymentMethods = true;
    this.lookupService.getPaymentMethods().subscribe(
      data => {
        this.paymentMethods = data;
        this.loadingPaymentMethods = false;
      }
    );
  }

  getPaymentFrequencies(): void {
    this.loadingPaymentFrequencies = true;
    this.lookupService.getPaymentFrequencies().subscribe(
      data => {
        this.paymentFrequencies = data;
        this.loadingPaymentFrequencies = false;
      }
    );
  }

  getBanks(): void {
    this.lookupService.getBanks().subscribe(
      data => {
        this.banks = data;
      }
    );
  }

  getBankBranches(): void {
    this.lookupService.getBankBranches().subscribe(
      data => {
        this.branches = data;
      }
    );
  }

  readBankAccountForm(): BrokerageBankAccount {
    const value = this.addForm.value;
    const account = new BrokerageBankAccount();
    account.id = value.id === '' || value.id === null || value.id === undefined ? 0 : value.id as number;
    account.brokerageId = this.model.id;
    account.effectiveDate = value.effectiveDate;
    account.accountNumber = value.accountNumber;
    account.bankBranchId = value.bankBranchId;
    account.bankAccountType = value.bankAccountType;
    account.accountHolderName = value.name;
    account.branchCode = value.branchCode;
    account.isDeleted = false;
    account.statusText = this.statusText;
    account.bankAccountVerificationFeedback = BankAccountVerificationFeedbackEnum[this.verificationStatus as keyof typeof BankAccountVerificationFeedbackEnum];
    return account;
  }

  addBankAccount(): void {    
    this.addForm.markAllAsTouched();

    if (!this.addForm.valid) { return; }
    const account = this.readBankAccountForm();
    this.verifyBankAccount(account);
  }

  verifyBankAccount(account: BrokerageBankAccount): void {
    this.accountValidationErrorMsg = '';
    this.isBankVerification = true;

    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
      account.accountHolderName, this.model.regNo)
      .subscribe(
        data => {

          if (data.success) {
            account.bankAccountVerificationFeedback = BankAccountVerificationFeedbackEnum.Verified;
            this.verificationStatus = BankAccountVerificationFeedbackEnum[BankAccountVerificationFeedbackEnum.Verified];
            this.accountValidationErrorMsg = '';
            this.alertService.success('Account has been verified');
          } else {
            account.bankAccountVerificationFeedback = BankAccountVerificationFeedbackEnum.Failed;
            this.verificationStatus = BankAccountVerificationFeedbackEnum[BankAccountVerificationFeedbackEnum.Failed];       
            this.accountValidationErrorMsg = data.errmsg;
            this.alertService.error(this.accountValidationErrorMsg);
          }

          this.isBankVerification = false;
        }
      );
  }

 getBankName( branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch && branch.bank ? branch.bank.name : 'unknown';
  }

  getBank( branchId: number): Bank {
    const branch = this.branches.find(b => b.id === branchId);
    return branch && branch.bank ? branch.bank : null;
  }

  getBranch(branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'unknown';
  }

  loadBranches(): void {
    this.addForm.patchValue({ bankBranchId: 0 });
    const bankId = this.addForm.value.bankId;
    this.filteredBranches = this.branches.filter(b => b.bankId === bankId);
    this.addForm.controls.branchCode.setValue('');
  }

  loadBranchCode(): void {
    const branchId = this.addForm.value.bankBranchId;
    const branchData = this.branches.filter(b => b.id === branchId);
    if (branchData.length > 0) {
      const branchCode = branchData[0].code;
      this.addForm.controls.branchCode.setValue(branchCode);
    }
  }

  openAuditDialog() {
    const bankAccount = this.model.brokerageBankAccounts[0]
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.BrokerageManager,
        clientItemType: BrokerItemTypeEnum.BrokerageBankAccount,
        itemId: bankAccount.id,
        heading: 'Brokerage BankAccount Details Audit',
        propertiesToDisplay: [ 
          'Id', 'BrokerageId', 'EffectiveDate', 'AccountNumber', 'BankBranchId', 'BankAccountType', 'AccountHolderName', 'BranchCode', 'ApprovalRequestedFor',
           'ApprovalRequestId', 'IsApproved', 'Reason', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate', 'BankAccountVerificationFeedback' 
        ]
      }
    });
  }

  back() {
    this.router.navigateByUrl('clientcare/broker-manager');
  }
}
