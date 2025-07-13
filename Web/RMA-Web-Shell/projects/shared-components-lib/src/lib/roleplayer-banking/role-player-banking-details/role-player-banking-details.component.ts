import { Component, Inject, Input, OnChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { BehaviorSubject } from 'rxjs';
import { RolePlayerBankingDetail } from '../../models/banking-details.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AccountPurposeEnum } from 'projects/fincare/src/app/billing-manager/views/manual-allocation/re-allocation/re-alloction/accountPurposeEnum';

@Component({
  selector: 'role-player-banking-details',
  templateUrl: './role-player-banking-details.component.html',
  styleUrls: ['./role-player-banking-details.component.css']
})
export class RolePlayerBankingDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() rolePlayer: RolePlayer;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() verifyAccount = false;

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading account details...please wait');
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject('');

  bankAccountTypes: BankAccountTypeEnum[];
  selectedAccountType: BankAccountTypeEnum;

  bankAccount: RolePlayerBankingDetail;
  bankAccounts: RolePlayerBankingDetail[];

  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly integrationService: IntegrationService,
    private readonly alertService: AlertService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RolePlayerBankingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super();
    this.bankAccount = data.bankAccount;
    this.isReadOnly = data.isReadOnly;
    this.rolePlayer = data.rolePlayer;
    this.bankAccounts = data.rolePlayer.rolePlayerBankingDetails ? data.rolePlayer.rolePlayerBankingDetails : [];
    this.banks = data.banks;
    this.branches = data.branches;
    this.verifyAccount = data.verifyAccount;
    this.getLookups();
    this.createForm();
    this.patchForm();
  }

  ngOnChanges(): void {
    this.isReadOnly = this.isReadOnly;
  }

  getLookups() {
    this.bankAccountTypes = this.ToArray(BankAccountTypeEnum);
  }

  formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      rolePlayerBankingId: new UntypedFormControl(0),
      rolePlayerId: new UntypedFormControl(0),
      bankId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bankBranchId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      effectiveDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      bankAccountType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      accountNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      name: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      branchCode: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    if (this.isReadOnly) {
      this.disableFormFields();
    } else {
      this.form.patchValue({
        effectiveDate: new Date().getCorrectUCTDate()
      });
      this.enable();
    }
  }

  disableFormFields() {
    this.form.disable();
  }

  enable(): void {
    this.form.enable();
  }

  getAccountType(accountType: string): string {
    if (!accountType) { return; }
    return this.formatText(accountType);
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessages$.next('saving bank details...please wait');
    this.readForm();

    if (this.verifyAccount) {
      this.verifyBankAccount(this.bankAccount);
    } else {
      this.setBankDetails();
      this.dialogRef.close(this.bankAccounts);
    }
  }

  setBankDetails() {
    let index = this.bankAccounts?.findIndex(a => a.rolePlayerBankingId === this.bankAccount.rolePlayerBankingId);
    if (index > -1) {
      this.bankAccounts[index] = this.bankAccount;
    } else {
      this.bankAccounts.push(this.bankAccount);
    }
  }

  patchForm() {
    if (this.bankAccount) {
      const branch = this.branches.filter(b => b.id === this.bankAccount.bankBranchId);
      this.form.patchValue({
        rolePlayerBankingId: this.bankAccount.rolePlayerBankingId,
        rolePlayerId: this.rolePlayer.rolePlayerId,
        bankId: branch[0].bankId,
        bankBranchId: branch[0].id,
        effectiveDate: this.bankAccount.effectiveDate,
        bankAccountType: BankAccountTypeEnum[this.bankAccount.bankAccountType],
        accountNumber: this.bankAccount.accountNumber,
        name: this.bankAccount.accountHolderName,
        branchCode: this.bankAccount.branchCode
      });
    }
    this.isLoading$.next(false);
  }

  loadBranches(bankId: number) {
    this.filteredBranches = this.branches.filter(b => b.bankId == bankId);

    this.form.controls.bankBranchId.reset();
    this.form.controls.branchCode.reset();
  }

  loadBranchCode(branch: BankBranch): void {
    this.form.controls.branchCode.setValue(branch.code);
  }

  readForm() {
    if (!this.bankAccount || this.bankAccount.rolePlayerBankingId <= 0) {
      this.bankAccount = new RolePlayerBankingDetail();
      this.setFields();
    }
    else {
      this.setFields();
    }
  }

  setFields() {
    this.bankAccount.purposeId = +AccountPurposeEnum.fromAccount;
    this.bankAccount.rolePlayerId = this.rolePlayer.rolePlayerId;
    this.bankAccount.bankId = this.form.controls.bankId.value ? this.form.controls.bankId.value : null;
    this.bankAccount.effectiveDate = this.form.controls.effectiveDate.value ? this.form.controls.effectiveDate.value : null;
    this.bankAccount.accountNumber = this.form.controls.accountNumber.value ? this.form.controls.accountNumber.value : null;
    this.bankAccount.bankBranchId = this.form.controls.bankBranchId.value ? this.form.controls.bankBranchId.value : null;
    this.bankAccount.bankAccountType = this.form.controls.bankAccountType.value ? +BankAccountTypeEnum[this.form.controls.bankAccountType.value] : null;
    this.bankAccount.accountHolderName = this.form.controls.name.value ? this.form.controls.name.value : null;
    this.bankAccount.branchCode = this.form.controls.branchCode.value ? this.form.controls.branchCode.value : null;
  }

  verifyBankAccount(account: RolePlayerBankingDetail): void {
    this.loadingMessages$.next('verifying bank account...please wait');

    let idNumber: string;
    if (this.rolePlayer.company) {
      idNumber = this.rolePlayer.company.idNumber;
    } else {
      idNumber = this.rolePlayer.person.idNumber;
    }
    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
      account.accountHolderName, idNumber)
      .subscribe(
        data => {
          if (data.success) {
            this.alertService.success('account has been verified');
            this.setBankDetails();
            this.dialogRef.close(this.bankAccounts);
          } else {
            this.errorMessage$.next(`account verification error: ${data.errmsg}`)
            this.isLoading$.next(false);
          }
        }
      );
  }

  cancel() {
    this.dialogRef.close();
  }
}
