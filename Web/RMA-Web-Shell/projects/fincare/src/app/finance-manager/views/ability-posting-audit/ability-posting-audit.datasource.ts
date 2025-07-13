import { AbilityPostingAudit } from '../../models/ability-posting-audit.model';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AbilityPostingService } from '../../services/ability-posting.service';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PaymentService } from '../../../payment-manager/services/payment.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AbilityPostingAuditDatasource extends Datasource {
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<AbilityPostingAudit[]> = new BehaviorSubject<AbilityPostingAudit[]>([]);

    filteredData: AbilityPostingAudit[] = [];
    renderedData: AbilityPostingAudit[] = [];
    postedPayments: AbilityPostingAudit[];
    paginator: MatPaginator;
    sort: MatSort;

    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): AbilityPostingAudit[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }
    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly paymentService: PaymentService,
        private readonly policyService: PolicyService,
        private readonly abilityPostingService: AbilityPostingService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'product';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(reference: string): void {
        this.startLoading('Loading transaction details...');
        this.getDataWithReferenceNumber(reference);
    }

    getDataWithReferenceNumber(reference: string): void {
        this.postedPayments = new Array();
        this.abilityPostingService.getPostedPaymentsByReference(reference).subscribe(
            data => {
                for (let i = 0; i < data.length; i++) {
                    const line = data[i];
                    if (line.paymentType === 0) {
                        line.paymentTypeDesc = 'Unknown';
                    }
                    if (line.paymentType === 1) {
                        line.paymentTypeDesc = 'Claim';
                    }
                    if (line.paymentType === 2) {
                        line.paymentTypeDesc = 'Commission';
                    }
                    if (line.paymentType === 3) {
                        line.paymentTypeDesc = 'Refund';
                    }
                    if (line.paymentType === 22) {
                        line.paymentTypeDesc = 'PRMA';
                    }
                    this.postedPayments.push(line);
                    this.dataChange.next(this.postedPayments);
                }
                this.isLoading = false;
                this.paginator.length = this.data.length;
                this.stopLoading();
            }, error => {
                this.showError(error);
                this.isLoading = false;
            }
        );
    }

    getPolicy(paymentId: number): Policy {
        const policy = new Policy();
        this.paymentService.getPayment(paymentId).subscribe(payment => {
            if (payment.policyId !== null) {
                this.policyService.getPolicy(payment.policyId).subscribe(result => {
                    result = policy;
                });
            }
        });
        return policy;
    }

    connect(): Observable<AbilityPostingAudit[]> {
        const displayDataChanges = [
            this.dataChange,
            // this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: AbilityPostingAudit) => {
                const searchStr = (item.reference).toLowerCase() + (item.payeeDetails).toString().toLowerCase();
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
    getSortedData(data: AbilityPostingAudit[]): AbilityPostingAudit[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this.sort.active) {
                case 'product': [propertyA, propertyB] = [a.accountDetails, b.accountDetails]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}
