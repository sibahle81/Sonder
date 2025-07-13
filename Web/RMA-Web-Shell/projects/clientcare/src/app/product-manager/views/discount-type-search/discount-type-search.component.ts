import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DiscountTypeSearchDataSource } from '../../datasources/discount-type-search.datasource';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

@Component({
    templateUrl: './discount-type-search.component.html',
    styleUrls: ['./discount-type-search.component.css'],
    selector: 'discount-type-search'
})
export class DiscountTypeSearchComponent implements OnInit {
    form: UntypedFormGroup;
    currentQuery: string;

    displayedColumns = ['name', 'code', 'description', 'modifiedBy', 'modifiedDate', 'isActive', 'actions'];
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;

    constructor(
        public readonly dataSource: DiscountTypeSearchDataSource,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.createForm();
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.clearData();
    }

    onSelect(item: BaseClass): void {
        this.router.navigate(['clientcare/product-manager/discount-type-details', item.id]);
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
