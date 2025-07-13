import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { RoleSearchDataSource } from './role-search.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';


@Component({
    templateUrl: './role-search.component.html',
    styleUrls: ['./role-search.component.css'],
    selector: 'role-search'
})
export class RoleSearchComponent implements OnInit {
    form: UntypedFormGroup;
    currentQuery: string;

    displayedColumns = ['name', 'actions'];
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;

    constructor(
        public readonly dataSource: RoleSearchDataSource,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly router: Router,
        private readonly location: Location) {
    }

    ngOnInit(): void {
        this.createForm();
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.clearData();
    }

    onSelect(item: Role): void {
        this.router.navigate(['user-manager/role-details', item.id]);
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
    }

    readForm(): string {
        const formModel = this.form.value;
        return formModel.query as string;
    }

    search(): void {
        if (this.form.valid) {
            this.currentQuery = this.readForm();
            this.dataSource.getData(this.currentQuery);
        }
    }

    clearFilter(): void {
        this.form.patchValue({ query: '' });
    }
}
