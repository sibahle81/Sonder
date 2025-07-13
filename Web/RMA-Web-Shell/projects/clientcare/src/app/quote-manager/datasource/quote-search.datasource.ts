import { catchError, filter, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';


import { QuoteService } from '../services/quote.service';
import { QuoteSearch } from '../models/quoteSearch';

export class QuotesSearchDataSource extends PagedDataSource<QuoteSearch> {
    constructor(private readonly quoteService: QuoteService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'QuoteCreatedDate', sortDirection: string = 'desc', query: string = '', filterDate: string = "") {
    //     this.loadingSubject.next(true);
    //     pageNumber = pageNumber ? pageNumber : 1;
    //     pageSize = pageSize ? pageSize : 5;
    //     orderBy = orderBy ? orderBy : 'QuoteCreatedDate';
    //     sortDirection = sortDirection ? sortDirection : 'desc';
    //     this.quoteService.getPagedQoutes(pageNumber, pageSize, orderBy, sortDirection, query, filterDate).pipe(
    //         catchError(() => of([])),
    //         finalize(() => this.loadingSubject.next(false))
    //     ).subscribe(result => {
    //         this.data = result as PagedRequestResult<QuoteSearch>;
    //         this.dataSubject.next(this.data.data);
    //         this.rowCountSubject.next(this.data.rowCount);
    //     });

    }
}
