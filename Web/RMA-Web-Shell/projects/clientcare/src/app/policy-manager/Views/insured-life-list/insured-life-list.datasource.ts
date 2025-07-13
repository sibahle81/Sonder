import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { InsuredLife } from '../../shared/entities/insured-life';
import { Policy } from '../../shared/entities/policy';
import { InsuredLifePolicyProductService } from '../../shared/services/insured-life-policy-product.service';
import { InsuredLifePolicyProduct } from '../../shared/entities/insured-life-policy-product';
import { InsuredLifeService } from '../../shared/Services/insured-life.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { map } from 'rxjs/operators';

@Injectable()
export class InsuredLifeListDatasource extends Datasource {
    insuredLives: InsuredLife[];
    insuredLifePolicyProducts: InsuredLifePolicyProduct[];
    policies: Policy[];
    counter = 0;

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly insuredLifeService: InsuredLifeService,
        private readonly insuredLifePolicyProductService: InsuredLifePolicyProductService,
        private readonly policyService: PolicyService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'policyNumber';
    }

    getData(): void {
        this.startLoading('Loading insured lives...');
        this.counter = 0;
        this.getInsuredLives();
        this.getInsuredLifePolicyProducts();
        this.getPolicies();
    }

    getInsuredLives(): void {
        this.insuredLifeService.getInsuredLives().subscribe(
            insuredLives => {
                this.insuredLives = insuredLives;
                this.done();
            },
            error => this.showError(error));
    }

    getInsuredLifePolicyProducts(): void {
        this.insuredLifePolicyProductService.getInsuredLifePolicyProducts().subscribe(
            insuredLifePolicyProducts => {
                this.insuredLifePolicyProducts = insuredLifePolicyProducts;
                this.done();
            },
            error => this.showError(error));
    }

    getPolicies(): void {
        this.policyService.getPolicies().subscribe(
            policies => {
                this.policies = policies;
                this.done();
            },
            error => this.showError(error));
    }

    done(): void {
        this.counter++;
        if (this.counter !== 3) { return; }

        this.insuredLives.forEach(insuredLife => {

            const insuredLifePolicyProduct = this.insuredLifePolicyProducts.find(policyProduct => policyProduct.insuredLifeId === insuredLife.id);
            if (insuredLifePolicyProduct != null) {

                const insuredLifePolicy = this.policies.find(policy => policy.id === insuredLifePolicyProduct.policyId);
                if (insuredLifePolicy != null) {
                    insuredLife.policyNumber = insuredLifePolicy.policyNumber;
                } else {
                    insuredLife.policyNumber = 'N/a';
                }
            }
        });

        this.dataChange.next(this.insuredLives);
        this.stopLoading();
    }

    connect(): Observable<InsuredLife[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: InsuredLife) => {
                const searchStr = (item.policyNumber + item.name + item.surname + item.email).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
