

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { PolicyInsuredLifeSearchDatasource } from './policy-insured-life-search.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InsuredLife } from '../../../policy-manager/shared/entities/insured-life';

@Component({
    templateUrl: './policy-insured-life-search.component.html',

    selector: 'policy-insured-lives-search'
})
export class PolicyInsuredLifeSearchComponent implements OnInit {

    formSearch: UntypedFormGroup;
    currentQuery: string;
    policyId: number;

    displayedColumns = ['firstName', 'lastName', 'dateOfBirth', 'referenceNumber', 'relationshipName', 'actions'];
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;

    constructor(
        public readonly dataSource: PolicyInsuredLifeSearchDatasource,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.createForm();
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.clearData();
    }

    onSelect(item: InsuredLife): void {
        this.router.navigate(['clientcare/policy-manager/insured-life-details/edit', item.id]);
    }

    createForm(): void {
        if (this.formSearch) { return; }
        this.formSearch = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
    }

    getPolicyId(policyId: number): void {
        this.policyId = policyId;
    }


    readForm(): string {
        const formModel = this.formSearch.value;
        return formModel.query as string;
    }

    search(): void {
        if (this.formSearch.valid) {
            this.currentQuery = this.readForm();

            const params: Array <string> = [
                this.policyId.toString() , this.currentQuery
            ];

            this.dataSource.getData(params);
        }
    }

    clearFilter(): void {
        this.formSearch.patchValue({ query: '' });
    }
}
