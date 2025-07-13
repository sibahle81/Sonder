import { OnInit, QueryList, ViewChild, ViewChildren, Directive } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { HttpDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/http.datasource';

@Directive()
export abstract class ListHttpComponent implements OnInit {
    showActionsLink = true;
    columns: any;
    displayedColumns: string[];
    actionsLinkText = 'View / Edit';

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChildren(MultiSelectComponent)

    multiSelectComponentChildren: QueryList<MultiSelectComponent>;
    pagination: Pagination;
    itemId: number;

    protected constructor(
        private readonly router: Router,
        public readonly dataSource: HttpDataSource,
        private readonly detailsUrl: string,
        private readonly itemsName: string,
        private readonly filterName: string,
        private readonly defaultSort = true) {
        this.setupDisplayColumns();
       // this.showActionsLink = false;
        this.displayedColumns = this.columns.map((column: any) => column.columnDefinition);
    }

    ngOnInit(): void {
        this.pagination = new Pagination();
        this.pagination.pageNumber = 1;
        this.pagination.pageSize = 1;
        this.pagination.totalCount = 1;

        if (this.showActionsLink) { this.displayedColumns.push('actions'); }
        this.dataSource.setControls(this.paginator, this.sort, this.defaultSort);
        this.dataSource.pageSubject.subscribe(pagination => {
            if (pagination) {
                this.pagination = pagination;
            }
        });
    }

    getHttpData(id: number, pagination: Pagination): void {
        this.itemId = id;
        this.pagination = pagination;
        this.dataSource.loadData(id, pagination);
    }

    getLookupControl(lookupName: string) {
        const component = this.multiSelectComponentChildren.find((child) => child.lookupName === lookupName);
        return component;
    }

    onSelect(item: any): void {
        this.router.navigate([this.detailsUrl, item.id]);
    }

    abstract setupDisplayColumns(): void;

    pageEvent($event: PageEvent): void {
        const page = new Pagination();
        page.isAscending = this.sort.direction === 'asc';
        page.orderBy = 'name';
        page.pageNumber = $event.pageIndex;
        page.pageSize = $event.pageSize;
        this.getHttpData(this.itemId, page);
    }
}
