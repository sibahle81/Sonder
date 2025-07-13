import { Injectable } from '@angular/core';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { RolePlayerPolicyDeclaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerPolicyDeclarationSearchDataSource extends PagedDataSource<RolePlayerPolicyDeclaration> {

  // additional filters
  policyId: number;
  coverPeriod: number;

  constructor(
    private readonly declarationService: DeclarationService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerPolicyDeclarationId', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('rolePlayerPolicyDeclarationId')) {
      orderBy = 'rolePlayerPolicyDeclarationId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'rolePlayerPolicyDeclarationId';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';

    this.declarationService.getPagedRolePlayerPolicyDeclarations(this.policyId, this.coverPeriod, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<RolePlayerPolicyDeclaration>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
