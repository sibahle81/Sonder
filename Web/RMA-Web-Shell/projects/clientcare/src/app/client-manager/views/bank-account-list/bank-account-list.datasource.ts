import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { BankAccountService } from '../../shared/services/bank-account.service';
import { BankAccount } from '../../shared/Entities/bank-account';
import { Client } from '../../shared/Entities/client';
import { Bank } from '../../shared/Entities/bank';
import { Branch } from '../../shared/Entities/branch';

import { BranchService } from '../../shared/services/branch.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BankService } from '../../shared/services/bank.service';
import { DepartmentService } from '../../shared/services/department.service';
import { Department } from '../../shared/Entities/department';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ClientService } from '../../shared/services/client.service';
import { BankAccountTypeService } from '../../shared/services/bank-account-type.service';
import { BankAccountType } from '../../shared/Entities/bank-account-type';
import { map } from 'rxjs/operators';

@Injectable()
export class BankAccountListDataSource extends Datasource {
    loadCounter = 0;
    bankAccounts: BankAccount[];

    clients: Client[];
    banks: Bank[];
    branches: Branch[];
    departments: Department[];

    bankList: BankAccount[];
    bankAccountServiceTypes: BankAccountType[];
    bankAccount: BankAccount;
    bankName: string;
    itemId: number;
    itemType: string;
    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly bankAccountService: BankAccountService,
        private readonly bankAccountTypeService: BankAccountTypeService,
        private readonly clientService: ClientService,
        private readonly bankService: BankService,
        private readonly branchService: BranchService,
        private readonly departmentService: DepartmentService,
        private readonly lookupService: LookupService
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'clientName';
    }

    getData(itemInformation: any[]) {
        this.itemId = itemInformation[0] as number;
        this.itemType = itemInformation[1];
        this.isLoading = true;
        this.loadCounter = 0;
        this.isLoading = true;
        this.getBanks();
    }

    getBanks(): void {
        this.bankService.getBanks().subscribe(
            banks => {
                this.banks = banks;
                this.getBankAccountServiceTypes();
                // this.getClientBranches(this.client.id);
                // this.getClientDepartments(this.client.id);
            }
        );
    }

    getBankAccountServiceTypes(): void {
        this.bankAccountTypeService.getBankAccountTypes().subscribe(
            data => {
                this.bankAccountServiceTypes = data;
                this.getBankAccounts(this.itemId, this.itemType);
            }
        );
    }

    getBankAccounts(itemId: number, itemType: string): void {
        this.bankAccountService.getBankAccountByType(itemType, itemId).subscribe(
            data => {
                this.bankAccounts = data;
                this.bankAccounts.forEach(account => {
                    const bankAccount = this.banks.find(bank => bank.id === account.bankId);
                    this.bankName = bankAccount.name;
                });
                this.combineData();
            }
        );
    }


    clearData() {
        this.isLoading = false;
        this.dataChange.next(new Array());
    }

    combineData(): void {
        this.loadCounter++;
        if (this.loadCounter !== 1) { return; }
        if (this.bankAccounts == null || this.banks == null) { return; }
        const combinedAccounts = new Array<BankAccount>();
        this.bankAccounts.forEach(
            account => {
                const selectedBank = this.banks.find(bank => bank.id === account.bankId);
                account.linkedClientName = account.accountHolderName;
                account.bankName = selectedBank.name;
                account.bankAccountServiceTypes = account.bankAccountServiceTypeIds
                    .map(item => this.bankAccountServiceTypes.find(i => i.id === item)
                        ? this.bankAccountServiceTypes.find(i => i.id === item).name
                        : '').join(' | ');
                // account.clientId = this.client.id;
                combinedAccounts.push(account);
            }
        );
        this.isLoading = false;
        this.dataChange.next(combinedAccounts);
    }

    connect(): Observable<Client[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: BankAccount) => {

                const searchStr = (item.linkedClientName + item.itemType).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
