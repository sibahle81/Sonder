import { Component, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { RolePlayerBankingDetailDataSource } from './role-player-banking-detail.datasource';
import { RolePlayerBankingDetail } from '../models/banking-details.model';

@Component({
  selector: 'lib-role-player-banking-detail',
  templateUrl: './role-player-banking-detail.component.html',
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat },{ provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})
export class RolePlayerBankingDetailComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  bankAccountTypes: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  addForm: UntypedFormGroup;
  activeSection = 'showAccounts';
  accountValidationErrorMsg = '';
  rolePlayerBankAccounts: RolePlayerBankingDetail[] = [];
  isDisabled = true;
  isWizard = false;
  idNumber = '';

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

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public readonly dataSource: RolePlayerBankingDetailDataSource,
    private readonly integrationService: IntegrationService,
    private readonly alertService: AlertService ) { }

  ngOnInit() {
    this.dataSource.clearData();
    this.dataSource.setControls(this.paginator, this.sort);
    if (this.rolePlayerBankAccounts && this.rolePlayerBankAccounts.length > 0) {
      this.createForm(this.rolePlayerBankAccounts[0].rolePlayerId);
    } else {
      this.createForm(0);
    }
  }

  getData(): void {
    if (this.rolePlayerBankAccounts) {
      this.dataSource.getData(this.rolePlayerBankAccounts);
    }
  }

  onLoadLookups(): void {
    this.getBanks();
    this.getBankBranches();
    this.getBankAccountTypes();
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Account Number', def: 'accountNumber', show: true },
      { display: 'Account Holder', def: 'accountHolderName', show: true },
      { display: 'Account Type', def: 'bankAccountType', show: true },
      { display: 'Bank', def: 'bank', show: true },
      { display: 'Branch', def: 'branch', show: true },
      { display: 'Branch Code', def: 'branchCode', show: true },
      { display: 'Effective Date', def: 'effectiveDate', show: true },
      { display: 'Status', def: 'statusText', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getBankAccountTypes(): void {
    this.lookupService.getBankAccountTypes().subscribe(
      data => {
        this.bankAccountTypes = data;
      });
  }

  getBanks(): void {
    this.lookupService.getBanks().subscribe(
      data => {
        this.banks = data;
      });
  }

  getBankBranches(): void {
    this.lookupService.getBankBranches().subscribe(
      data => {
        this.branches = data;
      });
  }

  showSection(section: string) {
    this.activeSection = section;
  }

  populateForm(): void {
    this.setCalculatedStatus();
  }

  setCalculatedStatus() {
    const today = new Date();
    const current = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.rolePlayerBankAccounts.length; ++i) {
      if (new Date(this.rolePlayerBankAccounts[i].effectiveDate) > new Date(today)) {
        this.rolePlayerBankAccounts[i].statusText = 'Future';
      }

      if (new Date(this.rolePlayerBankAccounts[i].effectiveDate) < new Date(today)) {
        this.rolePlayerBankAccounts[i].statusText = 'History';
        current.push(this.rolePlayerBankAccounts[i]);
      }
    }

    if (this.rolePlayerBankAccounts.length === 1) {
      this.rolePlayerBankAccounts[0].statusText = 'Current';
    }

    if (current.length > 1) {
      current.sort((a, b) => (new Date(a.effectiveDate) > new Date(b.effectiveDate)) ? -1 : 1);
      current[0].statusText = 'Current';
    }
  }

  createForm(id): void {
    this.addForm = this.formBuilder.group({
      rolePlayerId: id,
      bankId: ['', [Validators.min(1)]],
      bankBranchId: ['', [Validators.min(1)]],
      effectiveDate: ['', [Validators.required]],
      bankAccountType: ['', [Validators.min(1)]],
      accountNumber: ['', [Validators.required]],
      name: ['', [Validators.required]],
      branchCode: ['', [Validators.required]]
    });
    this.onLoadLookups();
    this.enable();
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

  readBankAccountForm(): RolePlayerBankingDetail {
    const value = this.addForm.value;
    const account = new RolePlayerBankingDetail();
    account.rolePlayerBankingId = 0;
    account.purposeId = 1;
    account.rolePlayerId = value.rolePlayerId;
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
    if (!this.addForm.valid) { return; }
    const account = this.readBankAccountForm();
    this.verifyBankAccount(account);
  }

  verifyBankAccount(account: RolePlayerBankingDetail): void {
    this.accountValidationErrorMsg = '';
    this.dataSource.isLoading = true;
    this.dataSource.statusMsg = 'Verifying bank account ...';
    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
      account.accountHolderName, this.idNumber)
      .subscribe(
        data => {
          this.dataSource.isLoading = false;
          this.dataSource.statusMsg = '';
          if (data.success) {
            this.accountValidationErrorMsg = '';
            this.alertService.success('Account has been verified');
            this.rolePlayerBankAccounts.push(account);
            this.dataSource.getData(this.rolePlayerBankAccounts);
            this.showSection('showAccounts');
            this.setCalculatedStatus();
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

  getAccountType(accountTypeId: number): string {
    const accountType = this.bankAccountTypes.find(b => b.id === accountTypeId);
    return accountType ? accountType.name : 'unknown';
  }

  loadBranches(): void {
    this.addForm.patchValue({ bankBranchId: 0 });
    const bankId = this.addForm.value.bankId;
    this.filteredBranches = this.branches.filter(b => b.bankId === bankId);
  }

  loadBranchCode(): void {
    const branchId = this.addForm.value.bankBranchId;
    const branchData = this.branches.filter(b => b.id === branchId);
    if (branchData.length > 0) {
      const branchCode = branchData[0].code;
      this.addForm.controls.branchCode.setValue(branchCode);
    }
  }

  setViewData(rolePlayerBankAccounts: RolePlayerBankingDetail[]): void {
    this.rolePlayerBankAccounts = rolePlayerBankAccounts;
    this.getData();
    this.disable();
  }

  enable(): void {
    this.isDisabled = false;
    this.addForm.enable();
  }

  disable(): void {
    this.isDisabled = true;
    this.addForm.disable();
  }
}
