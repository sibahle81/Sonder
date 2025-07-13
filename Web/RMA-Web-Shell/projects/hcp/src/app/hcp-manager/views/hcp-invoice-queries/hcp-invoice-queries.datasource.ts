import { Injectable } from '@angular/core';
import { RolePlayerQueryService } from '../../services/roleplayer-query-service';
import { RolePlayerQueryItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums';
import { RolePlayerItemQuery } from '../../entities/roleplayer-item-query';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HcpInvoiceQueriesDataSource extends PagedDataSource<RolePlayerItemQuery> {

    rolePlayerQueryItemType: RolePlayerQueryItemTypeEnum;

    constructor(
        private readonly rolePlayerQueryService: RolePlayerQueryService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
        this.loadingSubject.next(true);
        if (orderBy.includes('createdDate')) {
          orderBy = 'createdDate';
        }
    
        pageNumber = pageNumber ? pageNumber : 1;
        pageSize = pageSize ? pageSize : 5;
        orderBy = orderBy ? orderBy : 'createdDate';
        sortDirection = sortDirection ? sortDirection : 'desc';
        query = query ? query : '';
        
        this.rolePlayerQueryItemType = RolePlayerQueryItemTypeEnum.MedicalInvoice;
        
        this.rolePlayerQueryService.getPagedRolePlayerItemQueries(this.rolePlayerQueryItemType, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
          this.data = result as PagedRequestResult<RolePlayerItemQuery>;
          this.data.page = pageNumber;
          this.data.pageSize = pageSize;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
        });
    }
}