
import { Injectable } from '@angular/core';
import { ClaimDisabilityPension } from 'projects/claimcare/src/app/claim-manager/shared/entities/claim-disability-pension';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PensionerInterviewListDataSource extends PagedDataSource<ClaimDisabilityPension> {

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
    constructor(
    ) {
      super();
    }
  
    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);
  
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'createdDate';
      sortDirection = sortDirection ? sortDirection : 'desc';
      query = query ? query : '';
    }
  }
