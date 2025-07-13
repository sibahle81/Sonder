import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { RolePlayerBankingListDataSource } from './role-player-banking-list.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { UnSubscribe } from 'src/app/shared/common/unsubscribe';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { RolePlayerBankingDetail } from 'src/app/shared/models/role-player-banking-detail';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { BankBranch } from 'src/app/shared/models/bank-branch';
import { BankingPurposeEnum } from 'src/app/shared/enums/banking-purpose.enum';
import { BankAccountTypeEnum } from 'src/app/shared/enums/bank-account-type-enum';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { IntegrationService } from 'src/app/shared/services/integrations.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { MemberService } from 'src/app/shared/services/member.service';
import { Bank } from 'src/app/shared/models/bank';

@Component({
  selector: 'role-player-banking-list',
  templateUrl: './role-player-banking-list.component.html',
  styleUrls: ['./role-player-banking-list.component.css']
})
export class RolePlayerBankingListComponent extends UnSubscribe implements OnChanges {
  addPermission = 'Add Banking';
  editPermission = 'Edit Banking';
  viewPermission = 'View Banking';
  viewAuditPermission = 'View Audits';

  @Input() rolePlayer: RolePlayer;

  @Input() isWizard = false;
  @Input() isReadOnly = false;

  @Input() showBankDetailsPurpose = true;

  @Input() verifyAccount = false;
  @Input() showSelectColumn = true;
  @Input() selectedRolePlayerBankingId: number;

  @Output() rolePlayerBankingSelectedEmit: EventEmitter<RolePlayerBankingDetail> = new EventEmitter();
  @Output() rolePlayerBankingEditedEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: FormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading account details...please wait');
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject('');

  dataSource: RolePlayerBankingListDataSource;
  currentQuery: any;

  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  bankingPurposes: BankingPurposeEnum[];
  bankAccountTypes: BankAccountTypeEnum[];

  selectedRolePlayerBankingDetail: RolePlayerBankingDetail;

  selectedBank: Bank;
  selectedBankBranch: BankBranch;

  requiredAddPermission = 'Add Address';

