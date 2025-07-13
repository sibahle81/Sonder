import { Injectable } from "@angular/core";
import { MedicalInvoiceSearchBatchCriteria } from "projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-search-batch-criteria";
import { MedicalSwitchBatch } from "projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch";
import { MedicareMedicalInvoiceSwitchBatchService } from "projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Injectable()
export class SwitchBatchDataSource extends PagedDataSource<MedicalSwitchBatch> {
  statusMsg: string;
  isLoading = false;

  constructor(
    private readonly medicareMedicalInvoiceSwitchBatchServicee: MedicareMedicalInvoiceSwitchBatchService) {
    super();
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }

  getData(pageNumber: number = 1, pageSize: number = 10, orderBy: string = 'CreatedDate', sortDirection: string = 'asc', searchRequest: MedicalInvoiceSearchBatchCriteria) {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Loading ...';
    if (!searchRequest.pageNumber || searchRequest.pageNumber === 0) {
      searchRequest.pageNumber = pageNumber;
    }
    if (!searchRequest.pageSize || searchRequest.pageSize === 0) {
      searchRequest.pageSize = pageSize;
    }
    this.medicareMedicalInvoiceSwitchBatchServicee.getPagedMedicalSwitchBatchList(searchRequest).pipe(
      catchError(error => of([])),
      finalize(() => this.loadingSubject.next(false))
  ).subscribe(result => {
      this.loadingSubject.next(false);
      this.isLoading = false;
      this.data = result as PagedRequestResult<MedicalSwitchBatch>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
  });
  }
}
