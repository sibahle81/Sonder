import { Injectable } from '@angular/core';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LeadSearchDataSource extends PagedDataSource<Lead> {

  // additional filters
  leadStatusId: number;

  constructor(
    private readonly leadService: LeadService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'leadId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('leadId')) {
      orderBy = 'leadId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'leadId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.leadStatusId = this.leadStatusId ? this.leadStatusId : 0;

    this.leadService.getPagedLeads(this.leadStatusId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Lead>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