  isView = false;

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly lookupService: LookupService,
    private readonly formBuilder: FormBuilder,
    private readonly integrationService: IntegrationService,
    private readonly alertService: AlertService,
    private readonly memberService: MemberService,
    public dialog: MatDialog
  ) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new RolePlayerBankingListDataSource(this.rolePlayerService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    this.currentQuery = this.rolePlayer.rolePlayerId ? this.rolePlayer.rolePlayerId.toString() : 0;
    this.getData();
    this.getWizardData();
  }

  getLookups() {
    this.bankingPurposes = this.ToArray(BankingPurposeEnum);
    this.bankAccountTypes = this.ToArray(BankAccountTypeEnum);
    this.getBanks();
    this.getBankBranches();
  }

  getData() {
    if (!this.isWizard) {
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      this.refresh();
    }
  }

  refresh() {
    this.dataSource.refresh$.subscribe(result => {
      if (result && this.dataSource && this.dataSource.data) {
        this.rolePlayer.rolePlayerBankingDetails = this.dataSource.data.data;
        this.rolePlayerBankingSelectedEmit.emit(this.dataSource.data.data[0]);
      }
    });
  }

  getWizardData() {
    if (this.isWizard) {
      if (this.rolePlayer.rolePlayerBankingDetails) {
        this.dataSource.getWizardData(this.rolePlayer.rolePlayerBankingDetails, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      } else {
        this.dataSource.getWizardData([], this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      }
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getBanks(): void {
    this.lookupService.getBanksAnon().subscribe(
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
    this.lookupService.getBankBranchesAnon().subscribe(
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

  reset() {
    if (this.isView) {
      this.isView = !this.isView;
    }
    this.selectedRolePlayerBankingDetail = null;
  }

  getBankName(bankId: number): string {
    const bank = this.banks.find(b => b.id == +bankId);
    return bank ? bank.name : 'unknown';
  }

  getBank(branchId: number): Bank {
    const branch = this.branches.find(b => b.id == +branchId);
    return branch && branch.bank ? branch.bank : null;
  }

  getAccountType(accountTypeId: number): string {
    return this.formatText(BankAccountTypeEnum[accountTypeId]);
  }

  getBranch(bankId: number): string {
    if (this.branches && this.branches?.length > 0) {
      const index = this.branches.findIndex(s => s.bankId == bankId);
      if (index > -1) {
        return `${this.branches[index].bank.name} (${this.branches[index].code})`
      }
    }
    return ""//String.Empty;
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  add() {
    this.isLoading$.next(true);
    this.selectedRolePlayerBankingDetail = new RolePlayerBankingDetail();
    this.createForm();
  }

  edit($event: RolePlayerBankingDetail) {
    this.isLoading$.next(true);
    this.selectedRolePlayerBankingDetail = $event;
    this.createForm();
  }

  view($event: RolePlayerBankingDetail) {
    this.isLoading$.next(true);
    this.selectedRolePlayerBankingDetail = $event;
    this.isView = true;
    this.createForm();
  }

  selectedBankAccountChanged(rolePlayerBankingDetail: RolePlayerBankingDetail) {
    if (this.selectedRolePlayerBankingId && this.selectedRolePlayerBankingId == rolePlayerBankingDetail.rolePlayerBankingId) {
      this.selectedRolePlayerBankingId = null;
      this.rolePlayerBankingSelectedEmit.emit(null);

    } else {
      this.selectedRolePlayerBankingId = rolePlayerBankingDetail.rolePlayerBankingId;
      this.rolePlayerBankingSelectedEmit.emit(rolePlayerBankingDetail);
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'select', show: this.showSelectColumn || (this.selectedRolePlayerBankingId && this.selectedRolePlayerBankingId > 0) },
      { def: 'bank', show: true },
      { def: 'branch', show: true },
      { def: 'bankAccountType', show: true },
      { def: 'branchCode', show: true },
      { def: 'accountHolder', show: true },
      { def: 'accountNumber', show: true },
      { def: 'accountHolderIdNumber', show: true },
      { def: 'effectiveDate', show: true },
      { def: 'actions', show: true },
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  createForm(): void {
    if (this.showBankDetailsPurpose) {
      this.form = this.formBuilder.group({
        purpose: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        bank: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        bankBranch: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        effectiveDate: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        bankAccountType: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        accountNumber: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        name: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        branchCode: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        accountHolderIdNumber: [{ value: null, disabled: this.isReadOnly || this.isView }]
      });

    } else {
      this.form = this.formBuilder.group({
        bank: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        bankBranch: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        effectiveDate: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        bankAccountType: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        accountNumber: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        name: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        branchCode: [{ value: null, disabled: this.isReadOnly || this.isView }, Validators.required],
        accountHolderIdNumber: [{ value: null, disabled: this.isReadOnly || this.isView }]
      });
    }


    if (this.selectedRolePlayerBankingDetail.bankBranchId && this.selectedRolePlayerBankingDetail.bankBranchId > 0) {
      this.selectedBank = this.getBank(this.selectedRolePlayerBankingDetail.bankBranchId);
      this.selectedBankBranch = this.branches.find(s => s.id == this.selectedRolePlayerBankingDetail.bankBranchId);
      this.loadBranches(this.selectedBank.id);
    }

    this.setForm();
  }

  setForm() {
    if (this.showBankDetailsPurpose) {
      this.form.patchValue({
        purpose: this.selectedRolePlayerBankingDetail.purposeId ? BankingPurposeEnum[+this.selectedRolePlayerBankingDetail.purposeId] : null,
        bank: this.selectedBank ? this.selectedBank.id : null,
        bankBranch: this.selectedBankBranch ? this.selectedBankBranch : null,
        effectiveDate: this.selectedRolePlayerBankingDetail.effectiveDate ? this.selectedRolePlayerBankingDetail.effectiveDate : new Date(),
        bankAccountType: this.selectedRolePlayerBankingDetail.bankAccountType ? BankAccountTypeEnum[this.selectedRolePlayerBankingDetail.bankAccountType] : null,
        accountNumber: this.selectedRolePlayerBankingDetail.accountNumber ? this.selectedRolePlayerBankingDetail.accountNumber : null,
        name: this.selectedRolePlayerBankingDetail.accountHolderName ? this.selectedRolePlayerBankingDetail.accountHolderName : null,
        branchCode: this.selectedRolePlayerBankingDetail.branchCode ? this.selectedRolePlayerBankingDetail.branchCode : null,
        accountHolderIdNumber: this.selectedRolePlayerBankingDetail.accountHolderIdNumber ? this.selectedRolePlayerBankingDetail.accountHolderIdNumber : null
      });
    }
    else {
      this.form.patchValue({
        bank: this.selectedBank ? this.selectedBank.id : null,
        bankBranch: this.selectedBankBranch ? this.selectedBankBranch : null,
        effectiveDate: this.selectedRolePlayerBankingDetail.effectiveDate ? this.selectedRolePlayerBankingDetail.effectiveDate : new Date(),
        bankAccountType: this.selectedRolePlayerBankingDetail.bankAccountType ? BankAccountTypeEnum[this.selectedRolePlayerBankingDetail.bankAccountType] : null,
        accountNumber: this.selectedRolePlayerBankingDetail.accountNumber ? this.selectedRolePlayerBankingDetail.accountNumber : null,
        name: this.selectedRolePlayerBankingDetail.accountHolderName ? this.selectedRolePlayerBankingDetail.accountHolderName : null,
        branchCode: this.selectedRolePlayerBankingDetail.branchCode ? this.selectedRolePlayerBankingDetail.branchCode : null
      });
    }

    this.isLoading$.next(false);
  }

  readForm() {
    this.selectedRolePlayerBankingDetail = this.selectedRolePlayerBankingDetail ? this.selectedRolePlayerBankingDetail : new RolePlayerBankingDetail();
    this.selectedRolePlayerBankingDetail.rolePlayerId = 0;
    if (this.showBankDetailsPurpose) {
      this.selectedRolePlayerBankingDetail.purposeId = +BankingPurposeEnum[this.form.controls.purpose.value];
    }
    else {
      this.selectedRolePlayerBankingDetail.purposeId = +BankingPurposeEnum.payments;
    }
    this.selectedRolePlayerBankingDetail.bankId = +this.form.controls.bank.value;
    this.selectedRolePlayerBankingDetail.effectiveDate = this.form.controls.effectiveDate.value;
    this.selectedRolePlayerBankingDetail.accountNumber = this.form.controls.accountNumber.value;
    this.selectedRolePlayerBankingDetail.bankBranchId = +this.form.controls.bankBranch.value.id;
    this.selectedRolePlayerBankingDetail.bankAccountType = +BankAccountTypeEnum[this.form.controls.bankAccountType.value];
    this.selectedRolePlayerBankingDetail.accountHolderName = this.form.controls.name.value;
    this.selectedRolePlayerBankingDetail.branchCode = this.form.controls.branchCode.value;
    this.selectedRolePlayerBankingDetail.accountHolderIdNumber = this.form.controls.accountHolderIdNumber.value;

    const index = this.rolePlayer?.rolePlayerBankingDetails?.findIndex(s => s?.rolePlayerBankingId == this.selectedRolePlayerBankingDetail?.rolePlayerBankingId);
    if (index > -1 && !isNullOrUndefined(this.rolePlayer?.rolePlayerBankingDetails)) {

      this.rolePlayer.rolePlayerBankingDetails[index] = this.selectedRolePlayerBankingDetail;
    } else {
      if(isNullOrUndefined(this.rolePlayer?.rolePlayerBankingDetails)){
        this.rolePlayer.rolePlayerBankingDetails = [];
      }
      this.rolePlayer.rolePlayerBankingDetails.push(this.selectedRolePlayerBankingDetail);
    }
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessages$.next('saving bank account details...please wait');
    this.readForm();
    this.commit();
  }

  commit() {
    this.dataSource.getWizardData(this.rolePlayer.rolePlayerBankingDetails, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    this.rolePlayerBankingSelectedEmit.emit(this.selectedRolePlayerBankingDetail);
    this.rolePlayerBankingEditedEmit.emit(true);
    this.isLoading$.next(false);
    this.reset();
  }

  loadBranches(bankId: number) {
    this.filteredBranches = this.branches.filter(b => b.bankId == bankId);

    this.form.controls.bankBranch.reset();
    this.form.controls.branchCode.reset();
  }

  loadBranchCode(branch: BankBranch): void {
    this.form.controls.branchCode.setValue(branch.code);
  }

  verifyBankAccount(account: RolePlayerBankingDetail): void {
    this.loadingMessages$.next('verifying bank account...please wait');

    this.memberService.getMember(this.selectedRolePlayerBankingDetail.rolePlayerId).subscribe(result => {
      let idNumber: string;
      if (result.company) {
        idNumber = this.isValidIdNumber(result.company.idNumber) ? result.company.idNumber : '0';
      } else if (result.person) {
        idNumber = this.isValidIdNumber(result.person.idNumber) ? result.person.idNumber : '0';
      }
      else if (result.healthCareProvider) {
        const accountIdNumber = this.form.controls.accountHolderIdNumber.value;
        idNumber = !isNullOrUndefined(accountIdNumber) ? accountIdNumber : '0';
      }
      else {
        idNumber = this.isValidIdNumber(this.rolePlayer?.person?.idNumber) ? this.rolePlayer.person.idNumber : '0';
      }

      this.integrationService.verifyBankAccount(account.accountNumber,
        account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
        account.accountHolderName, idNumber)
        .subscribe(
          data => {
            if (data.success) {
              this.alertService.success('account has been verified');
              this.commit();
            } else {
              this.errorMessage$.next(`account verification error: ${data.errmsg}`)
              this.isLoading$.next(false);
            }
          });
    });
  }

  isValidIdNumber(idnumber: string) {
    //to-do find a way to validate saId /passport /companyid
    return false;
  }
}
