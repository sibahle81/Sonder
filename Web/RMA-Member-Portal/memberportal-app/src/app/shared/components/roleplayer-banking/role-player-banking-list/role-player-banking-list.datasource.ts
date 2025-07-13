import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { PagedDataSource } from 'src/app/shared-utilities/datasource/pagedDataSource';
import { RolePlayerBankingDetail } from 'src/app/shared/models/role-player-banking-detail';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerBankingListDataSource extends PagedDataSource<RolePlayerBankingDetail> {

  refresh$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  hasPhysicalAddress: boolean;
  hasPostalAddress: boolean;

  constructor(
    private readonly rolePlayerService: RolePlayerService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('rolePlayerId')) {
      orderBy = 'rolePlayerId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'rolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.rolePlayerService.getPagedRolePlayerBankingDetails(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as unknown as PagedRequestResult<RolePlayerBankingDetail>;
      this.data.data.sort((a, b) => b.rolePlayerBankingId - a.rolePlayerBankingId);
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.refresh$.next(true);
    });
  }

  getWizardData(data: RolePlayerBankingDetail[], pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerId', sortDirection: string = 'desc', query: string = '') {
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'rolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.data = new PagedRequestResult<RolePlayerBankingDetail>();
    this.data.data = data;
    this.data.rowCount = data.length;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;

    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.loadingSubject.next(false)
  }
}
