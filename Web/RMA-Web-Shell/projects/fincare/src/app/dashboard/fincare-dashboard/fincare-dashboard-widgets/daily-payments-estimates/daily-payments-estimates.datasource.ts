import { Payment } from '../../../../shared/models/payment.model';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { SystemSettings } from 'projects/shared-models-lib/src/lib/common/system-settings';
import { ModuleSetting } from 'projects/shared-models-lib/src/lib/common/module-setting';
import { PolicyPayment } from '../../../../shared/models/PolicyPayment';
import { Injectable } from '@angular/core';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { PaymentEstimate } from 'projects/fincare/src/app/shared/models/payment-estimates.model';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class DailyPaymentEstimatesDatasource extends Datasource {
    hasData = false;
    paymentEstimates: PaymentEstimate[] = [];
    currentTime: string;
    paymentManagerCutOffTimeKey = 'PaymentManagerCutOffStartTime';
    paymentManagerCutOffTimeValue = '';

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly paymentService: PaymentService,
        private lookupService: LookupService
      ) {
        super(appEventsManager, alertService);
        this.isLoading = false;
      }
    
      clearData(): void {
        this.dataChange.next(new Array());
      }
    
      getData(requestParams): void {
        this.startLoading('Loading payment estimates...');
        this.getDailyEstimates(requestParams.startDate, requestParams.endDate);
      }

      getDailyEstimates(startDate: string, endDate: string): void {
        this.paymentEstimates = [];
        this.paymentService.dailyPaymentEstimates(startDate,endDate).subscribe(originalData => {
            this.paymentEstimates = originalData;
            this.dataChange.next(this.paymentEstimates);
            this.hasData = true;
            this.stopLoading();
        })
      }

      connect(): Observable<PaymentEstimate[]> {
        const displayDataChanges = [
          this.dataChange,
          this.sort.sortChange,
          this.filterChange,
          this.paginator.page
        ];
    
        return merge(...displayDataChanges).pipe(
          map(() => {
            this.filteredData = this.data.slice().filter((item: PaymentEstimate) => {
              const searchStr = '';
              return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
          })
        );
      }
}