import { Injectable } from '@angular/core';
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RolePlayerPolicyService } from '../../shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';

@Injectable({ providedIn: 'root' })
export class PolicyAmendmentsDatasource extends PagedDataSource<RolePlayerPolicy> {

  
  constructor(
    private readonly rolePlayerPolicyService: RolePlayerPolicyService
  ) {
    super();
  }

  getData(query: any) {
     this.loadingSubject.next(true);
    this.rolePlayerPolicyService.getRolePlayerAmendments(query.rolePlayerId, query.policyId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      data => {
        this.data = data as PagedRequestResult<RolePlayerPolicy>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      }
    );
  }
}
