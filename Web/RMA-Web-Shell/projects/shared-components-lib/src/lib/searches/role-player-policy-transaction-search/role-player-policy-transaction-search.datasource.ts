import { Injectable } from '@angular/core';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { RolePlayerPolicyTransaction } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-transaction';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerPolicyTransactionSearchDataSource extends PagedDataSource<RolePlayerPolicyTransaction> {

  // additional filters
  rolePlayerId: number;
  policyId: number;
  coverPeriod: number;

  constructor(
    private readonly declarationService: DeclarationService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerPolicyTransactionId', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('rolePlayerPolicyTransactionId')) {
      orderBy = 'rolePlayerPolicyTransactionId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'rolePlayerPolicyTransactionId';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';

    if (this.policyId) {
      this.declarationService.getPagedRolePlayerPolicyTransactions(this.policyId, this.coverPeriod, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.data = result as PagedRequestResult<RolePlayerPolicyTransaction>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });
    } else if (this.rolePlayerId) {
      this.declarationService.getPagedRolePlayerTransactions(this.rolePlayerId, this.coverPeriod, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.data = result as PagedRequestResult<RolePlayerPolicyTransaction>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });
    }
  }
}
