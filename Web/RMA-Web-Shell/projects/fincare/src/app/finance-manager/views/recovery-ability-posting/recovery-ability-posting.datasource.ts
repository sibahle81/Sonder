import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { OnInit, Injectable } from '@angular/core';
import { ProductCrossRefTranType } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.model';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AbilityCollections } from '../../../billing-manager/models/ability-collections';
import { AbilityCollectionsAudit } from '../../../billing-manager/models/ability-collections-audit';
import { ProductCrossRefTranTypeService } from '../../services/productCrossRefTranType.service';


@Injectable()
export class RecoveryAbilityPostingDatasource extends Datasource implements OnInit {
    isLoading = true;
    isError = false;
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    productCrossRefTranTypes: ProductCrossRefTranType[];
    abilityPostingAudits: AbilityCollectionsAudit[];
    isEnabled = false;
    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
        private readonly datePipe: DatePipe,
        private readonly router: Router,
        private readonly abilityCollectionsService: AbilityCollectionsService) {
        super(appEventsManager, alertService);
    }

    ngOnInit() {
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(): void {
        this.getAbilityPostings();
    }

    getAbilityPostings(): void {
        this.startLoading('Loading recovery postings...');
        this.isLoading$.next(true);
        this.abilityCollectionsService.getAbilityRecoveryCollections().subscribe(
            data => {
                    // tslint:disable-next-line: prefer-for-of
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].isProcessed === true) {
                        data[i].processed = 'Yes';
                    } else {
                        data[i].processed = 'No';
                    }
                }
                    if (data.find(x => x.isProcessed === false)) {
                this.isEnabled = true;
            }
                    this.dataChange.next(data);
                    this.isLoading$.next(false);
                    this.paginator.length = data.length;
                    this.stopLoading();
          }, error => { this.showError(error); this.isLoading$.next(false); });
        }

    getProductCrossRefTranTypes() {
        this.productCrossRefTranTypes = new Array();
        this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(refs => {
            this.productCrossRefTranTypes = refs;
        });
    }

      connect(): Observable<AbilityCollections[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: AbilityCollections) => {
                const searchStr = (item.reference).toLowerCase() + (item.chartIsNo).toString().toLowerCase() + (item.chartBsNo).toString().toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }

    disconnect() { }
}
