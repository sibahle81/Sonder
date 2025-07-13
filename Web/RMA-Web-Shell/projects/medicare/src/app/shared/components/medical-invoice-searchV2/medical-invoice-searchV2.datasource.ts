import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { MedicalInvoiceSearchRequest } from 'projects/medicare/src/app/shared/models/medical-invoice-search-request';

@Injectable({
  providedIn: 'root'
})

export class MedicalInvoiceSearchV2DataSource extends PagedDataSource<InvoiceDetails> {
    public isLoading: boolean;

    rolePlayerId: number = -1;

    constructor(
        private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService) {
        super();
    }

    getData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string | any) {
        this.loadingSubject.next(true);

        const pagedRequest = new PagedRequest();
        pagedRequest.orderBy = orderBy ? orderBy : 'invoiceId';
        pagedRequest.page = pageNumber ? pageNumber : 1;
        pagedRequest.pageSize = pageSize ? pageSize : 5;
        pagedRequest.searchCriteria = query ? query : '';
        pagedRequest.isAscending = sortDirection == 'asc';

        const invoiceSearh = new MedicalInvoiceSearchRequest();
        invoiceSearh.rolePlayerId = this.rolePlayerId;
        invoiceSearh.pagedRequest = pagedRequest;

        this.medicareMedicalInvoiceCommonService.searchMedicalInvoiceV2(invoiceSearh)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(
            result => {
                this.data = result as PagedRequestResult<InvoiceDetails>;
                this.data.page = pageNumber;
                this.data.pageSize = pageSize;
                this.dataSubject.next(this.data.data);
                this.rowCountSubject.next(this.data.rowCount);
            }
        );
    }

}