import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { InsuredLifeListDatasource } from './insured-life-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { InsuredLife } from '../../shared/entities/insured-life';

@Component({
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-component/list.component.html',
})
export class InsuredLifeListComponent extends ListComponent implements OnInit {

    constructor(
        alertService: AlertService,
        router: Router,
        dataSource: InsuredLifeListDatasource) {
        super(alertService, router, dataSource, '/clientcare/policy-manager/insured-life-details/edit', 'Insured Life', 'Insured Lives');
        this.hideAddButton = true;
        this.hideAddButtonText = 'Insured lives can be added through policy details.';
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    getColor(inuredLife: InsuredLife): string {
        switch (inuredLife.status.toLowerCase()) {
        case 'pendingcancellation':
            return 'orange';
        case 'cancelled':
            return 'crimson';
        case 'active':
            return 'lawngreen';
        default:
        }
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'policyNumber', header: 'Policy Number', cell: (row: InsuredLife) => `${row.policyNumber}` },
            { columnDefinition: 'firstName', header: 'First Name', cell: (row: InsuredLife) => `${row.name}` },
            { columnDefinition: 'lastName', header: 'Last Name', cell: (row: InsuredLife) => `${row.surname}` },
            { columnDefinition: 'email', header: 'Email', cell: (row: InsuredLife) => `${row.email}` },
            { columnDefinition: 'referenceNumber', header: 'Reference Number', cell: (row: InsuredLife) => `${row.referenceNumber}` }
        ];
    }
}
