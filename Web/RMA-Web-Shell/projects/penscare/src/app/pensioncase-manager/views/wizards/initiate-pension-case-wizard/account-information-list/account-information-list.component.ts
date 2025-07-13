import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerBankingDetailsComponent } from 'projects/shared-components-lib/src/lib/roleplayer-banking/role-player-banking-details/role-player-banking-details.component';

class ComponentData {
  public model: InitiatePensionCaseData;
}

@Component({
  selector: 'app-account-information-list',
  templateUrl: './account-information-list.component.html',
  styleUrls: ['./../account-information/account-information.component.css',
    './account-information-list.component.css']
})
export class AccountInformationListComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {
  recipientsAccountInfoDataSource: RolePlayerBankingDetail[] = [];
  canEdit = true;
  viewMode = false;
  @Input() pensionCaseContext: PensionCaseContextEnum;

  banks: Lookup[];
  bankAccountTypes: Lookup[];
  branches: BankBranch[];
  selectBankingDetail: RolePlayerBankingDetail;

  emitChangeSubscription: any;
  viewAccountInfo: boolean = false;
  recipientAccountslList: any[];
  menus: { title: string, action: string, disable: boolean }[];
  accountsInfoMenus: { title: string, action: string, disable: boolean }[];
  recipientsDisplayedColumns = ['name', 'surname', 'actions'];
  accountsDisplayedColumns = ['bankName', 'accountType', 'accountNumber', 'bankBranchName', 'preferred'];
  form: any;
  lookupsLoaded: boolean;
  formCreated: boolean;
  isLoading: boolean;
  lookUpSubscription: any;
  isSaved: boolean;

