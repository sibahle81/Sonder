import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { BeneficiaryBankAccountRequest } from './beneficiary-Bank-Account-request';
import { BeneficiaryBankingDetailDataSource } from './beneficiary-banking-detail.datasource';
import { BeneficiaryBankingDetailService } from './beneficiary-banking-detail.service';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { PaymentMethodEnum } from '../../enums/payment-method-enum';
import { BankAccount as BankAccountCLC } from '../../models/bank-account';
import { Lookup } from '../../models/lookup.model';
import { AlertService } from '../../services/alert.service';
import { ClaimCareService } from '../../services/claimcare.service';
import { LookupService } from '../../services/lookup.service';
import { DetailsComponent } from '../details/details.component';
import { BankAccount, BeneficiaryBankDetail } from './beneficiary-bank-detail.model';
import { BankAccountService } from '../../services/bank-account.service';
import { Bank } from '../../models/bank';
import { BankBranch } from '../../models/bank-branch';

@Component({
  selector: 'lib-app-beneficiary-banking-detail',
  templateUrl: './beneficiary-banking-detail.component.html'
})
export class BeneficiaryBankingDetailComponent extends DetailsComponent implements OnInit {

  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  // Setting up the Datagrid columns
  columnDefinitions: any[] = [
    { display: 'Bank', def: 'bank', show: true },
    { display: 'Account Type', def: 'accountType', show: true },
    { display: 'Account Number', def: 'accountNumber', show: true },
    { display: 'Account Holder Name', def: 'accountHolderName', show: true },
    { display: 'Branch', def: 'branch', show: true },
    { display: 'Actions', def: 'actions', show: true },
  ];

