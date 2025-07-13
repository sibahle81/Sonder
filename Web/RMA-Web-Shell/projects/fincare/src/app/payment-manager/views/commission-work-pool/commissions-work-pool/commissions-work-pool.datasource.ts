import { Injectable } from "@angular/core";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { CommissionService } from "../../../services/commission.service";
import { BehaviorSubject, of } from "rxjs";
import { CommissionHeader } from "../../../models/commission-header";
import { CommissionPoolSearchParams } from "../../../models/commission-pool-search-params";
import { catchError, finalize } from "rxjs/operators";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { WorkPoolEnum } from "projects/shared-models-lib/src/lib/enums/work-pool-enum";

@Injectable({
  providedIn: 'root'
})
export class CommissionsWorkPoolDataSource extends PagedDataSource<CommissionHeader> {

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  poolName = '';
  canReAllocate = false;
  loggedInUserId = 0;
  dataLength: number;
  constructor(
    private readonly commissionService: CommissionService) {
    super();

  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'headerId', sortDirection: string = 'Desc', query: string = '') {
  }

  setData(commissionPoolSearchParams: CommissionPoolSearchParams) {
    this.loadingSubject.next(true);
    this.commissionService.commissionPoolSearch(commissionPoolSearchParams).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<CommissionHeader>;
      this.data.page = commissionPoolSearchParams.pageIndex;
      this.data.pageSize = commissionPoolSearchParams.pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.dataLength = this.data.rowCount;
      this.isLoaded$.next(true);
      this.loadingSubject.next(false)
    });
  }
}