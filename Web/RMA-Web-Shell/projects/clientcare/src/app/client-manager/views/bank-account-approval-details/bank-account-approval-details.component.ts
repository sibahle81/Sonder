import { Component, OnInit } from '@angular/core';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { BankAccount } from '../../shared/Entities/bank-account';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BankAccountService } from '../../../client-manager/shared/services/bank-account.service';

@Component({
  selector: 'app-bank-account-approval-details',
  templateUrl: './bank-account-approval-details.component.html'
})
export class BankAccountApprovalDetailsComponent extends DetailsComponent implements OnInit {

  id: number;
  bankAccountforEdit: BankAccount;
  banks: Lookup[];
  bankAccountTypes: Lookup[];
  branchId: number;
  universalBranchCode: string;
  isLoaded: boolean;
  isLoading: boolean;
  disable: boolean;

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly router: Router,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookUpService: LookupService,
    private readonly bankAccountService: BankAccountService) {
    super(appEventsManager, alertService, router, 'Approval decision', '/clientcare/client-manager/bank-account-approval-list', 1);
    dateAdapter.setLocale('en-za');
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.isLoaded = false;
      this.id = params.id;
      this.createForm(this.id);
      this.setup();
      this.getBanks();
    });
  }

  getBanks(): void {
    this.lookUpService.getBanks().subscribe(
      banks => {
        this.banks = banks;
        this.getBankAccountTypes();
      });
  }

  getBankAccountTypes(): void {
    this.lookUpService.getBankAccountTypes().subscribe(
      types => {
        this.bankAccountTypes = types;
        this.getBankAccountDetails(this.id);
      });
  }

  getBankAccountDetails(id: number) {
    this.bankAccountService.getBankAccount(id).subscribe( (account) => {
      this.bankAccountforEdit = account;
      this.setForm();
    });
  }

  bankChange($event: any) {
    const account = this.banks.find(bank => bank.id === $event.value);
    this.universalBranchCode = account.universalBranchCode;
    this.form.patchValue({ universalBranchCode: account.universalBranchCode });
  }

  createForm(id: any): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      id,
      beneficiaries: new UntypedFormControl(''),
      bank: new UntypedFormControl(''),
      accountType: new UntypedFormControl(''),
      accountNumber: new UntypedFormControl(''),
      accountHolderName: new UntypedFormControl(''),
      universalBranchCode: new UntypedFormControl(''),
      reason: new UntypedFormControl('')
    });
  }

  setup() {
    this.form.get('bank').disable();
    this.form.get('accountType').disable();
    this.form.get('accountNumber').disable();
    this.form.get('accountHolderName').disable();
    this.form.get('universalBranchCode').disable();
  }

  setForm() {
    this.form.patchValue({
      bank: this.bankAccountforEdit.bankId,
      accountType: this.bankAccountforEdit.bankAccountTypeId,
      accountNumber: this.bankAccountforEdit.accountNumber,
      accountHolderName: this.bankAccountforEdit.accountHolderName,
      universalBranchCode: this.bankAccountforEdit.universalBranchCode,
      reason: this.bankAccountforEdit.reason,
    });
    this.isLoaded = true;
  }

  readForm() {
    this.bankAccountforEdit.reason = this.form.controls.reason.value as string;
    return this.bankAccountforEdit;
  }

  save() {}

  approve() {
    this.isLoading = true;
    this.form.get('reason').disable();
    this.disable = true;
    const account = this.readForm();
    account.isApproved = true;
    this.bankAccountService.editBankAccount(account).subscribe(() => {
      this.done('Bank detail approved');
    });
  }

  reject() {
    this.isLoading = true;
    this.form.get('reason').disable();
    this.disable = true;
    const account = this.readForm();
    account.isApproved = false;
    this.bankAccountService.editBankAccount(account).subscribe(() => {
      this.done('Bank detail rejected');
    });
  }

  cancel() {
    this.router.navigateByUrl('/clientcare/client-manager/bank-account-approval-list');
  }
}
