import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { MedicalSwitchBatchSearchPersonEvent } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-search-person-event';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


@Injectable({
  providedIn: 'root'
})
export class MedicalInvoiceSwitchBatchPersonEventSearchDatasourceService extends PagedDataSource<MedicalSwitchBatchSearchPersonEvent>  {

  medicalSwitchBatchSearchPersonEvent: MedicalSwitchBatchSearchPersonEvent[];

  constructor(
    private readonly medicalInvoiceClaimService: MedicalInvoiceClaimService
  ) {
    super();

  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = ' FirstName ', sortDirection: string = ' ASC ', query: string = '') {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : ' FirstName ';
    sortDirection = sortDirection ? sortDirection : ' ASC ';
    
    this.medicalInvoiceClaimService.getSearchMedicalSwitchBatchPersonEvent(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<MedicalSwitchBatchSearchPersonEvent>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

}
