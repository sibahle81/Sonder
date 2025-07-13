import { Injectable } from '@angular/core';
import { PolicyGroupMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-group-member';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChildPolicyListDataSource extends PagedDataSource<PolicyGroupMember> {

  constructor(
    private readonly policyService: PolicyService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'policyNumber', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('policyNumber')) {
      orderBy = 'policyNumber';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'policyNumber';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.policyService.getPagedChildPolicies(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<PolicyGroupMember>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
