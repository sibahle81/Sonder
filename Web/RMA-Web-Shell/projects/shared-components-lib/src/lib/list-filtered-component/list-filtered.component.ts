import { OnInit, ViewChild, ViewChildren, QueryList, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';

@Directive()
export abstract class ListFilteredComponent implements OnInit {
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    showActionsLink = true;
    columns: any;
    displayedColumns: string[];
    actionsLinkText = 'View / Edit';
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

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
