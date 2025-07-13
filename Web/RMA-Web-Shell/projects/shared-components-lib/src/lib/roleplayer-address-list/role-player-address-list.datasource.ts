import { Injectable } from '@angular/core';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerAddressListDataSource extends PagedDataSource<RolePlayerAddress> {

  refresh$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  hasPhysicalAddress: boolean;
  hasPostalAddress: boolean;

  constructor(
    private readonly rolePlayerService: RolePlayerService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'isPrimary', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('isPrimary')) {
      orderBy = 'isPrimary';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'effectiveDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.rolePlayerService.getPagedRolePlayerAddress(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<RolePlayerAddress>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.refresh$.next(true);
    });
  }

  getWizardData(data: RolePlayerAddress[], pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerId', sortDirection: string = 'desc', query: string = '') {
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'rolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.data = new PagedRequestResult<RolePlayerAddress>();
    this.data.data = data;
    this.data.rowCount = data.length;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;

    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.loadingSubject.next(false)
  }
}
