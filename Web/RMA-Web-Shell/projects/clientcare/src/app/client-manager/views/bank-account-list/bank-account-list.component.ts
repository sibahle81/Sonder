import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { BankAccountListDataSource } from './bank-account-list.datasource';
import { BankAccount } from 'projects/clientcare/src/app/client-manager/shared/Entities/bank-account';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';


@Component({
    templateUrl: './bank-account-list.component.html',

    selector: 'bank-account-list'
})
export class BankAccountListComponent extends ListFilteredComponent implements OnInit {
    canAdd: boolean;
    isAddBankingDetail: boolean;
    selectedBankDetail: boolean;
    canModifyBankAccount = true;
    canAddBankingDetail = true;

    cancelUnlink: boolean;
    isUnlink: boolean;
    unlink: boolean;
    invalid: boolean;
    isSaveBank: boolean;
    confirmUnlink: boolean;

    isModifyBankAccount: boolean;

    showAddBankAccount = false;
    showLinkBankAccount = false;
    showUnlinkBankAccount = false;
    isModifying = false;
    enableSave: boolean;

    clientId: number;
    selectedBankAccount: any;
    banksData: BankAccount[];

    bankName: string;
    bankOption: string;
    unlinkName: string;
    @Input() itemType: string;
    @Input() itemId: number;
    linkedClientName: string;
    bankAccountOption: string;
    selectedItemId: number;
    showAdd: boolean;

    get isLoading(): boolean { return this.bankAccountDataSource.isLoading; }

    get clients(): Client[] {
        if (!this.bankAccountDataSource.clients) { return []; }
        return this.bankAccountDataSource.clients;
    }


    get bankAccounts(): BankAccount[] {
        this.bankName = this.bankAccountDataSource.bankName;
        return this.bankAccountDataSource.bankAccounts;
    }

    get hasBankAccounts(): boolean {
        return this.bankAccountDataSource.data.length > 0;
    }


    constructor(
        private readonly alertService: AlertService,
        private readonly appEventsManager: AppEventsManager,
        private readonly privateRouter: Router,
        private readonly location: Location,
        private readonly bankAccountDataSource: BankAccountListDataSource,
        private readonly bankAccountService: BankAccountService
        ) {

        super(privateRouter, bankAccountDataSource, '', 'bankAccountDetails', 'BankAccount');
        this.isAddBankingDetail = false;
        this.enableSave = false;
        this.invalid = false;
        this.isSaveBank = false;
        this.showActionsLink = true;
    }

    ngOnInit(): void {
        this.checkUserAddPermission();
        super.ngOnInit();
    }

    clearData(): void {
        this.bankAccountDataSource.clearData();
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Bank Account');
    }

    getData(data: any): void {
        this.bankAccountDataSource.getData(data);
    }

    onSelect(item: BankAccount): void {
        this.clientId = item.clientId;
        const url = [
            'clientcare/client-manager/bank-account-details/edit',
            item.itemId,
            item.itemType,
            item.id
        ];
        this.privateRouter.navigate(url);
    }

    modifyAddBankAccount(): void {
        if (this.itemId > 0) {
            const url = [
                'clientcare/client-manager/bank-account-details/add',
                this.itemId,
                this.itemType
            ];
            this.privateRouter.navigate(url);
        } else {
            this.alertService.error('Selected item could not be found.');
        }
    }


    unlinkClickBank(item: BankAccount): void {
        this.isSaveBank = true;
        this.bankAccountOption = 'unlink';
        this.selectedBankAccount = item;
        this.isUnlink = true;

        switch (item.itemType.toLowerCase()) {
        default:
            this.bankOption = this.itemType;
            this.selectedItemId = this.itemId;
        }
    }

