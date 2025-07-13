import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { InsuredLifeBeneficiaryListDatasource } from './insured-life-beneficiary-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { Beneficiary } from '../../shared/entities/beneficiary';

@Component({

    selector: 'insured-life-beneficiaries',

    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html',
})
export class InsuredLifeBeneficiaryListComponent extends ListFilteredComponent implements OnInit {

    get isLoading(): boolean {
        if (!this.privateDataSource) { return true; }
        return this.privateDataSource.isLoading;
    }

    constructor(
        router: Router,
        private readonly  privateDataSource: InsuredLifeBeneficiaryListDatasource) {
        super(router, privateDataSource, 'clientcare/policy-manager/beneficiary-details/edit', 'beneficiaries', 'insured life');
        this.showActionsLink = true;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.showActionsLink = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'firstName', header: 'First Name', cell: (row: Beneficiary) => `${row.name}` },
            { columnDefinition: 'lastName', header: 'Last Name', cell: (row: Beneficiary) => `${row.surname}` },

            { columnDefinition: 'allocationPercentage', header: 'Allocation Percentage', cell: (row: Beneficiary) => `${row.allocationPercentage}%` },
            { columnDefinition: 'email', header: 'Email', cell: (row: Beneficiary) => `${row.email}` }
        ];
    }
}
