import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BankAccount, BeneficiaryBankDetail } from '../../../../../../../shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'app-beneficiary-banking-details',
  templateUrl: './beneficiary-banking-details.component.html',
  styleUrls: ['./beneficiary-banking-details.component.css']
})

export class BeneficiaryBankingDetailsComponent extends DetailsComponent implements OnInit, WizardComponentInterface {

  step: string;
  firstName: string;
  displayName: string;
  singleDataModel = false;

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookUpService: LookupService,
    private readonly wizardService: WizardService,
    private readonly activatedRoute: ActivatedRoute) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
  }

  selectedBankAccountforEdit: BankAccount;
  beneficiaryBankingDetails: BeneficiaryBankDetail[];
  beneficiaryId: number;
  bankAccountId: number;
  banks: Lookup[];
  bankAccountTypes: Lookup[];
  universalBranchCode: string;
  isAdd: boolean;
  showBankAccount: boolean;
  isWizardCompleted: boolean;
  public hasBeneficiaries: boolean;

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.getBanks();
      this.getBankAccountTypes();

      this.showBankAccount = false;
      this.createForm(params.linkedId);
      this.wizardService.getWizard(params.linkedId).subscribe(wizard => {
        this.isWizardCompleted = wizard.wizardStatus === 'Completed';
      });
    });
  }

  wizardReadFormData(): any {
    return this.readForm();
  }

  wizardPopulateForm(context: WizardContext): void {
    this.createForm('');
    this.setForm(context.currentData);
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    return this.getFormValidationResult(this.displayName);
  }

  enable(): void {
    this.form.enable();
  }

  disable(): void {
    this.form.disable();
  }

  getBanks(): void {
    this.lookUpService.getBanks().subscribe(
      banks => {
        this.banks = banks;
      });
  }

  getBankAccountTypes(): void {
    this.lookUpService.getBankAccountTypes().subscribe(
      types => {
        this.bankAccountTypes = types;
      });
  }

  bankChange($event: any) {
    const account = this.banks.find(bank => bank.id === $event.value);
    this.universalBranchCode = account.universalBranchCode;
    this.form.patchValue({ universalBranchCode: account.universalBranchCode });
  }

  createForm(id: any): void {
    this.clearDisplayName();

    if (this.form) { return; }

    this.form = this.formBuilder.group({
      id,
      beneficiaries: new UntypedFormControl(''),
      bank: new UntypedFormControl(''),
      accountType: new UntypedFormControl(''),
      accountNumber: new UntypedFormControl(''),
      accountHolderName: new UntypedFormControl(''),
      universalBranchCode: new UntypedFormControl(''),
    });
  }

  patchBankingForm() {
    this.form.patchValue({
      bank: this.selectedBankAccountforEdit.bankId,
      accountType: this.selectedBankAccountforEdit.accountTypeId,
      accountNumber: this.selectedBankAccountforEdit.accountNumber,
      accountHolderName: this.selectedBankAccountforEdit.nameOfAccountHolder,
      universalBranchCode: this.selectedBankAccountforEdit.universalBranchCode,
    });
  }

  readForm() {
    return this.beneficiaryBankingDetails;
  }

  setForm(item: any) {
    this.beneficiaryBankingDetails = item;

    if (!this.beneficiaryBankingDetails) {
      this.hasBeneficiaries = false;
      return;
    }

    if (this.beneficiaryBankingDetails) {
      this.hasBeneficiaries = true;
    }

    this.form.patchValue({
      id: -1
    });
  }

  save() { }

  editBankDetails(beneficiaryId: number, bankAccountId: number) {
    this.isAdd = false;

    this.beneficiaryId = beneficiaryId;
    this.bankAccountId = bankAccountId;

    const beneficiary = this.beneficiaryBankingDetails.find(s => s.beneficiaryId === beneficiaryId);
    const bankAccount = beneficiary.bankAccounts.find(x => x.id === bankAccountId);

    this.showBankAccount = true;
    this.form.controls.universalBranchCode.disable();
    this.selectedBankAccountforEdit = bankAccount;

    this.patchBankingForm();
  }

  addBankDetails(beneficiaryId: number) {
    this.isAdd = true;
    this.beneficiaryId = beneficiaryId;
    this.showBankAccount = true;
    this.form.controls.universalBranchCode.disable();
  }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/search');
  }

  saveBankAccount() {
    const account = this.readBankAccount();
    const beneficiary = this.beneficiaryBankingDetails.find(s => s.beneficiaryId === this.beneficiaryId);

    if (this.isAdd) {
      const beneficiaryIndex = this.beneficiaryBankingDetails.indexOf(beneficiary);
      this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts.push(account);
    } else {
      const bankAccount = beneficiary.bankAccounts.find(x => x.id === this.bankAccountId);
      const beneficiaryIndex = this.beneficiaryBankingDetails.indexOf(beneficiary);
      const bankAccountIndex = this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts.indexOf(bankAccount);
      this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts[bankAccountIndex] = account;
    }

    this.clearBankingDetails();
    this.showBankAccount = false;
  }

  removeBankDetails(beneficiaryId: number, accountNumber: string) {
    const beneficiary = this.beneficiaryBankingDetails.find(s => s.beneficiaryId === beneficiaryId);
    const beneficiaryIndex = this.beneficiaryBankingDetails.indexOf(beneficiary);
    const bankAccount = beneficiary.bankAccounts.find(x => x.accountNumber === accountNumber);
    const bankAccountIndex = this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts.indexOf(bankAccount);
    this.beneficiaryBankingDetails[beneficiaryIndex].bankAccounts.splice(bankAccountIndex, 1);
  }

  clearBankingDetails() {
    this.form.patchValue({
      bank: '',
      accountType: '',
      accountNumber: '',
      accountHolderName: '',
      universalBranchCode: '',
    });
  }

  readBankAccount() {
    const formModel = this.form.value;
    const bankAccount = new BankAccount();

    if (this.isAdd) {
      bankAccount.id = -1;
    } else {
      bankAccount.id = this.selectedBankAccountforEdit.id;
    }

    bankAccount.nameOfAccountHolder = formModel.accountHolderName;
    bankAccount.bankId = formModel.bank as number;
    bankAccount.bankName = (this.banks.find(x => x.id === bankAccount.bankId)).name;
    bankAccount.accountTypeId = formModel.accountType as number;
    bankAccount.accountType = (this.bankAccountTypes.find(x => x.id === bankAccount.accountTypeId)).name;
    bankAccount.accountNumber = formModel.accountNumber;
    bankAccount.bankBranchNumber = this.form.controls.universalBranchCode.value;
    bankAccount.universalBranchCode = this.form.controls.universalBranchCode.value;

    if (this.isAdd) {
      bankAccount.isPendingAdd = true;
    } else {
      bankAccount.isPendingEdit = true;
    }
    return bankAccount;
  }

  cancel() {
    this.showBankAccount = false;
  }
}
