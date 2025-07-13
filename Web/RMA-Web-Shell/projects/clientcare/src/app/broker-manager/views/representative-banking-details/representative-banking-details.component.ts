import { Component, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Representative } from '../../models/representative';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { RepresentativeBankAccount } from '../../models/representative-bank-account';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RepresentativeBankAccountDataSource } from '../../datasources/representative-bank-account.datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'representative-banking-details',
  templateUrl: './representative-banking-details.component.html',
  styleUrls: ['./representative-banking-details.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})
export class RepresentativeBankingDetailsComponent extends WizardDetailBaseComponent<Representative> {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  bankAccountTypes: Lookup[];
  paymentMethods: Lookup[];
  paymentFrequencies: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  addForm: UntypedFormGroup;
  activeSection = 'showAccounts';
  loadingPaymentMethods = false;
  loadingPaymentFrequencies = false;
  accountValidationErrorMsg = '';

  get isLoading(): boolean {
    if (!this.dataSource) { return false; }
    return this.dataSource.isLoading;
  }

  get noBankAccounts(): boolean {
    if (this.isLoading) { return true; }
    if (!this.dataSource.data) { return true; }
    return this.dataSource.data.length === 0;
  }

  get hasBankAccounts(): boolean {
    if (this.isLoading) { return false; }
    if (!this.dataSource || !this.dataSource.data) { return false; }
    return this.dataSource.data.length > 0;
  }

  get isNaturalRepresentative(): boolean {
    if (!this.model) { return true; }
    return this.model.code.startsWith('NR');
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public readonly dataSource: RepresentativeBankAccountDataSource,
    private readonly alertService: AlertService,
    private readonly integrationService: IntegrationService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
    this.createAddForm();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.dataSource.setControls(this.paginator, this.sort);
  }

  onLoadLookups(): void {
    this.getBanks();
    this.getBankBranches();
    this.getBankAccountTypes();
    this.getPaymentMethods();
    this.getPaymentFrequencies();
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Account Number', def: 'accountNumber', show: true },
      { display: 'Account Holder', def: 'accountHolderName', show: true },
      { display: 'Bank', def: 'bank', show: true },
      { display: 'Branch', def: 'branch', show: true },
      { display: 'Branch Code', def: 'branchCode', show: true },
      { display: 'Effective Date', def: 'effectiveDate', show: true },
      { display: 'Status', def: 'status', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      paymentMethod: ['', [Validators.required, Validators.min(1)]],
      paymentFrequency: ['', [Validators.required, Validators.min(1)]]
    });
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.id,
      paymentMethod: this.model.paymentMethod,
      paymentFrequency: this.model.paymentFrequency
    });

    if (this.model.representativeBankAccounts === null) { return; }

    this.dataSource.getData(this.model.representativeBankAccounts);

    this.setCalculatedStatus();
  }

  setCalculatedStatus() {
    const today = new Date();
    const current = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.model.representativeBankAccounts.length; ++i) {

      if (new Date(this.model.representativeBankAccounts[i].effectiveDate) > new Date(today)) {
        this.model.representativeBankAccounts[i].statusText = 'Future';
      }

      if (new Date(this.model.representativeBankAccounts[i].effectiveDate) < new Date(today)) {
        this.model.representativeBankAccounts[i].statusText = 'History';
        current.push(this.model.representativeBankAccounts[i]);
      }
    }

    if (this.model.representativeBankAccounts.length === 1) {
      this.model.representativeBankAccounts[0].statusText = 'Current';
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
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    // Banking details are not required for natural representatives.
    if (!this.isNaturalRepresentative) {
      if (this.model.representativeBankAccounts == null || this.model.representativeBankAccounts.length === 0) {
        validationResult.errorMessages.push('At least one bank account is required');
        validationResult.errors = 1;
      }
    } else {
      validationResult.errorMessages = [''];
      validationResult.errors = 0;
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

  showSection(section: string) {
    this.activeSection = section;
  }

  createAddForm(): void {
    this.addForm = this.formBuilder.group({
      bankId: ['', [Validators.min(1)]],
      bankBranchId: ['', [Validators.min(1)]],
      effectiveDate: ['', [Validators.required]],
      bankAccountType: ['', [Validators.min(1)]],
      accountNumber: ['', [Validators.required, Validators.maxLength(13)]],
      name: ['', [Validators.required]],
      branchCode: ['', [Validators.required, Validators.maxLength(6)]]
    });
  }

  showAddAccount(): void {
    this.filteredBranches = [];
    this.addForm.patchValue({
      bankId: 0,
      bankBranchId: 0,
      effectiveDate: new Date(),
      bankAccountType: 0,
      accountNumber: '',
      name: '',
      branchCode: ''
    });
    this.showSection('addAccount');
  }

  readBankAccountForm(): RepresentativeBankAccount {
    const value = this.addForm.value;
    const account = new RepresentativeBankAccount();
    account.id = 0;
    account.representativeId = this.model.id;
    account.effectiveDate = value.effectiveDate;
    account.accountNumber = value.accountNumber;
    account.bankBranchId = value.bankBranchId;
    account.bankAccountType = value.bankAccountType;
    account.accountHolderName = value.name;
    account.branchCode = value.branchCode;
    account.isDeleted = false;
    return account;
  }

  addBankAccount(): void {
    if (this.model.representativeBankAccounts == null) {
      this.model.representativeBankAccounts = new Array();
    }
    console.log('start add');
    if (!this.addForm.valid) { return; }
    console.log('passed validation');
    const account = this.readBankAccountForm();
    this.verifyBankAccount(account);
  }

  verifyBankAccount(account: RepresentativeBankAccount): void {
    this.accountValidationErrorMsg = '';
    this.dataSource.isLoading = true;
    this.dataSource.statusMsg = 'Verifying bank account ...';
    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
      account.accountHolderName, this.model.code)
      .subscribe(
        data => {
          this.dataSource.isLoading = false;
          this.dataSource.statusMsg = '';
          if (data.success) {
            this.model.representativeBankAccounts.push(account);
            this.populateForm();
            this.accountValidationErrorMsg = '';
            this.alertService.success('Account has been verified');
            this.showSection('showAccounts');
          } else {
            this.accountValidationErrorMsg = data.errmsg;
            this.alertService.error(this.accountValidationErrorMsg);
          }
        }
      );
  }

  getBank(branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch && branch.bank ? branch.bank.name : 'unknown';
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
}
