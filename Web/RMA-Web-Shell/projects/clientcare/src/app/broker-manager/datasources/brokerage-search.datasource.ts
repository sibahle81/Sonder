import { BrokerageTypeEnum } from './../../../../../shared-models-lib/src/lib/enums/brokerage-type-enum';
import { filter } from 'rxjs/operators';

import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { BrokerageService } from '../services/brokerage.service';
import { Brokerage } from '../models/brokerage';

export class BrokerageSearchDataSource extends PagedDataSource<Brokerage> {
    constructor(private readonly brokerageService: BrokerageService, private readonly isBinderPartnerSearch: boolean) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.brokerageService.search(pageNumber, pageSize, orderBy, sortDirection, query, this.isBinderPartnerSearch).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            //filter based on  isBinderPartner===true

            this.data = result as PagedRequestResult<Brokerage>;
           // if(this.isBinderPartnerSearch){

             //   this.data.data =   this.data.data.filter(x=> x.brokerageType == BrokerageTypeEnum.BinderPartner  );

               // }
           
            
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}