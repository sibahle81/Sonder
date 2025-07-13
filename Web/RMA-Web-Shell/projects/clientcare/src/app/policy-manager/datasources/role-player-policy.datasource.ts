import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RolePlayerPolicy } from '../shared/entities/role-player-policy';
import { RolePlayerPolicyService } from '../shared/Services/role-player-policy.service';
import { PolicyStatusEnum } from '../shared/enums/policy-status.enum';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable()
export class RolePlayerPolicyDataSource extends PagedDataSource<RolePlayerPolicy> {
  constructor(private readonly policyService: RolePlayerPolicyService) {
    super();
  }

  numberOfResultsFound: number;

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PolicyNumber', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);
    this.numberOfResultsFound = 0;
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'PolicyNumber';
    sortDirection = sortDirection ? sortDirection : 'asc';
    this.policyService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      result => {
        if (result) {
          this.data = result as PagedRequestResult<RolePlayerPolicy>;
          if (this.data.data) {
            this.data.data.forEach((rolePlayerPolicy) => {
              rolePlayerPolicy.policyStatusText = PolicyStatusEnum[rolePlayerPolicy.policyStatus];
              this.numberOfResultsFound++;
              rolePlayerPolicy.isExpanded = false;
            });
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
          }
        }
      }
    );
  }

  resetData() {
    this.data.data = [];
    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(0);
  }
}
