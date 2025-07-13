import { Injectable } from "@angular/core";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { SearchInvoiceCriteria } from "../models/search-invoice-criteria";
import { MedicareMedicalInvoiceCommonService } from "../../medical-invoice-manager/services/medicare-medical-invoice-common.service";
import { InvoiceDetails } from "../../medical-invoice-manager/models/medical-invoice-details";

@Injectable()
export class SearchInvoiceDataSource extends PagedDataSource<InvoiceDetails> {
  statusMsg: string;
  isLoading = false;

  constructor(
    private readonly invoiceCommonService: MedicareMedicalInvoiceCommonService) {
    super();
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }

  getData(pageNumber: number = 1, pageSize: number = 10, orderBy: string = 'InvoiceId', sortDirection: string = 'asc', searchRequest: SearchInvoiceCriteria) {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Searching ...';
    if (!searchRequest.pageNumber || searchRequest.pageNumber === 0) {
      searchRequest.pageNumber = pageNumber;
    }
    if (!searchRequest.pageSize || searchRequest.pageSize === 0) {
      searchRequest.pageSize = pageSize;
    }
    this.invoiceCommonService.searchForInvoices(searchRequest).pipe(
      catchError(error => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
        this.loadingSubject.next(false);
        this.isLoading = false;
        this.data = result as PagedRequestResult<InvoiceDetails>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
