import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Observable, BehaviorSubject} from 'rxjs';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';

export abstract class HttpDataSource extends DataSource<any> {
    dataSubject = new BehaviorSubject<any>([]);
    loadingSubject = new BehaviorSubject<boolean>(false);
    pageSubject = new BehaviorSubject<Pagination>(null);

    paginator: MatPaginator;
    sort: MatSort;
    defaultSortColumn: 'name';
    defaultSortDirection: SortDirection = 'asc';

    protected constructor() {
        super();
    }

    loading$ = this.loadingSubject.asObservable();

    connect(collectionViewer: CollectionViewer): Observable<any> {
        return this.dataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // this.dataSubject.complete();
        // this.loadingSubject.complete();
    }

    abstract loadData(itemId: number, pagination: Pagination): void;

    setControls(paginator: MatPaginator, sort: MatSort, defaultSort = true): void {
        this.paginator = paginator;
        this.sort = sort;
        // if (!sort.active && defaultSort) { this.setDefaultSortOrder() };
    }
}
