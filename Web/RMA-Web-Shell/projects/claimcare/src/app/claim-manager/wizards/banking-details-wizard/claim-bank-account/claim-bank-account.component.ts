import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ClaimRolePlayerBankingModel } from '../../../shared/entities/claim-beneficiary-banking-model';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RolePlayerDialogBankingDetailsComponent } from '../role-player-dialog-banking-details/role-player-dialog-banking-details.component';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  selector: 'role-player-list',
  templateUrl: './claim-bank-account.component.html',
  styleUrls: ['./claim-bank-account.component.css']
})

export class ClaimBankAccountComponent extends WizardDetailBaseComponent<ClaimRolePlayerBankingModel> {

  form: UntypedFormGroup;
  banks: Lookup[];
  bankAccountTypes: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  minDate: Date;
  isLoading = false;
  isSearching = false;
  searchProgress = false;
  bankingDetailsFound: string;
  accountValidationErrorMsg = '';
  day = new Date().getDay().toString();
  year = (new Date().getFullYear()).toString();
  rolePlayerBankAccounts: RolePlayerBankingDetail[] = [];
  isWizard = false;
  isDisabled = false;
  verifiedClicked = false;
  branchId: number;
  rolePlayerId: number;
  bankId: number;
  accountDetails: RolePlayerBankingDetail;
  validResults: boolean;

  constructor(
    private readonly claimCareService: ClaimCareService,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly integrationService: IntegrationService,
    private readonly rolePlayerService: RolePlayerService,
    private dialogBox: MatDialog) {

    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any) {
    if (this.form) { return; }
    this.minDate = new Date(`${this.year}-01-${this.day}`);

    this.form = this.formBuilder.group({
      rolePlayerId: id,
      bankId: ['', [Validators.min(1)]],
      bankBranchId: ['', [Validators.min(1)]],
      effectiveDate: ['', [Validators.required]],
      bankAccountType: ['', [Validators.min(1)]],
      accountNumber: ['', [Validators.required]],
      name: ['', [Validators.required]],
      initials: ['', [Validators.required]],
      branchCode: ['', [Validators.required]],
      idNumber: ['', [Validators.required]],
      verifiedClicked: false
    });
    this.form.valueChanges.subscribe(() => this.verifiedClicked = false);
  }

  // Populating the form
  populateForm(): void {
    this.rolePlayerId = this.model.rolePlayer.person.rolePlayerId;
    if (this.rolePlayerId === 0) {
      this.rolePlayerId = this.model.rolePlayerBankingDetail.rolePlayerId;
    }
    this.getBanks();
  }

  onLoadLookups(): void { }

