import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';

@Inject({})
export abstract class PagedDataSource<T> implements DataSource<T> {
    protected dataSubject = new BehaviorSubject<T[]>([]);
    protected loadingSubject = new BehaviorSubject<boolean>(false);
    protected rowCountSubject = new BehaviorSubject<number>(0);

    public loading$ = this.loadingSubject.asObservable();
    public rowCount$ = this.rowCountSubject.asObservable();
    public data: PagedRequestResult<T>;

    constructor() {
    }

    abstract getData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string);

    connect(collectionViewer: CollectionViewer): Observable<T[]> {
        return this.dataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }
}
