import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { MedicareMedicalInvoiceCommonService } from '../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { ProsthetistQuote } from '../../preauth-manager/models/prosthetistquote';
import { PreAuthorisation } from '../../preauth-manager/models/preauthorisation';
import { MediCarePreAuthService } from '../../preauth-manager/services/medicare-preauth.service';

@Injectable({
    providedIn: 'root'
})
export class ProsthetistQuoteListDatasource extends PagedDataSource<ProsthetistQuote> {
    public isLoading: boolean;

    constructor(
        private readonly mediCarePreAuthService: MediCarePreAuthService
    ) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'prosthetistQuoteId', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.mediCarePreAuthService.searchProsthetistQuotations(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<ProsthetistQuote>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }

}
