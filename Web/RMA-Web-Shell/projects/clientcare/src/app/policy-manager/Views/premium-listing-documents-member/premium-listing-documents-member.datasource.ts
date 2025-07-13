import { Injectable } from '@angular/core';
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PolicyGroupMember } from '../../shared/entities/policy-group-member';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PremiumListingDocumentsMemberDatasource extends PagedDataSource<PolicyGroupMember> {

  public isLoading = false;

  constructor(
    private readonly insuredLifeService: PolicyInsuredLifeService
  ) {
    super();
  }

  getData(query: any) {
    this.isLoading = true;
    this.loadingSubject.next(true);
    this.insuredLifeService.getGroupPolicyOnboardedMembers(query.policyId, query.query, query.pageNumber, query.pageSize, query.orderBy, query.sortDirection).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      data => {
        this.data = data as PagedRequestResult<PolicyGroupMember>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoading = false;
      }
    );
  }
}
