import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { Refund } from '../../../models/refund';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefundListDataSource extends PagedDataSource<Refund> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly roleplayerService: RolePlayerService) {
    super();
  }

  getData(query: any): void {
    this.isLoading$.next(true);
    query.orderBy = query.orderBy ? query.orderBy : 'Id';
    query.sortDirection = query.sortDirection ? query.sortDirection : 'asc';

    this.roleplayerService.getAllPoliciesDueRefunds().subscribe(searchResults => {
        this.data = new PagedRequestResult<Refund>();
        this.data.data = searchResults;
        this.data.rowCount = searchResults.length;
        this.data.page = query.pageNumber;
        this.data.pageSize = query.PageSize;

        const minItem = (query.pageNumber * query.pageSize);
        const maxItem = (query.pageSize + minItem) > this.data.rowCount ? this.data.rowCount : (query.pageSize + minItem);

        const filteredData = searchResults.slice(minItem, maxItem);

        this.dataSubject.next(filteredData);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoading$.next(false);
      });
  }
}
