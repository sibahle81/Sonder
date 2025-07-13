import { Component, OnInit, Input } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { BankAccountDetailsComponent } from 'projects/clientcare/src/app/client-manager/views/bank-account-details/bank-account-details.component';
import { WizardComponentInterface } from '../../../../../../shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { BankAccount } from 'projects/clientcare/src/app/client-manager/shared/Entities/bank-account';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { BankService } from 'projects/clientcare/src/app/client-manager/shared/services/bank.service';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';
import { BankBranchService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-branch.service';
import { BranchService } from 'projects/clientcare/src/app/client-manager/shared/services/branch.service';
import { DepartmentService } from 'projects/clientcare/src/app/client-manager/shared/services/department.service';
import { BankAccountTypeService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account-type.service';
import { PaymentMethodService } from 'projects/clientcare/src/app/client-manager/shared/services/payment-method.service';
import { GroupService } from 'projects/clientcare/src/app/client-manager/shared/services/group.service';
import { WizardContext } from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from '../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';

@Component({
    templateUrl: './bank-wizard.component.html',
    providers: [DatePipe]
})
export class BankAccountWizardComponent extends BankAccountDetailsComponent implements WizardComponentInterface, OnInit {
    @Input()
    step: string;
    @Input()
    firstName: string;
    singleDataModel = false;

    @Input()
    displayName: string;
    isLoadingBanks = true;
    loadCount = 0;
    numberOfAdditionalBankDetails = 2;
    availableBankAccounts: BankAccount[] = new Array();
    allowEnable = true;
    constructor(
        authService: AuthService,
        formBuilder: FormBuilder,
        router: Router,
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        lookUpService: LookupService,
        clientService: ClientService,
        bankService: BankService,
        bankAccountService: BankAccountService,
        bankAccountTypeService: BankAccountTypeService,
        paymentMethodService: PaymentMethodService,
        private readonly bankAccountServicePrivate: BankAccountService,
        location: Location) {
        super(formBuilder, router, alertService, appEventsManager, activatedRoute, lookUpService, authService, clientService, bankService, bankAccountService, bankAccountTypeService, paymentMethodService, location);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.ensureControls();
    }

    wizardReadFormData(context: WizardContext): any {
        const bankDetail = this.readForm();
        bankDetail.verifyBankAccount = false;
        return bankDetail;
    }

    wizardPopulateForm(context: WizardContext) {
        if (context.currentData) {
            const bankAccount = context.currentData as BankAccount;
            this.setForm(bankAccount);
        } else {
            this.createForm();
        }
        this.getAdditionalBankingDetails(context);
        this.ensureControls();
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.wizardPopulateForm(context);
        this.setForm(context.currentData);
        return this.getFormValidationResult(this.displayName);
    }

    enable(): void {
        this.form.enable();
    }

    disable(): void {
        this.form.disable();
        this.allowEnable = false;
    }

    selectBankAccount(id: number) {
        const bankAccount = this.availableBankAccounts.find(bank => bank.id === id);
        if (bankAccount) {
            this.setForm(bankAccount);
            this.form.disable();
            if (this.allowEnable) {
                this.form.get('bankSelection').enable();
            }
        } else {
            if (this.allowEnable) {
                this.form.enable();
            }
            this.form.get('universalBranchCode').disable();
        }
    }

    getAdditionalBankingDetails(context: WizardContext): any {
        this.isLoadingBanks = true;
        this.availableBankAccounts = new Array();
        const client = context.getDataByName('ClientWizardComponent') as Client;
        this.getBankAccountByType('Group', client.groupId);
        this.getAdditionalLeadsBankAccounts(client.leadClientId);
        this.addBeneficiaryControl(client, context);
    }


    getAdditionalLeadsBankAccounts(leadClientId: number): void {
        if (leadClientId > 0) {
            this.bankAccountServicePrivate.getBankAccountsByTypeFromLeads('Client', leadClientId).subscribe(bankAccounts => {
                bankAccounts.forEach(bankAccount => {
                    bankAccount.id = 0; //need to remove id for new insertion into policy side.
                    this.availableBankAccounts.push(bankAccount);
                });
                this.doneLoading();
                });
            } else {
                this.doneLoading();
            }
        }

    getBankAccountByType(type: string, id: number): void {
        if (id > 0) {
            this.bankAccountServicePrivate.getBankAccountByType(type, id).subscribe(bankAccounts => {
                bankAccounts.forEach(bankAccount => {
                    this.availableBankAccounts.push(bankAccount);
                });
                this.doneLoading();
            });
        } else {
            this.doneLoading();
        }
    }


    doneLoading(): void {
        this.loadCount++;
        if (this.loadCount === this.numberOfAdditionalBankDetails) {
            this.isLoadingBanks = false;
            this.loadCount = 0;
            this.selectBankAccount(this.form.get('id').value);
        } else {
            this.isLoadingBanks = true;
        }
    }

    ensureControls(): void {
        if (this.form) {
            if (!this.form.get('bankSelection')) {
                this.form.addControl('bankSelection', new FormControl('0', Validators.required));
                }
        }
    }

    addBeneficiaryControl(client: Client, context: WizardContext): void {
        if (client.clientTypeId === ClientTypeEnum.Individual) {
            this.isIndividualClient = true;
            if (!this.form.get('beneficiaryType')) {
                this.form.get('beneficiaryType').setValidators([Validators.required]);
                this.form.patchValue({ beneficiaryType: this.selectedBeneficiaryType });
            }
        } else {
            this.isIndividualClient = false;
            if (this.form.get('beneficiaryType')) {
                this.form.get('beneficiaryType').clearValidators();
            }
        }
    }

}
