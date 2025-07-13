import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

export abstract class PagedDataSource<T> implements DataSource<T> {
    protected dataSubject = new BehaviorSubject<T[]>([]);
    protected loadingSubject = new BehaviorSubject<boolean>(false);
    protected rowCountSubject = new BehaviorSubject<number>(0);

    public loading$ = this.loadingSubject.asObservable();
    public rowCount$ = this.rowCountSubject.asObservable();
    public data: PagedRequestResult<T>;

    constructor() {
    }

    abstract getData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string | any);

    connect(collectionViewer: CollectionViewer): Observable<T[]> {
        return this.dataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    get getDataSubject(): BehaviorSubject<T[]> {
        return this.dataSubject;
    }
}
