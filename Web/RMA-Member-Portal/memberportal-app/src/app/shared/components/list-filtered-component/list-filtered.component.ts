import { OnInit, ViewChild, ViewChildren, QueryList, Inject, Injectable, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class ListFilteredComponent implements OnInit {
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    showActionsLink = true;
    columns: any;
    displayedColumns: string[];
    actionsLinkText = 'View / Edit';
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @ViewChildren(MultiSelectComponent)
    multiSelectComponentChildren: QueryList<MultiSelectComponent>;

    protected constructor(
        private readonly router: Router,
        public readonly dataSource: Datasource,
        private readonly detailsUrl: string,
        public readonly itemsName: string = '',
        public readonly filterName: string = '',
        private readonly defaultSort = true) {
        this.setupDisplayColumns();
        this.showActionsLink = false;
        this.displayedColumns = this.columns.map((column: any) => column.columnDefinition);
    }

    ngOnInit(): void {
        if (this.showActionsLink) { this.displayedColumns.push('actions'); }
        this.dataSource.setControls(this.paginator, this.sort, this.defaultSort);
    }

    getData(data: any): void {
        this.dataSource.getData(data);
    }

    getLookupControl(lookupName: string) {
        const component = this.multiSelectComponentChildren.find((child) => child.lookupName === lookupName);
        return component;
    }

    onSelect(item: any): void {
        this.router.navigate([this.detailsUrl, item.id]);
    }

    back(route: string) {
        this.router.navigateByUrl(route);
    }

    abstract setupDisplayColumns(): void;
}
