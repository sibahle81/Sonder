import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { MedicareMedicalInvoiceCommonService } from '../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { MedicareUtilities } from '../../shared/medicare-utilities';
import { PayeeTypeEnum } from '../../medical-invoice-manager/enums/payee-type.enum';
import { VatCodeEnum } from '../../medical-invoice-manager/enums/vat-code.enum';
import { TebaInvoiceLine } from '../../medical-invoice-manager/models/teba-invoice-line';
import { SwitchBatchType } from '../../shared/enums/switch-batch-type';
import { TebaInvoice } from '../../medical-invoice-manager/models/teba-invoice';
import { InvoiceStatusEnum } from '../../medical-invoice-manager/enums/invoice-status.enum';
import { TebaInvoiceService } from '../../medical-invoice-manager/services/teba-invoice.service';

@Injectable({
    providedIn: 'root'
})
export class TebaInvoiceListDatasource extends PagedDataSource<TebaInvoice> {
    public isLoading: boolean;
    constructor(
        private tebaInvoiceService: TebaInvoiceService
    ) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'tebaInvoiceId', sortDirection: string = 'desc', query: string = '', personEventId = 0) {
        this.loadingSubject.next(true);
        if (orderBy.includes('createdDate')) {
            orderBy = 'createdDate';
        }

        pageNumber = pageNumber ? pageNumber : 1;
        pageSize = pageSize ? pageSize : 5;
        orderBy = orderBy ? orderBy : 'tebaInvoiceId';
        sortDirection = sortDirection ? sortDirection : 'desc';
        query = query ? query : '';


        if (personEventId > 0) {

            this.tebaInvoiceService.listTebaInvoicesByPersonEventId(personEventId).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(result => {
                let dataResult: PagedRequestResult<TebaInvoice> = {
                    data: result,
                    page: 1,
                    pageSize: 0,
                    pageCount: result.length,
                    rowCount: result.length
                }

                this.data = dataResult;
                this.data.rowCount = dataResult.rowCount
                this.data.page = dataResult.page
                this.data.pageSize = dataResult.pageSize
                this.data.pageCount = dataResult.pageCount
                this.data.data = dataResult.data
                this.loadingSubject.next(false);
                this.dataSubject.next(dataResult.data);

            });

        }
        else {

            this.tebaInvoiceService.getPagedTebaInvoiceList(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            ).subscribe(result => {
                this.data = result as PagedRequestResult<TebaInvoice>;
                this.data.rowCount = this.data.rowCount
                this.data.page = this.data.page
                this.data.pageSize = this.data.pageSize
                this.data.pageCount = this.data.pageCount
                this.data.data = this.data.data
                this.loadingSubject.next(false);
                this.dataSubject.next(this.data.data);

            });
        }

    }


}
