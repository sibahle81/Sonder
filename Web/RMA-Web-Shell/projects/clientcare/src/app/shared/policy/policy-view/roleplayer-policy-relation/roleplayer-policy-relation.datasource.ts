import { Injectable } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class RolePlayerPolicyRelationDataSource extends PagedDataSource<RolePlayer> {
  rolePlayerId: number;
  policyId: number;
  rolePlayerType: RolePlayerTypeEnum;
  constructor(
    private readonly rolePlayerService: RolePlayerService) {
    super();
  }
  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'displayName', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('displayName')) {
      orderBy = 'displayName';
    }
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'displayName';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';
    this.rolePlayerService.getPagedRolePlayerPolicyRelations(this.rolePlayerId, this.policyId, +this.rolePlayerType, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
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

