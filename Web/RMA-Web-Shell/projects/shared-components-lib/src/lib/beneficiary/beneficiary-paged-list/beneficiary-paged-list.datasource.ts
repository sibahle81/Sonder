import { Injectable } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryPagedListDataSource extends PagedDataSource<RolePlayer> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public beneficiaries: RolePlayer[] = [];
  isSpouse = false;

  constructor(
    private readonly beneficiaryService: BeneficiaryService
  ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'RolePlayerId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'RolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.beneficiaryService.getPagedBeneficiaries(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<RolePlayer>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      }
    });
  }
}

