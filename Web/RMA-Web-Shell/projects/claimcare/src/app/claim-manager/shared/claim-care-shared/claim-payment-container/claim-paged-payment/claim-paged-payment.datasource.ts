import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';

@Injectable({
  providedIn: 'root'
})
export class ClaimPagedPaymentDataSource extends PagedDataSource<ClaimInvoice> {

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  personEventId: number;
  invoiceStatus: ClaimInvoiceStatusEnum;
  invoiceType: ClaimInvoiceTypeEnum;

  constructor(
    private readonly claimInvoiceService: ClaimInvoiceService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'claimId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
 
    orderBy = "claimId";
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'claimId';
    sortDirection = sortDirection ? sortDirection : 'Desc';
    query = query ? query : '';

    this.claimInvoiceService.getPagedClaimInvoiceAllocations(pageNumber, pageSize, orderBy, sortDirection, query, this.personEventId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      let pagedRequestResults = result as PagedRequestResult<ClaimInvoice>;
      if (this.invoiceType !== undefined) {
        const selectedInvoiceType = +ClaimInvoiceTypeEnum[this.invoiceType];
        if (!isNaN(selectedInvoiceType)) {
          pagedRequestResults.data = pagedRequestResults.data.filter(c => c.claimInvoiceType === selectedInvoiceType); 
        }
      }
      this.data = pagedRequestResults;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.isLoaded$.next(true);
      this.loadingSubject.next(false);
    });
  }
}
