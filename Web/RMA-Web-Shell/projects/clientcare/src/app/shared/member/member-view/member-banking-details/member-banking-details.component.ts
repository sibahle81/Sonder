import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { RolePlayerBankingDetailDataSource } from 'projects/shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.datasource';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import 'src/app/shared/extensions/string.extensions';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { DatePipe } from '@angular/common';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { GeneralAuditDialogComponent } from '../../../general-audits/general-audit-dialog/general-audit-dialog.component';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  selector: 'member-banking-details',
  templateUrl: './member-banking-details.component.html',
  styleUrls: ['./member-banking-details.component.css']
})
export class MemberBankingDetailsComponent implements OnInit, OnChanges {

  addPermission = 'Add Member';
  editPermission = 'Edit Member';
  viewPermission = 'View Member';

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  @Input() member: RolePlayer = new RolePlayer();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  bankAccountTypes: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  
  addForm: UntypedFormGroup;
  activeSection = 'showAccounts';
  accountValidationErrorMsg = String.Empty;
  rolePlayerBankingDetail: RolePlayerBankingDetail;
  rolePlayerBankAccounts: RolePlayerBankingDetail[] = [];
  hideForm = true;
  isDisabled = true;
  idNumber = String.Empty;
  viewBankingDetails: boolean;

  form: UntypedFormGroup;
  requiredPermission = 'Manage Member Banking Details';
  hasPermission = true;

  requiredAddPermission = 'Add Banking Details';
  hasAddPermission = false;

  requiredEditPermission = 'Edit Banking Details';
  hasEditPermission = false;

  isValid = false;

  isViewMode: boolean;
  isEditMode: boolean;
  isAddMode: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public readonly dataSource: RolePlayerBankingDetailDataSource,
    private readonly integrationService: IntegrationService,
    private readonly alertService: AlertService,
    public datepipe: DatePipe,
    private readonly rolePlayerService: RolePlayerService,
    private readonly alert: ToastrManager,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.hasAddPermission = userUtility.hasPermission(this.requiredAddPermission);
    this.hasEditPermission = userUtility.hasPermission(this.requiredEditPermission);