  constructor(
    protected readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly alertService: AlertService,
    private readonly lookUpService: LookupService,
    protected readonly activatedRoute: ActivatedRoute,
    private readonly claimCareService: ClaimCareService,
    private readonly appEventsManager: AppEventsManager,
    public dataSource: BeneficiaryBankingDetailDataSource,
    private readonly bankAccountService: BankAccountService,
    private BenBankingDetailService: BeneficiaryBankingDetailService,) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
  }

  policyId: number;
  wizardId: number;
  beneficiaryId: number;
  bankAccountId: number;

  banks: Lookup[];
  bankAccountTypes: Lookup[];
  branches: BankBranch[];

  isAdd: boolean;
  isEdit: boolean;
  showBankAccount: boolean;
  workPoolStatusUpdate: boolean;
  canApproveBankDetails: boolean;
  bankDetailsApproved: boolean = false;

  workPool: string;
  system: string;
  reasonAdd: string;
  reasonUpdate: string;
  universalBranchCode: string;
  bankAccountDetails: any;

  bankAccountCLC: BankAccountCLC;
  beneficiaryBankingDetails: BeneficiaryBankDetail[];

  ngOnInit() {
    // const permissions = this.authService.getCurrentUserPermissions();
    // this.canApproveBankDetails = permissions.find(permission => permission.name === 'Approve Beneficiary Bank') != null;

    this.getBanks();
    this.getDataValues();
    this.getBankAccountTypes();
    this.createForm(this.policyId);
  }

  // Method setting the controls
  createForm(policyId: any): void {
    this.clearDisplayName();
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      approve: new FormControl(''),
      bank: new FormControl('', Validators.required),
      accountType: new FormControl('', Validators.required),
      accountNumber: new FormControl('', Validators.required),
      accountHolderName: new FormControl('', [Validators.required]),
      universalBranchCode: new FormControl('', [Validators.required]),
    });

    this.getBeneficiaryBankDetail(this.policyId);
    if (!this.canApproveBankDetails) {
      this.form.get('approve').disable();
    }
  }

  // Getting Bank account types for dropdown
  getBankAccountTypes(): void {
    this.lookUpService.getBankAccountTypes().subscribe(
      types => {
        this.bankAccountTypes = types;
      });
  }

  // Getting banks for dropdown
  getBanks(): void {
    this.lookUpService.getBanksAnon().subscribe(
      data => {
        const result: Bank[] = data.map((lookup) => ({
          id: lookup.id,
          name: lookup.name,
          universalBranchCode: lookup.code,
          isDeleted: false,
          createdBy: '',
          createdDate: undefined,
          modifiedBy: '',
          modifiedDate: undefined
        }));

        this.banks = result as unknown as Lookup[];
      });
  }

  getBankBranches(): void {
    this.lookUpService.getBankBranchesAnon().subscribe(
      data => {
        const bankBranches: BankBranch[] = data.map((lookup) => ({
          id: lookup.id,
          name: lookup.name,
          code: lookup.code,
          bankId: lookup.id,
          bank: {
            id: lookup.id,
            name: lookup.name,
            universalBranchCode: lookup.code,
            isDeleted: false,
            createdBy: '',
            createdDate: undefined,
            modifiedBy: '',
            modifiedDate: undefined
          }
        }));

        this.branches = bankBranches

      });
  }

  // Setting the data for datagrid
  getDataValues() {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
    this.dataSource.getData(this.policyId);
    this.isEdit = false;
  }

  // Method called from the bank dropdown in HTML
  bankChange($event: any) {
    const account = this.banks.find(bank => bank.id === $event.value);
    this.universalBranchCode = account.universalBranchCode;
    this.form.patchValue({ universalBranchCode: account.universalBranchCode });
  }

  // Reading the data from the front on save
  readForm() {
    const formModel = this.form.value;
  }

  // Setting the controls with data
  setForm(itemList: any) {
    if (itemList.length > 0) {
      for (const item of itemList) {
        const benBankAccount = item.bankAccounts;
        if (benBankAccount.length > 0) {
          for (const value of benBankAccount) {
            value.bankAccountType = this.bankAccountTypes.find(x => x.id === value.bankAccountTypeId).name;
          }
        }
      }
    } else { return; }
  }

  // Gets called when the form is created
  getBeneficiaryBankDetail(claimId: number): void {
    this.loadingStart(`Getting details...`);
    this.BenBankingDetailService.GetBeneficiariesAndBankingDetails(this.policyId).subscribe(bankAccounts => {
      if (bankAccounts.length > 0) {
        this.beneficiaryBankingDetails = bankAccounts;
      }
      this.setForm(this.beneficiaryBankingDetails);
      this.stopLoading();
    });
  }

  // The method being called from another module like claims to set the values
  setSystem(request: BeneficiaryBankAccountRequest) {
    this.workPool = request.workPool;
    this.system = request.system;
    this.reasonAdd = request.reasonAdd;
    this.reasonUpdate = request.reasonUpdate;
    this.policyId = request.policyId;
    this.wizardId = request.wizardId;
  }

  // This method is being called from the edit button in the datagrid
  editBankDetails(row: any) {
    this.bankAccountDetails = row;
    this.beneficiaryId = row.beneficiaryId;
    this.bankAccountId = row.id;

    this.isEdit = true;
    this.isAdd = false;
    this.showBankAccount = true;

    this.patchBankingForm();
  }

  // Called within the editBankDetails method, then patching the values
  patchBankingForm() {
    this.form.patchValue({
      bank: this.bankAccountDetails.bankId,
      accountType: this.bankAccountDetails.bankAccountTypeId,
      accountNumber: this.bankAccountDetails.accountNumber,
      accountHolderName: this.bankAccountDetails.nameOfAccountHolder,
      universalBranchCode: this.bankAccountDetails.universalBranchCode,
      approve: this.bankAccountDetails.isApproved
    });
  }


  // Show the details to add a bank account
  AddNewBankAccount() {
    this.clearBankingDetails();
    this.isAdd = true;
    this.isEdit = false;
    this.showBankAccount = true;
    this.beneficiaryBankingDetails.forEach(a => this.beneficiaryId = a.beneficiaryId);
    this.form.reset();
  }

  // This method is called on the save button
  saveBankAccount() {

    const account = this.readBankAccount();
    const beneficiary = this.beneficiaryBankingDetails.find(s => s.beneficiaryId === this.beneficiaryId);

    // Adding a bank Account
    if (this.isAdd) {
      const beneficiaryIndex = this.beneficiaryBankingDetails.indexOf(beneficiary);
      this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts.push(account);

      this.loadingStart(`Saving bank account...`);
      this.bankAccountCLC = new BankAccountCLC();
      this.bankAccountCLC.accountHolderName = account.accountHolderName;
      this.bankAccountCLC.accountNumber = account.accountNumber;
      this.bankAccountCLC.bankAccountTypeId = account.accountTypeId;
      this.bankAccountCLC.bankId = account.bankId;
      this.bankAccountCLC.branchNumber = account.bankBranchNumber;
      this.bankAccountCLC.paymentMethodId = account.paymentMethodId;
      this.bankAccountCLC.universalBranchCode = account.universalBranchCode;
      this.bankAccountCLC.itemId = account.itemId;
      this.bankAccountCLC.itemType = account.itemType;
      this.bankAccountCLC.bankAccountServiceTypeIds = null;
      this.bankAccountCLC.isActive = true;
      this.bankAccountCLC.isDeleted = false;
      this.bankAccountCLC.reason = account.reason;
      this.bankAccountCLC.isApproved = account.isApproved;
      this.bankAccountCLC.approvalRequestedFor = account.approvalRequestedFor;
      this.bankAccountCLC.approvalRequestId = account.approvalRequestId;
      this.bankAccountCLC.beneficiaryTypeId = beneficiary.beneficiaryTypeId;

      this.bankAccountService.addBankAccount(this.bankAccountCLC).subscribe(result => {
        this.addDone();
        this.getDataValues();
      });

      // Updating a bank Account
    } else {
      const bankAccount = beneficiary.bankAccounts.find(x => x.id === this.bankAccountId);
      const beneficiaryIndex = this.beneficiaryBankingDetails.indexOf(beneficiary);
      const bankAccountIndex = this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts.indexOf(bankAccount);
      this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts[bankAccountIndex] = account;

      this.loadingStart(`Updating bank account...`);
      this.bankAccountCLC = new BankAccountCLC();
      this.bankAccountCLC.id = account.id;
      this.bankAccountCLC.accountHolderName = account.accountHolderName;
      this.bankAccountCLC.accountNumber = account.accountNumber;
      this.bankAccountCLC.bankAccountTypeId = account.accountTypeId;
      this.bankAccountCLC.bankId = account.bankId;
      this.bankAccountCLC.branchNumber = account.bankBranchNumber;
      this.bankAccountCLC.paymentMethodId = account.paymentMethodId;
      this.bankAccountCLC.universalBranchCode = account.universalBranchCode;
      this.bankAccountCLC.itemId = account.itemId;
      this.bankAccountCLC.itemType = account.itemType;
      this.bankAccountCLC.bankAccountServiceTypeIds = null;
      this.bankAccountCLC.isActive = true;
      this.bankAccountCLC.isDeleted = false;
      this.bankAccountCLC.reason = account.reason;
      this.bankAccountCLC.isApproved = account.isApproved;
      this.bankAccountCLC.approvalRequestedFor = account.approvalRequestedFor;
      this.bankAccountCLC.approvalRequestId = account.approvalRequestId;
      this.bankAccountCLC.beneficiaryTypeId = beneficiary.beneficiaryTypeId;

      this.bankAccountService.editBankAccount(this.bankAccountCLC).subscribe(result => {
        this.editDone();
        this.getDataValues();
      });
    }

    this.clearBankingDetails();
    this.showBankAccount = false;
  }

  // Getting all the data from the form;
  readBankAccount() {
    const formModel = this.form.value;
    const bankAccount = new BankAccount();

    bankAccount.nameOfAccountHolder = formModel.accountHolderName;
    bankAccount.accountHolderName = formModel.accountHolderName;
    bankAccount.bankId = formModel.bank as number;
    bankAccount.bankName = (this.banks.find(x => x.id === bankAccount.bankId)).name;
    bankAccount.accountTypeId = formModel.accountType as number;
    bankAccount.accountType = (this.bankAccountTypes.find(x => x.id === bankAccount.accountTypeId)).name;
    bankAccount.accountNumber = formModel.accountNumber;
    bankAccount.bankBranchNumber = this.form.controls.universalBranchCode.value;
    bankAccount.universalBranchCode = this.form.controls.universalBranchCode.value;
    bankAccount.paymentMethodId = PaymentMethodEnum.EFT;
    bankAccount.itemId = this.beneficiaryId;
    bankAccount.itemType = 'Beneficiary';
    bankAccount.isApproved = formModel.isApproved;
    bankAccount.approvalRequestedFor = this.system;
    bankAccount.approvalRequestId = this.policyId;

    if (this.isAdd) {
      bankAccount.reason = this.reasonAdd;
      bankAccount.isPendingAdd = true;
    } else {
      bankAccount.id = this.bankAccountId;
      bankAccount.reason = this.reasonUpdate;
      bankAccount.isPendingEdit = true;
    }
    return bankAccount;
  }

  // This method is called on the Cancel button
  cancel() {
    this.isEdit = false;
    this.showBankAccount = false;
    this.clearBankingDetails();
  }

  stopLoading(): void {
    this.appEventsManager.loadingStop();
  }

  // This method is being called in the saveBankAccount method once it has been updated
  editDone(): void {
    this.appEventsManager.loadingStop();
    this.alertService.success(`Bank account has been updated successfully`, 'Bank account', true);
  }

  // This method is being called in the saveBankAccount method once it has been added
  addDone(): void {
    this.appEventsManager.loadingStop();
    this.alertService.success(`Bank account has been added successfully`, 'Bank account', true);
  }

  // Clearing the form controls
  clearBankingDetails() {
    this.form.patchValue({
      bank: '',
      accountType: '',
      accountNumber: '',
      accountHolderName: '',
      universalBranchCode: '',
    });
  }

  // Validating the account number
  ValidateAccountNumber(event: any) {
    const pattern = /[0-9\ ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  save() {
  }
}
