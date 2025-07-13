import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BankAccountApprovalListDataSource } from './bank-account-approval-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { BankAccount } from '../../shared/Entities/bank-account';

@Component({
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class BankAccountApprovalListComponent extends ListComponent implements OnInit {

    isLoading: boolean;
    itemsName: string;
    filterName: string;

    constructor(
        alertService: AlertService,
        router: Router,
        dataSource: BankAccountApprovalListDataSource) {
        super(alertService, router, dataSource, 'clientcare/client-manager/bank-account-approval-details', 'Bank Account', 'Bank Accounts');
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.itemsName = 'bank accounts';
        this.filterName = 'approval';
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'accountNumber', header: 'Account Number', cell: (row: BankAccount) => `${row.accountNumber}` },
            { columnDefinition: 'accountHolderName', header: 'Account Holder', cell: (row: BankAccount) => `${row.accountHolderName}` },
            { columnDefinition: 'reason', header: 'Reason', cell: (row: BankAccount) => `${row.reason}` }
        ];
    }
}