  populateModel(): void {
    const value = this.form.value;

    this.model.rolePlayerBankingDetail.effectiveDate = value.effectiveDate;
    this.model.rolePlayerBankingDetail.accountNumber = value.accountNumber;
    this.model.rolePlayerBankingDetail.bankBranchId = value.bankBranchId;
    this.model.rolePlayerBankingDetail.bankAccountType = value.bankAccountType;
    this.model.rolePlayerBankingDetail.accountHolderName = value.name;
    this.model.rolePlayerBankingDetail.initials = value.initials;
    this.model.rolePlayerBankingDetail.branchCode = value.branchCode;
    this.model.rolePlayerBankingDetail.isDeleted = false;
    this.model.rolePlayerBankingDetail.accountHolderIdNumber = value.idNumber;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  enable(): void {
    this.isDisabled = false;
    this.form.enable();
  }

  // Getting banks
  getBanks(): void {
    this.isLoading = true;
    this.lookupService.getBanks().subscribe(
      data => {
        this.banks = data;
        this.getBankBranches();
      }
    );
  }

  loadBranches(): void {
    this.form.patchValue({ bankBranchId: 0 });
    const bankId = this.form.value.bankId;
    this.filteredBranches = this.branches.filter(b => b.bankId === bankId);
  }

  loadSelectedBranch(branchId: number): void {
    if (this.branches.length > 0 && branchId > 0) {
      this.filteredBranches = this.branches.filter(b => b.id === branchId);
      this.branchId = this.filteredBranches[0].id;
      this.bankId = this.filteredBranches[0].bankId;
    }
  }

  loadBranchCode(): void {
    const branchId = this.form.value.bankBranchId;
    const branchData = this.branches.filter(b => b.id === branchId);
    if (branchData.length > 0) {
      const branchCode = branchData[0].code;
      this.form.controls.branchCode.setValue(branchCode);
    }
  }

  // Getting Branches
  getBankBranches(): void {
    this.lookupService.getBankBranches().subscribe(
      data => {
        this.branches = data;
        this.getBankAccountTypes();

        const bank = this.model.rolePlayerBankingDetail;
        this.loadSelectedBank(bank);
      }
    );
  }

  // Getting bank account types
  getBankAccountTypes(): void {
    this.lookupService.getBankAccountTypes().subscribe(
      data => {
        this.bankAccountTypes = data;
        this.isLoading = false;
      }
    );
  }

  closeDialog(): void {
  }

  validateForm(): boolean {
    this.validResults = true;
    if (this.form.controls.bankId.value == undefined || this.form.controls.bankId.value == null) {
      this.validResults = false;
    }
    if (this.form.controls.bankBranchId.value == undefined || this.form.controls.bankBranchId.value == null || this.form.controls.bankBranchId.value == 0) {
      this.validResults = false;
    }
    if (this.form.controls.bankAccountType.value == undefined || this.form.controls.bankAccountType.value == null || this.form.controls.bankAccountType.value == 0) {
      this.validResults = false;
    }
    if (this.form.controls.branchCode.value == undefined || this.form.controls.branchCode.value == null || this.form.controls.branchCode.value == "") {
      this.validResults = false;
    }
    if (this.form.controls.name.value == undefined || this.form.controls.name.value == null || this.form.controls.name.value == "") {
      this.validResults = false;
    }
    if (this.form.controls.accountNumber.value == undefined || this.form.controls.accountNumber.value == null || this.form.controls.accountNumber.value == "") {
      this.validResults = false;
    }
    if (this.form.controls.initials.value == undefined || this.form.controls.initials.value == null || this.form.controls.initials.value == "") {
      this.validResults = false;
    }
    if (this.form.controls.effectiveDate.value == undefined || this.form.controls.effectiveDate.value == null) {
      this.validResults = false;
    }    
    if (this.form.controls.idNumber.value == undefined || this.form.controls.idNumber.value == null) {
      this.validResults = false;
    }
    return this.validResults;
  }

  verifyBankAccountDetails() {
    if (this.validateForm() === true) {
      this.model.isVerified = true;
      this.populateModel();
      this.accountDetails = this.model.rolePlayerBankingDetail;
      this.sendBankDetailsForVerification(this.accountDetails);
      this.verifiedClicked = true;
    } else {
      this.alertService.error('Please capture required values');
    }
  }

  sendBankDetailsForVerification(account: RolePlayerBankingDetail): void {
    this.claimCareService.verifyBankAccount(account.accountNumber
      , account.bankAccountType
      , account.branchCode
      , account.accountHolderName
      , account.initials
      , account.accountHolderIdNumber).subscribe(result => {
        if (result) {
          this.alertService.success('Account details sent for verification');
        } else {
          this.alertService.error('Account details already exist');
        }
      });
  }

  verifyBankAccount(account: RolePlayerBankingDetail): void {
    this.accountValidationErrorMsg = '';
    // add the load snippet here
    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.initials,
      account.accountHolderName, account.accountHolderIdNumber)
      .subscribe(
        data => {
          this.isLoading = true;
          if (data.success) {
            this.accountValidationErrorMsg = '';
            this.alertService.success('Account has been verified');
            this.rolePlayerBankAccounts.push(account);
            this.setCalculatedStatus();
          } else {
            this.accountValidationErrorMsg = data.errmsg;
            this.alertService.error(this.accountValidationErrorMsg);
          }
        }
      );
    this.isLoading = false;
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
  loadBankingDetails(){

    const accountNumber = this.form.controls.accountNumber.value;    
    if(accountNumber.length > 5){ 
    this.isSearching = true;
    this.searchProgress = true;
    this.bankingDetailsFound = 'Searching for Banking Details...please wait';
    this.rolePlayerService.getBankingDetailsByAccountNumber(accountNumber).subscribe(
      data => {
        this.bankingDetailsFound = 'Banking Details found...';
        if (data.length == 1){
            const bank  = data[0];
            this.loadSelectedBank(bank);
            
        } else if(data.length > 1) {

          const dialogConfig = new MatDialogConfig();      
          dialogConfig.data = {
            disableClose: true,
            dataSource: data,
            bankAccountTypes: this.bankAccountTypes
          };
          const dialog = this.dialogBox.open(RolePlayerDialogBankingDetailsComponent, dialogConfig);
          dialog.afterClosed().subscribe((bank: RolePlayerBankingDetail) => {
            if (bank) {
              this.loadSelectedBank(bank);
            }
          });
        }else{
          this.bankingDetailsFound = 'Banking details not found, please capture details.';
        };
        this.searchProgress = false;
      }
    );   
  }
  }
  loadSelectedBank(bank: RolePlayerBankingDetail) : void {
    this.loadSelectedBranch(bank.bankBranchId);
    
    this.form.patchValue({
      rolePlayerId: bank.rolePlayerId,
      bankId: this.bankId,
      bankBranchId: bank.bankBranchId,
      effectiveDate: bank.effectiveDate,
      bankAccountType: bank.bankAccountType,
      accountNumber: bank.accountNumber,
      initials: bank.initials,
      name: bank.accountHolderName,
      branchCode: bank.branchCode,
      idNumber: bank.accountHolderIdNumber
    });
  }
}
