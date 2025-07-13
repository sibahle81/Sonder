import { Injectable, OnInit } from '@angular/core';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { DateTimeRangeValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-time-range.validator';


@Injectable()
export class InactivePoliciesDatasource extends Datasource {
    isLoading = true;
    isError = false;
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<Policy[]> = new BehaviorSubject<Policy[]>([]);
    filteredData: Policy[] = [];
    renderedData: Policy[] = [];
    paginator: MatPaginator;
    sort: MatSort;
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): Policy[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }
    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly policyService: PolicyService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'name';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(data : any): void {
        this.startLoading('Loading inactive policies...');
        
        const startDate = data.startDate.toISOString();
        const endDate = data.endDate.toISOString();

        this.policyService.getPoliciesInDateRange(startDate, endDate).subscribe(policies=>{
                this.dataChange.next(policies);
                this.isLoading = false;
                this.stopLoading();
            
        })
    }

    getStatus(policyStatusId: number): string {
        const statusText = PolicyStatusEnum[policyStatusId];
        return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
      }

    connect(): Observable<Policy[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Policy) => {
                const searchStr = (item.policyNumber).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }

    disconnect() { }
    /** Returns a sorted copy of the database data. */
    getSortedData(data: Policy[]): Policy[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string | Date = '';
            let propertyB: number | string | Date = '';

            switch (this.sort.active) {
                case 'policyNumber': [propertyA, propertyB] = [a.policyNumber, b.policyNumber]; break;
                case 'policyStatus': [propertyA, propertyB] = [a.policyStatus, b.policyStatus]; break;
                case 'policyInceptionDate': [propertyA, propertyB] = [a.policyInceptionDate, b.policyInceptionDate]; break;
                case 'firstInstallmentDate': [propertyA, propertyB] = [a.firstInstallmentDate, b.firstInstallmentDate]; break;
                case 'annualPremium': [propertyA, propertyB] = [a.annualPremium, b.annualPremium]; break;
                case 'installmentPremium': [propertyA, propertyB] = [a.installmentPremium, b.installmentPremium]; break;
                case 'expiryDate': [propertyA, propertyB] = [a.expiryDate, b.expiryDate]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}