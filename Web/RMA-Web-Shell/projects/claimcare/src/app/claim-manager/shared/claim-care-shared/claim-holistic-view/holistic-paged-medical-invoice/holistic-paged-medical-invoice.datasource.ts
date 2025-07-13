import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';

@Injectable({
  providedIn: 'root'
})
export class HolistPagedMedicalInvoiceDataSource extends PagedDataSource<InvoiceDetails> {

  hasPersonEvent: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isPersonEvent = false;

  constructor(
    private readonly medicalService: MedicareMedicalInvoiceCommonService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'invoiceId', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);

    orderBy = "invoiceId";
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'invoiceId';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';

    this.medicalService.searchMedicalInvoice(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<InvoiceDetails>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.loadingSubject.next(false);
      }
    });
  }
}
