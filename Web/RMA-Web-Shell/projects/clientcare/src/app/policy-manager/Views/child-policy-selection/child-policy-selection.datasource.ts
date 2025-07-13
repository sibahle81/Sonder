import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';

import { GroupPolicySchemeService } from '../group-policy-scheme-selection/group-policy-scheme.service';
import { Policy } from '../../shared/entities/policy';

@Injectable()
export class PolicyChildDataSource extends PagedDataSource<Policy> {

  public isLoading = false;
  public search = '';

  constructor(
    private readonly schemeService: GroupPolicySchemeService
  ) {
    super();
  }

  getData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: any) {
    this.isLoading = true;
    this.loadingSubject.next(true);
    this.schemeService.getChildPolicies(query, pageNumber, pageSize, orderBy, sortDirection, this.search).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      data => {
        this.data = data as PagedRequestResult<Policy>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoading = false;
      }
    );
  }
}
