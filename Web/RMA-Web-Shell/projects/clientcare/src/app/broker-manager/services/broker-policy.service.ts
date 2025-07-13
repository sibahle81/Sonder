import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BrokerCommission } from '../models/broker-commission';
import { CommissionPeriod } from '../models/commission-period';
import { CommissionDetail } from '../models/commission-detail';
import { CommissionWithholdingSummary } from '../models/commission-withholding-summary';
import { Representative } from '../models/representative';

@Injectable()
export class BrokerPolicyService {
    private baseUrl = 'clc/api/Policy/';

    constructor(
        private readonly commonService: CommonService) {
    }

    searchForCommissionBrokers(filter: string): Observable<Representative[]> {
        if (filter.length > 0) {
            return this.commonService.get(filter, 'Broker/Commission/Search');
        } else {
            return this.commonService.getAll('Broker');
        }
    }

    getBrokerageCommission(filter: string): Observable<BrokerCommission[]> {
        if (filter && filter.length > 0) {
            const url = this.baseUrl + 'Commission/GetBrokerCommissionByBrokerage/' + filter;
            return this.commonService.getAll<BrokerCommission[]>(url);
        } else {
            return this.commonService.getAll<BrokerCommission[]>(this.baseUrl + 'Commission');
        }
    }

    runCommission() {
        return this.commonService.postWithNoData(this.baseUrl + 'Commission/RunCommission');
    }

    exportCommissionPayments(brokerageIds: string): Observable<any> {
        return this.commonService.getString(this.baseUrl + 'Commission/GetCommissionExport/' + brokerageIds);
    }

    getCommissionPeriods(): Observable<CommissionPeriod[]> {
        return this.commonService.getAll<CommissionPeriod[]>(this.baseUrl + 'Commission/GetCommissionPeriods');
    }

    getCommissionHeaderForPeriod(period: string, brokerageId: number): Observable<Array<CommissionDetail>> {
        return this.commonService.getAll<Array<CommissionDetail>>(this.baseUrl + 'CommissionDetail/ByPeriodAndBrokerage/' + period + '/' + brokerageId);
    }

    getCommissionWithholdingBalances(brokerageId: number): Observable<CommissionWithholdingSummary[]> {
        return this.commonService.getAll<CommissionWithholdingSummary[]>(this.baseUrl + 'CommissionWithholding/GetUnpaidCommissionWithholding/' + brokerageId);
    }
}
