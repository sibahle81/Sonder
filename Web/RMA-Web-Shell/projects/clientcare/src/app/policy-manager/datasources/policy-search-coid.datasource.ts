import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { RolePlayerPolicyService } from '../shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from '../shared/entities/role-player-policy';


export class PolicySearchCoidDataSource extends PagedDataSource<RolePlayerPolicy> {
  constructor(private readonly roleplayerPolicyService: RolePlayerPolicyService) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'CreatedDate';
      sortDirection = sortDirection ? sortDirection : 'desc';
      this.roleplayerPolicyService.searchCoidPolicies(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
              catchError(() => of([])),
              finalize(() => this.loadingSubject.next(false))
          ).subscribe(result => {
              this.data = result as PagedRequestResult<RolePlayerPolicy>;
              this.dataSubject.next(this.data.data);
              this.rowCountSubject.next(this.data.rowCount);
          });
  }
}
