import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators'; 
import { TermsArrangementNote } from 'projects/fincare/src/app/billing-manager/models/term-arrangement-note';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';

@Injectable({
  providedIn: 'root'  
})
export class TermsArrangementNoteDataSource extends PagedDataSource<TermsArrangementNote> {

  constructor(
    private readonly termArrangement: TermArrangementService
     ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('createdDate')) {
      orderBy = 'createdDate';
    }

    pageNumber = pageNumber ? pageNumber : 1; 
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'createdDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';
    
    this.termArrangement.GetAllTermNotesByTermArrangementId(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false)) 
    ).subscribe(result => { 
      this.data = result as PagedRequestResult<TermsArrangementNote>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
