import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimEstimate } from '../../../entities/personEvent/claimEstimate';

@Injectable({
  providedIn: 'root'
})
export class ClaimPagedEstimatesDataSource extends PagedDataSource<ClaimEstimate> {

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  personEventId: number;
  invoiceType = ClaimInvoiceTypeEnum.SundryInvoice;

  constructor(
    private readonly claimInvoiceService: ClaimInvoiceService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'claimEstimateId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
 
    orderBy = "claimEstimateId";
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'claimEstimateId';
    sortDirection = sortDirection ? sortDirection : 'Desc';
    query = query ? query : '';

    this.claimInvoiceService.getPagedClaimEstimates(pageNumber, pageSize, orderBy, sortDirection, query, this.personEventId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ClaimEstimate>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