    this.createForm();
    this.showAddAccount();
    this.getLookups();
    if (this.member.rolePlayerBankingDetails) {
      this.rolePlayerBankAccounts = this.member.rolePlayerBankingDetails;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.member) {
      return;
    }
    this.rolePlayerBankAccounts = this.member.rolePlayerBankingDetails ? this.member.rolePlayerBankingDetails : [];
  }

  checkPermissions(permission: string): boolean {
    return userUtility.hasPermission(permission);
  }

  createForm(): void {
    this.addForm = this.formBuilder.group({
      roleplayerBankingId: new UntypedFormControl(0),
      roleplayerId: new UntypedFormControl(0),
      bankId: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      bankBranchId: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      effectiveDate: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      bankAccountType: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      accountNumber: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      name: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      branchCode: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required]
    });
  }


  addBank(): void {
    this.isSaving$.next(true);
    this.toggle();
    if (!this.addForm.valid) { return; }
    const rolePlayerBankingDetail = this.readBankAccountForm();
    if (rolePlayerBankingDetail.rolePlayerBankingId <= 0) {
      this.rolePlayerBankAccounts.push(rolePlayerBankingDetail);
      this.member.rolePlayerBankingDetails = this.rolePlayerBankAccounts;
    } else {
      const index = this.rolePlayerBankAccounts.findIndex(s => s.rolePlayerBankingId === rolePlayerBankingDetail.rolePlayerBankingId);
      this.rolePlayerBankAccounts[index] = rolePlayerBankingDetail;
      this.member.rolePlayerBankingDetails = this.rolePlayerBankAccounts;
    }
    this.isSaving$.next(false);
  }

  cancel() {
    this.toggle();
    this.reset();
  }

  reset() {
    this.rolePlayerBankingDetail = new RolePlayerBankingDetail();
    this.addForm.controls.roleplayerBankingId.reset();
    this.addForm.controls.roleplayerId.reset();
    this.addForm.controls.bankId.reset();
    this.addForm.controls.bankBranchId.reset();
    this.addForm.controls.bankAccountType.reset();
    this.addForm.controls.accountNumber.reset();
    this.addForm.controls.name.reset();
    this.addForm.controls.branchCode.reset();
  }

  delete(account: RolePlayerBankingDetail) {
    const index = this.rolePlayerBankAccounts.findIndex(s => s === account);
    this.rolePlayerBankAccounts.splice(index, 1);
    this.validateAccounts();
  }

  validateAccounts() {
    this.isValid = this.rolePlayerBankAccounts.length > 0;
    this.isValidEmit.emit(this.isValid);
  }

  readBankAccountForm(): RolePlayerBankingDetail {
    const rolePlayerBankingDetail = new RolePlayerBankingDetail();
    rolePlayerBankingDetail.rolePlayerBankingId = this.addForm.controls.roleplayerBankingId.value ? this.addForm.controls.roleplayerBankingId.value : 0;
    rolePlayerBankingDetail.purposeId = 1;
    rolePlayerBankingDetail.rolePlayerId = this.addForm.controls.roleplayerId.value ? this.addForm.controls.roleplayerId.value : 0;
    rolePlayerBankingDetail.effectiveDate = this.addForm.controls.effectiveDate.value;
    rolePlayerBankingDetail.accountNumber = this.addForm.controls.accountNumber.value;
    rolePlayerBankingDetail.bankBranchId = this.addForm.controls.bankBranchId.value;
    rolePlayerBankingDetail.bankAccountType = this.addForm.controls.bankAccountType.value;
    rolePlayerBankingDetail.accountHolderName = this.addForm.controls.name.value;
    rolePlayerBankingDetail.branchCode = this.addForm.controls.branchCode.value;
    rolePlayerBankingDetail.isDeleted = false;
    return rolePlayerBankingDetail;
  }

  verifyBankAccount(account: RolePlayerBankingDetail): void {
    this.accountValidationErrorMsg = String.Empty;
    this.dataSource.isLoading = true;
    this.dataSource.statusMsg = 'Verifying bank account ...';
    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
      account.accountHolderName, this.idNumber)
      .subscribe(
        data => {
          this.dataSource.isLoading = false;
          this.dataSource.statusMsg = String.Empty;
          if (data.success) {
            this.accountValidationErrorMsg = String.Empty;
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

  toggleBankDetails(rolePlayerBankingDetail: RolePlayerBankingDetail) {
    this.hideForm = !this.hideForm;
    this.viewBankingDetails = !this.viewBankingDetails;
    this.rolePlayerBankingDetail = rolePlayerBankingDetail;
    this.patchForm();
  }

  toggle() {
    this.hideForm = !this.hideForm;
    this.viewBankingDetails = !this.viewBankingDetails;
    this.edit();
  }

  patchForm() {
    if (this.rolePlayerBankingDetail) {
      const branch = this.branches.filter(b => b.id === this.rolePlayerBankingDetail.bankBranchId);
      this.addForm.patchValue({
        roleplayerBankingId: this.rolePlayerBankingDetail.rolePlayerBankingId,
        roleplayerId: this.rolePlayerBankingDetail.rolePlayerId,
        bankId: branch[0].bankId,
        bankBranchId: branch[0].id,
        effectiveDate: this.rolePlayerBankingDetail.effectiveDate,
        bankAccountType: this.rolePlayerBankingDetail.bankAccountType,
        accountNumber: this.rolePlayerBankingDetail.accountNumber,
        name: this.rolePlayerBankingDetail.accountHolderName,
        branchCode: this.rolePlayerBankingDetail.branchCode
      });
    }
  }

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

  getData(): void {
    if (this.rolePlayerBankAccounts) {
      this.dataSource.getData(this.rolePlayerBankAccounts);
    }
  }

  enable(): void {
    this.isDisabled = false;
    this.addForm.enable();
  }

  disable(): void {
    this.isDisabled = true;
    this.addForm.disable();
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Account Number', def: 'accountNumber', show: true },
      { display: 'Account Holder', def: 'accountHolderName', show: true },
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

  getLookups(): void {
    this.getBanks();
    this.getBankBranches();
    this.getBankAccountTypes();
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
        this.filteredBranches = data;
      });
  }

  getBank(branchId: string): string {
    const branch = this.branches.find(b => b.code == branchId);
    return branch && branch.bank ? branch.bank.name : 'unknown';
  }

  getAccountType(accountTypeId: number): string {
    const accountType = BankAccountTypeEnum[accountTypeId];
    return accountType.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getBranch(branchId: string): string {
    const branch = this.branches.find(b => b.code == branchId);
    return branch ? branch.name : 'unknown';
  }

  formatDate(value: Date) {
    return this.datepipe.transform(value, 'yyyy-MM-dd');
  }

  showAddAccount(): void {
    this.filteredBranches = [];
    this.addForm.patchValue({
      bankId: 0,
      bankBranchId: 0,
      effectiveDate: new Date(),
      bankAccountType: 0,
      accountNumber: String.Empty,
      name: String.Empty,
      branchCode: String.Empty
    });
    this.showSection('addAccount');
  }

  showSection(section: string) {
    this.activeSection = section;
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

  disableFormControl(controlName: string) {
    this.addForm.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.addForm.get(controlName).enable();
  }

  view() {
    this.isViewMode = !this.isViewMode;
    this.resetForm();
  }

  edit() {
    this.isEditMode = true;
    this.enableFormControl('bankId');
    this.enableFormControl('bankBranchId');
    this.enableFormControl('effectiveDate');
    this.enableFormControl('bankAccountType');
    this.enableFormControl('accountNumber');
    this.enableFormControl('name');
    this.enableFormControl('branchCode');
  }

  resetForm() {
    this.isEditMode = false;
    this.disableFormControl('bankId');
    this.disableFormControl('bankBranchId');
    this.disableFormControl('effectiveDate');
    this.disableFormControl('bankAccountType');
    this.disableFormControl('accountNumber');
    this.disableFormControl('name');
    this.disableFormControl('branchCode');
  }

  save() {
    this.isSaving$.next(true);
    this.resetForm();
    let bankingDetails = new RolePlayerBankingDetail();
    bankingDetails = this.readBankAccountForm();

    if (bankingDetails.rolePlayerBankingId <= 0) {
      this.rolePlayerBankAccounts.push(bankingDetails);
      this.member.rolePlayerBankingDetails = this.rolePlayerBankAccounts;
    } else {
      const index = this.rolePlayerBankAccounts.findIndex(s => s.rolePlayerBankingId === bankingDetails.rolePlayerBankingId);
      this.rolePlayerBankAccounts[index] = bankingDetails;
      this.member.rolePlayerBankingDetails = this.rolePlayerBankAccounts;
    }

    this.rolePlayerService.updateRolePlayer(this.member).subscribe(result => {
      if (result) {
        this.rolePlayerService.getRolePlayer(this.member.rolePlayerId).subscribe(roleplayer => {
          this.toggle();
          this.member.rolePlayerBankingDetails = roleplayer.rolePlayerBankingDetails;
          this.isSaving$.next(false);
          this.alert.successToastr(`${this.member.displayName} was updated`);
        });
      }
    });
  }

  addBankAccount(): void {
    this.isWizard ? this.addBank() : this.save();
  }

  openAuditDialog(rolePlayerBankingDetail: RolePlayerBankingDetail) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.BankAccount,
        itemId: rolePlayerBankingDetail.rolePlayerBankingId,
        heading: 'Banking Details Audit',
        propertiesToDisplay: ['AccountHolderIdNumber', 'PurposeId', 'EffectiveDate', 'AccountNumber',
          'BankBranchId', 'BankAccountType', 'AccountHolderName', 'BranchCode',
          'ApprovalRequestedFor', 'ApprovalRequestId', 'IsApproved', 'Reason']
      }
    });
  }
}
