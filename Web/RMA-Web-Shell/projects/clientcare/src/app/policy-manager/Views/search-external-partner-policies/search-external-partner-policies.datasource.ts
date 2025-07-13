import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ExternalPartnerPolicyData } from '../../shared/entities/external-partner-policy-data';
import { PolicyService } from '../../shared/Services/policy.service';

@Injectable({
  providedIn: 'root'
})
export class SearchExternalPartnerPoliciesDataSource extends PagedDataSource<ExternalPartnerPolicyData> {

  constructor(
    private readonly policyService: PolicyService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'modifiedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.policyService.searchExternalPartnerPolicies(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ExternalPartnerPolicyData>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
