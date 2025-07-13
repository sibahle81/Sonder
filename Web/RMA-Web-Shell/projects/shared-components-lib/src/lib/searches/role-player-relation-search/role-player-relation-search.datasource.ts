import { Injectable } from '@angular/core';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerRelationSearchDataSource extends PagedDataSource<RolePlayer> {

  // additional filters
  fromRolePlayerId: number;
  rolePlayerTypeId: number;

  constructor(
    private readonly rolaPlayerService: RolePlayerService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'modifiedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.fromRolePlayerId = this.fromRolePlayerId ? this.fromRolePlayerId : 0;
    this.rolePlayerTypeId = this.rolePlayerTypeId ? this.rolePlayerTypeId : 0;

    this.rolaPlayerService.getPagedRolePlayerRelations(this.fromRolePlayerId, this.rolePlayerTypeId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<RolePlayer>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
