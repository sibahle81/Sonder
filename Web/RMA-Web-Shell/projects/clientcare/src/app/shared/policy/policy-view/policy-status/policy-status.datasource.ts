import { Injectable } from '@angular/core';
import { PolicyStatusChangeAudit } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-status-change-audit';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PolicyStatusDataSource extends PagedDataSource<PolicyStatusChangeAudit> {

  constructor(
    private readonly policyService: PolicyService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PolicyStatusChangeAuditId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('PolicyStatusChangeAuditId')) {
      orderBy = 'PolicyStatusChangeAuditId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'PolicyStatusChangeAuditId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.policyService.getPagedPolicyStatusChangeAudit(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<PolicyStatusChangeAudit>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
