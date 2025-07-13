import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BankAccount } from 'projects/clientcare/src/app/client-manager/shared/Entities/bank-account';
import { Bank } from 'projects/clientcare/src/app/client-manager/shared/Entities/bank';
import { BankService } from 'projects/clientcare/src/app/client-manager/shared/services/bank.service';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';
import { BankBranch } from 'projects/clientcare/src/app/client-manager/shared/Entities/bank-branch';
import { ActionParameters } from 'projects/clientcare/src/app/client-manager/shared/Entities/action-parameters';
import { PaymentMethodService } from 'projects/clientcare/src/app/client-manager/shared/services/payment-method.service';
import { PaymentMethod } from 'projects/clientcare/src/app/client-manager/shared/Entities/payment-method';
import { BankAccountTypeService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account-type.service';
import { BankAccountType } from 'projects/clientcare/src/app/client-manager/shared/Entities/bank-account-type';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { ItemType } from 'projects/clientcare/src/app/policy-manager/shared/enums/item-type';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';


@Component({
  templateUrl: './bank-account-details.component.html'
})
export class BankAccountDetailsComponent extends DetailsComponent implements OnInit {
  actionParameters: ActionParameters;
  bankAccountTypes: BankAccountType[];
  paymentMethods: PaymentMethod[];
  bankingBranches: BankBranch[];
  beneficiaryTypes: Lookup[];
  banks: Bank[];
  serviceTypeLookups: Lookup[];
  itemType = '';
  itemId = 0;
  currentAccount = '';
  universalBranchCode = '';
  serviceTypes: number[] = [];
  selectedServiceTypes: number[];
  isIndividualClient = false;
  selectedBeneficiaryType: number;
  paymentMethodId: number;
  accountTypeId: number;
  bankId: number;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly activatedRoute: ActivatedRoute,
    private readonly lookUpService: LookupService,
    private readonly clientService: ClientService,
    private readonly bankService: BankService,
    private readonly bankAccountService: BankAccountService,
    private readonly bankAccountTypeService: BankAccountTypeService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly location: Location
  ) {
    super(appEventsManager, alertService, router, 'Bank Account', '', 1);
    this.resetPermissions();
    this.checkUserPermissions();
  }

  ngOnInit() {
    this.getBanks();
    this.getPaymentMethods();
    this.getBankAccountTypes();
    this.loadServiceTypes();
    this.getBeneficiaryTypes();

    this.createForm();
    if (this.isWizard) {
      return;
    }

    this.activatedRoute.params.subscribe((params: any) => {
      this.actionParameters =
        new ActionParameters(params.selectedId, params.action, params.linkId, params.linkType);

      this.itemType = params.linkType;
      this.itemId = params.linkId;

      if (params.action === 'add') {
        this.loadingStart('Setting up bank account details...');
        this.checkIfIndividual();
        this.loadNewAccount();
      } else if (params.action === 'edit') {
        this.loadingStart('Loading bank account details...');
        this.loadEditAccount(params);
        this.checkIfIndividual();
        this.form.disable();
      } else {
        throw new Error(`Incorrect action was specified '${params.action}', expected was: add or edit`);
      }
    });
  }

  checkUserPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Bank Account');
    this.canEdit = userUtility.hasPermission('Edit Bank Account');
  }

  checkIfIndividual(): void {
    if (this.itemType.toLowerCase() === 'client') {
      this.clientService.getClient(this.itemId).subscribe(client => {
        this.isIndividualClient = client.clientTypeId === ClientTypeEnum.Individual;
      });
    }
  }

  loadNewAccount(): any {
    const bankAccount = this.getNewBankAccount();
    this.setForm(bankAccount);
    this.canAdd = true;
  }

  loadServiceTypes(): any {
    this.lookUpService.getBankAccountServiceTypes().subscribe(serviceTypes => {
      this.serviceTypeLookups = serviceTypes;
    });
  }

  getNewBankAccount(): any {
    const bankAccount = new BankAccount();
    bankAccount.id = 0;
    bankAccount.accountHolderName = '';
    bankAccount.accountNumber = '';
    bankAccount.paymentMethodId = 0;
    bankAccount.bankAccountTypeId = 0;
    bankAccount.universalBranchCode = '';
    bankAccount.beneficiaryTypeId = null;
    return bankAccount;
  }

  loadEditAccount(params: any): any {
    this.bankAccountService.getBankAccount(params.selectedId).subscribe(
      bankAccount => {
        this.currentAccount = bankAccount.accountNumber.toLowerCase();
        this.setForm(bankAccount);
        this.getNotes(bankAccount.id, ServiceTypeEnum.ClientManager, 'BankAccount');
        this.getAuditDetails(bankAccount.id, ServiceTypeEnum.ClientManager, ItemType.BankAccount);
      }
    );
  }


  getServiceTypes(serviceTypes: string): number[] {
    if (!serviceTypes) { return null; }
    const values = serviceTypes.split(',');
    // tslint:disable-next-line: radix
    return values.map(s => parseInt(s));
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      id: 0,
      bank: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      accountHolderName: new UntypedFormControl('', [Validators.required]),
      accountNumber: new UntypedFormControl('', [Validators.required]),
      paymentMethod: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      accountType: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      universalBranchCode: new UntypedFormControl({ value: '', disabled: true }),
      validateAccount: new UntypedFormControl(''),
      beneficiaryType: new UntypedFormControl('')
    });
  }

  setForm(bankAccount: BankAccount) {
    if (!this.form) {
      this.createForm();
    }
    this.form.patchValue({
      id: bankAccount.id ? bankAccount.id : 0,
      bank: bankAccount.bankId ? bankAccount.bankId : 0,
      accountHolderName: bankAccount.accountHolderName ? bankAccount.accountHolderName : '',
      accountNumber: bankAccount.accountNumber ? bankAccount.accountNumber : '',
      paymentMethod: bankAccount.paymentMethodId ? bankAccount.paymentMethodId : 0,
      accountType: bankAccount.bankAccountTypeId ? bankAccount.bankAccountTypeId : 0,
      universalBranchCode: bankAccount.universalBranchCode ? bankAccount.universalBranchCode : '',
      validateAccount: false,
      beneficiaryType: bankAccount.beneficiaryTypeId
    });

    this.selectedServiceTypes = bankAccount.bankAccountServiceTypeIds;

    this.loadingStop();
  }

  readForm(): BankAccount {
    const formModel = this.form.getRawValue();
    const bankAccount = new BankAccount();
    bankAccount.id = formModel.id as number;
    bankAccount.bankId = formModel.bank as number;
    bankAccount.accountHolderName = formModel.accountHolderName as string;
    bankAccount.accountNumber = formModel.accountNumber as string;
    bankAccount.paymentMethodId = formModel.paymentMethod as number;
    bankAccount.bankAccountTypeId = formModel.accountType as number;
    bankAccount.universalBranchCode = formModel.universalBranchCode;
    bankAccount.itemType = this.itemType;
    bankAccount.itemId = this.itemId;
    bankAccount.verifyBankAccount = formModel.validateAccount as boolean;
    bankAccount.bankAccountServiceTypeIds = [1, 2]; // this.getServiceTypes(this.getSelectedServiceTypes());
    bankAccount.beneficiaryTypeId = formModel.beneficiaryType;
    return bankAccount;
  }

  getBanks(): void {
    this.bankService.getBanks().subscribe(
      banks => {
        this.banks = banks;
      }
    );
  }

  getPaymentMethods(): void {
    this.paymentMethodService.getPaymentMethods().subscribe(
      methods => {
        this.paymentMethods = methods;
      }
    );
  }

  getBankAccountTypes(): void {
    this.bankAccountTypeService.getBankAccountTypes().subscribe(
      types => {
        this.bankAccountTypes = types;
      }
    );
  }

  bankChange(item: any): void {
    const account = this.banks.find(bank => bank.id === item.value);
    this.universalBranchCode = account.universalBranchCode;
    this.form.patchValue({ universalBranchCode: account.universalBranchCode });
  }

  save(): void {
    if (!this.form.valid) { return; }
    this.form.disable();
    const bankAccount = this.readForm();
    this.loadingStart(`Saving bank account with account number ${bankAccount.accountNumber}...`);
    if (bankAccount.id > 0) {
      this.editBankAccount(bankAccount);
    } else {
      this.addBankAccount(bankAccount);
    }
  }

  edit(): void {
    this.submittedCount = 0;
    this.form.enable();
    this.form.controls.universalBranchCode.disable();
    this.setCurrentValues();
  }

  setCurrentValues(): void {
    this.currentAccount = this.form.value.accountNumber.toLowerCase();
  }

  editBankAccount(bankAccount: BankAccount): void {
    this.bankAccountService.editBankAccount(bankAccount)
      .subscribe(() => this.editDone());
  }

  addBankAccount(bankAccount: BankAccount): void {
    this.bankAccountService.addBankAccount(bankAccount)
      .subscribe(() => this.addDone());
  }

  editDone(): void {
    this.appEventsManager.loadingStop();
    this.alertService.success(`Bank account has been updated successfully`, 'Bank account', true);
    this.back();
  }

  addDone(): void {
    this.appEventsManager.loadingStop();
    this.alertService.success(`Bank account has been added successfully`, 'Bank account', true);
    this.back();
  }

  back(): void {
    switch (this.itemType.toLowerCase()) {
      case 'group':
        this.router.navigate([`clientcare/client-manager/group-details/${this.itemId}`]);
        break;
      default:
        this.router.navigate([`clientcare/client-manager/client-details/${this.actionParameters.linkId}/2`]);
        break;
    }
  }

  getSelectedServiceTypes(): string {
    let serviceTypes: number[];
    if (this.isWizard) {
      serviceTypes = this.serviceTypeLookups.map(lookup => lookup.id);
      return serviceTypes.toString();
    } else {
      const serviceTypeLookup = this.getLookupControl('BankAccountServiceType');
      serviceTypes = serviceTypeLookup.getSelectedItems();
    }
    return serviceTypes.toString();
  }

  onAccountServicesChanged(): void {
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  getBeneficiaryTypes(): any {
    this.lookUpService.getBeneficiaryTypes().subscribe(result => {
      this.beneficiaryTypes = result;
    });
  }
  goBack() {
    this.location.back();
  }
}