  rolePlayer: RolePlayer;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private pensCareService: PensCareService,
    private readonly _rolePlayerService: RolePlayerService,
    public dialog: MatDialog,
    private wizardService: WizardService,
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder,) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  ngOnInit() {
    this.createForm();
    this.setPermissions();
  }

  setPermissions(): void {
    this.canEdit = userUtility.hasPermission('Edit Pension Case') &&
      this.pensionCaseContext !== PensionCaseContextEnum.Manage;
  }

  onLoadLookups(): void {
    this.isLoading = true;
    let bankAccountTypes = this.lookupService.getBankAccountTypes();
    let banks = this.lookupService.getBanks();
    let branches = this.lookupService.getBankBranches();

    this.lookUpSubscription = forkJoin([
      bankAccountTypes,
      banks,
      branches
    ]).subscribe(
      responseList => {
        this.isLoading = false;
        this.bankAccountTypes = responseList[0] as Lookup[];
        this.banks = responseList[1] as Lookup[];
        this.branches = responseList[2] as BankBranch[];
        this.lookupsLoaded = true;
      }
    );
  }

  populateModel(): void {
    this.model.bankingDetails = this.recipientsAccountInfoDataSource.map(data => {
      const bank = this.banks.find(bank => bank.id === data.bankId);
      if (bank) {
        data.bankName = bank.name;
      }
      return data;
    });
  }

  populateForm(): void {
    if (this.model && this.model['bankingDetails']) {
      if (this.model.recipients) {
        this.recipientsAccountInfoDataSource = this.model.recipients.map(recipient => {
          const existingBankingDetail = this.model.bankingDetails.find(bankingDetail => recipient.idNumber === bankingDetail.idNumber);
          if (existingBankingDetail !== undefined) {
            return existingBankingDetail
          } else {
            return this.generateEmptyBankingDetails(recipient)
          }
        })
      } else {
        this.recipientsAccountInfoDataSource = this.model.bankingDetails;
      }

    } else {
      this.recipientsAccountInfoDataSource = this.model.recipients.map(recipient => {
        return this.generateEmptyBankingDetails(recipient)
      })
    }
  }

  generateEmptyBankingDetails(recipient: Person): RolePlayerBankingDetail {
    return {
      bankId: 0,
      bankBranchId: 0,
      branchCode: '',
      accountHolder: `${recipient.firstName} ${recipient.surname}`,
      accountNumber: '',
      effectiveDate: new Date(),
      idNumber: recipient.idNumber,
      accountHolderName: recipient.firstName,
      accountHolderSurname: recipient.surname,
      bankName: ''
    } as unknown as RolePlayerBankingDetail
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
    });
  }

  filterMenu(item: Person) {
    this.menus = null;
    this.menus =
      [
        { title: 'Edit', action: 'edit', disable: !this.canEdit },
        { title: 'View', action: 'view', disable: false }
      ];
  }

  onMenuItemClick(rolePlayerBankingDetail: RolePlayerBankingDetail, menu: any): void {
    this.isLoading = true;
    if (rolePlayerBankingDetail.idNumber) {
      this._rolePlayerService.getRolePlayerByIdNumber(rolePlayerBankingDetail.idNumber).subscribe(result => {
        this.rolePlayer = result[0];
        const bankingDetails = this.rolePlayer?.rolePlayerBankingDetails.find(x => x.rolePlayerBankingId == rolePlayerBankingDetail.bankId);
        this.isLoading = false;
        if (bankingDetails) {
          this.showBankingDetailDialog(bankingDetails, menu.action === 'view');
        }
        else {
          this.manageBankingDetails(rolePlayerBankingDetail, menu.action);
        }
      });
    }
    else if (rolePlayerBankingDetail.rolePlayerId) {
      this._rolePlayerService.getRolePlayer(rolePlayerBankingDetail.rolePlayerId).subscribe((res) => {
        this.rolePlayer = res;
        const bankingDetails = this.rolePlayer?.rolePlayerBankingDetails.find(x => x.rolePlayerBankingId == rolePlayerBankingDetail.bankId);
        this.isLoading = false;
        if (bankingDetails) {
          this.showBankingDetailDialog(bankingDetails, menu.action === 'view');
        }
        else {
          this.manageBankingDetails(rolePlayerBankingDetail, menu.action);
        }
      })
    }
  }

  showBankingDetailDialog(row: RolePlayerBankingDetail, isReadOnly: boolean) {
    const dialogRef = this.dialog.open(RolePlayerBankingDetailsComponent, {
      width: 'auto',
      data: {
        bankAccount: row,
        isReadOnly: isReadOnly,
        isWizard: false,
        rolePlayer: this.rolePlayer,
        banks: this.banks,
        branches: this.branches,
        verifyAccount: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          row = result;
      }
    });
  }

  manageBankingDetails(rolePlayerBankingDetail: RolePlayerBankingDetail, action: string) {
    this.form = this.formBuilder.group({
      idNumber: new UntypedFormControl({ value: '', disabled: action === 'view' }, [Validators.required]),
      bankId: new UntypedFormControl({ value: '', disabled: action === 'view' }),
      bankBranchId: new UntypedFormControl({ value: '', disabled: action === 'view' }),
      accountType: new UntypedFormControl({ value: '', disabled: action === 'view' }, [Validators.required]),
      branchCode: new UntypedFormControl({ value: '', disabled: action === 'view' }, [Validators.required]),
      accountHolder: new UntypedFormControl({ value: '', disabled: true }),
      accountNumber: new UntypedFormControl({ value: '', disabled: action === 'view' }, [Validators.required]),
      effectiveDate: new UntypedFormControl({ value: '', disabled: action === 'view' }),
      rolePlayerId: new UntypedFormControl({ value: '', disabled: action === 'view' }),
      accountHolderName: new UntypedFormControl({ value: '', disabled: true }),
      accountHolderSurname: new UntypedFormControl({ value: '', disabled: true })
    });
    this.formCreated = true;

    this.viewMode = action === 'view'

    this.form.patchValue(rolePlayerBankingDetail)

    this.viewAccountInfo = true;
  }

  onCancelForm() {
    this.viewAccountInfo = false;
  }

  onSaveBankingDetail(form: UntypedFormGroup) {
    const selectedBank = {
      bankId: form.controls['bankId'].value,
      bankBranchId: form.controls['bankBranchId'].value,
      branchCode: form.controls['branchCode'].value,
      accountHolder: form.controls['accountHolder'].value,
      accountNumber: form.controls['accountNumber'].value,
      effectiveDate: form.controls['effectiveDate'].value,
      idNumber: form.controls['idNumber'].value,
      accountHolderName: form.controls['accountHolderName'].value,
      accountHolderSurname: form.controls['accountHolderSurname'].value,
      bankName: this.banks.find(bank => bank.id === form.controls['bankId'].value).name,
      accountType: form.controls['accountType'].value,
    } as unknown as RolePlayerBankingDetail

    this.model.bankingDetails = this.recipientsAccountInfoDataSource.map(bankingDetail => {
      if (bankingDetail.idNumber === selectedBank.idNumber) {
        return selectedBank;
      } else {
        return bankingDetail;
      }
    })

    this.recipientsAccountInfoDataSource = this.model.bankingDetails;

    const saveWizardRequest = this.context.createSaveWizardRequest();
    saveWizardRequest.data = JSON.stringify([this.model])
    this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
    this.viewAccountInfo = false;
  }

  ngOnDestroy() {
    if (this.emitChangeSubscription) {
      this.emitChangeSubscription.unsubscribe();
    }

    this.lookUpSubscription.unsubscribe();
  }

}