    onUnlinkBankAccount(): void {
        this.unlinkClientBankAccounts(this.selectedBankAccount);
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'itemType', header: 'Type', cell: (row: BankAccount) => `${row.itemType}` },
            // { columnDefinition: 'linkedClientName', header: 'Name', cell: (row: BankAccount) => `${row.accountName}` },
            { columnDefinition: 'bankName', header: 'Bank Name', cell: (row: BankAccount) => `${row.bankName}` },
            {
                columnDefinition: 'accountNumber',
                header: 'Account Number',
                cell: (row: BankAccount) => `${row.accountNumber}`
            },
            {
                columnDefinition: 'bankAccountServiceTypes',
                header: 'Service Types',
                cell: (row: BankAccount) => `${row.bankAccountServiceTypes}`
            }
        ];
    }

    addBankAccount(): void {
        this.cancelAction();
        this.isModifying = true;
        this.showAddBankAccount = true;
        this.bankAccountOption = 'add';
    }

    linkBankAccount(): void {
        this.cancelAction();
        this.isModifying = true;
        this.showLinkBankAccount = true;
        this.bankAccountOption = 'link';
    }

    unlinkBankAccount(item: BankAccount): void {
        this.showUnlinkBankAccount = true;
        this.bankAccountOption = 'unlink';

        this.isUnlink = true;
        this.selectedBankAccount = item;

        switch (item.itemType.toLowerCase()) {
        case 'group':
            this.bankOption = 'Group';
            break;
        default:
                this.bankOption = 'Client';
                break;
        }
    }

    cancelAction(): void {
        this.enableSave = false;
        this.isModifying = false;
        this.showAddBankAccount = false;
        this.showLinkBankAccount = false;
        this.showUnlinkBankAccount = false;
        this.selectedBankAccount = null;
        this.bankAccountOption = '';
        this.itemType = '';
    }

    modifyLinkBankAccount(): void {
        const serviceTypeLookup = this.getLookupControl('BankAccountServiceType');
        const serviceTypeIds = serviceTypeLookup.getSelectedItems();

        this.selectedBankAccount.itemType = this.itemType;
        this.selectedBankAccount.itemId = this.selectedItemId;

        this.linkClientBankAccounts(this.selectedBankAccount,
            this.itemType,
            this.getItemTypeName(this.itemType),
            this.bankName);
    }

    linkClientBankAccounts(bankAccount: BankAccount, itemType: string, itemTypeName: string, bankName: string): void {
        this.appEventsManager.loadingStart(`Linking ${itemType.toLowerCase()} ${itemTypeName} to bank ${bankName}`);

        this.bankAccountService.editBankAccount(bankAccount).subscribe(
            () => {
                this.linkBankDone(itemType, itemTypeName, bankName);
            }
        );
    }

    unlinkClientBankAccounts(bankAccount: BankAccount): void {
        this.appEventsManager.loadingStart(`Unlinking bank account ${bankAccount.accountNumber}`);
        bankAccount.bankAccountServiceTypeIds = [];
        bankAccount.itemId = this.itemId;
        bankAccount.itemType = 'Client';
        this.bankAccountService.editBankAccount(this.selectedBankAccount).subscribe(
            () => {
                this.unlinkBankDone(bankAccount.accountNumber);
            }
        );
    }

    getItemTypeName(itemType: string): string {
        switch (itemType.toLowerCase()) {
        case 'group':
            return 'Group';
        case 'client':
            return this.itemType;
        default:
            return 'Unknown';
        }
    }

    linkBankDone(type: string, itemName: string, bank: string): void {
        this.alertService.success(`${type} ${itemName} linked to bank ${bank}`);
        this.linkedDone();
    }

    unlinkBankDone(account: string): void {
        this.alertService.success(`Account ${account} has been unlinked successfully.`);
        this.linkedDone();
    }

    linkedDone(): void {
        const array = new Array();
        array.push(this.itemId);
        array.push(this.itemType);
        this.appEventsManager.loadingStop();
        this.cancelAction();
        this.getData(array);
    }

    back(): void {
        this.location.back();
    }

    cancelUnlinkBank(): void {
        this.cancelAction();
    }

    cancellinkBank(): void {
        this.cancelAction();
    }
}
