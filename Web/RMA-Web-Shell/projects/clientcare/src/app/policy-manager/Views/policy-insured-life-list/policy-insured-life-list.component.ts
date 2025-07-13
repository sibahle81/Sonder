import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InsuredLife } from '../../shared/entities/insured-life';
import { PolicyInsuredLifeListDatasource } from './policy-insured-life-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';

@Component({

    selector: 'policy-insured-lives',
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class PolicyInsuredLifeListComponent extends ListFilteredComponent implements OnInit {

    get isLoading(): boolean {
        if (!this.privateDataSource) { return true; }
        return this.privateDataSource.isLoading;
    }

    constructor(
        router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly privateDataSource: PolicyInsuredLifeListDatasource) {
        super(router, privateDataSource, '/clientcare/policy-manager/insured-life-details/edit', 'insured lives', 'policy');
        this.showActionsLink = true;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.activatedRoute.params.subscribe((params: any) => {

            if (params.id) {
                this.privateDataSource.getData(params.id);
            }
        });
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
            { columnDefinition: 'firstName', header: 'First Name', cell: (row: InsuredLife) => `${row.name}` },
            { columnDefinition: 'lastName', header: 'Last Name', cell: (row: InsuredLife) => `${row.surname}` },
            { columnDefinition: 'email', header: 'Email', cell: (row: InsuredLife) => `${row.email}` },
            { columnDefinition: 'relationshipName', header: 'Relationship', cell: (row: InsuredLife) => `${row.relationshipName}` },
            { columnDefinition: 'status', header: 'Status', cell: (row: InsuredLife) => `${row.status}` }
        ];
    }
}
