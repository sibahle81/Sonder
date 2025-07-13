
import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { MedicareMedicalInvoiceCommonService } from '../../medical-invoice-manager/services/medicare-medical-invoice-common.service';

@Injectable({
    providedIn: 'root'
})
export class MedicalInvoiceListDatasource extends PagedDataSource<InvoiceDetails> {
    public isLoading: boolean;
    constructor(
        private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    ) {
        super();
    }

    getData(pageNumber: number, pageSize: number, orderBy: string = 'invoiceId', sortDirection: string = 'asc', query: string, personEventId = 0) {
        this.loadingSubject.next(true);
       
        if (personEventId > 0)
        {
            this.medicareMedicalInvoiceCommonService.listMedicalInvoicesByPersonEventId(personEventId, pageNumber, pageSize, orderBy, sortDirection).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(result => {
                this.data = result as PagedRequestResult<InvoiceDetails>;
                this.dataSubject.next(this.data.data);
                this.rowCountSubject.next(this.data.rowCount);
            });
        }
        else
        {
            this.medicareMedicalInvoiceCommonService.listMedicalInvoices(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(result => {
                this.data = result as PagedRequestResult<InvoiceDetails>;
                this.dataSubject.next(this.data.data);
                this.rowCountSubject.next(this.data.rowCount);
            });
        }  
    }

    getDataSearch(pageNumber: number, pageSize: number, orderBy: string = 'invoiceId', sortDirection: string = 'asc', query: string): Observable<any> {
        this.isLoading = true;
        this.data = new PagedRequestResult<InvoiceDetails>();
        this.data.pageSize = pageSize;
        this.rowCountSubject.next(this.data.rowCount);

        let searchResults = this.medicareMedicalInvoiceCommonService.searchMedicalInvoice(pageNumber, pageSize, orderBy, sortDirection, query)

        return searchResults
    }

}
