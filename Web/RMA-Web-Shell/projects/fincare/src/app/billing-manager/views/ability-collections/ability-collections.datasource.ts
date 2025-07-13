import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { OnInit, Injectable } from '@angular/core';
import { AbilityCollections } from '../../models/ability-collections';
import { AbilityCollectionsAudit } from '../../models/ability-collections-audit';
import { ProductCrossRefTranType } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.service';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable()
export class AbilityCollectionsDatasource extends Datasource implements OnInit {
    isLoading = true;
    isError = false;
    filterChange = new BehaviorSubject('');
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    dataChange: BehaviorSubject<AbilityCollections[]> = new BehaviorSubject<AbilityCollections[]>([]);
    filteredData: AbilityCollections[] = [];
    renderedData: AbilityCollections[] = [];
    paginator: MatPaginator;
    productCrossRefTranTypes: ProductCrossRefTranType[];
    abilityPosting: AbilityCollections;
    ProductCrossRefTranTypes: ProductCrossRefTranType[];
    abilityPostingAudit: AbilityCollectionsAudit;
    abilityPostingAudits: AbilityCollectionsAudit[];
    companyNo : number;
    branchNo :  number;
    controlName : string;
    controlNumber: number;
    endDate : Date;
    startDate: Date;
    sort: MatSort;
    isEnabled = false;
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): AbilityCollections[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }

    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
        private readonly datePipe: DatePipe,
        private readonly router: Router,
        //private readonly paymentService: PaymentService,
        private readonly abilityCollectionsService: AbilityCollectionsService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'name';
    }

    ngOnInit() {       
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    setBranchNo(branchNo: number) : void
    { this.branchNo = branchNo;}

     setCompanyNo(companyNo: number) 
    { this.companyNo = companyNo;}

    setControlName(controlName: string) : void
    { this.controlName = controlName;}

    setDateRange(startDate: Date, endDate: Date): void
    { 
        this.startDate = startDate;
        this.endDate = endDate;

    }
    setControlNumber(controlNumber: number) {
        this.controlNumber = controlNumber;
    }
    
    getData(): void {
        this.getAbilityPostings();
    }

   

    applyFilters(filters: any): void {
        this.companyNo = filters.companyNo;
        this.branchNo = filters.branchNo;
        this.controlNumber = filters.controlNo;
        this.startDate = filters.startDate ? new Date(filters.startDate) : null;
        this.endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        this.getData();
    }

    clearFilters(): void {
        this.companyNo = -1;
        this.branchNo = -1;
        this.controlNumber = -1;
        this.startDate = null;
        this.endDate = null;
        
        this.getData();
    }

    getAbilityPostings(): void {
        this.startLoading('Loading postings...');
        this.isLoading$.next(true);
        this.abilityCollectionsService.getAbilityCollectionsByCompanyNoAndBranchNo(
            this.companyNo, 
            this.branchNo
        ).subscribe(
            data => {
                let filteredData = data;
                
                if (this.controlNumber && this.controlNumber !== -1) {
                    filteredData = filteredData.filter(item => {
                        const matches = Number(item.level3) === Number(this.controlNumber);
                        return matches;
                    });
                }

                if (this.startDate) {
                    filteredData = filteredData.filter(item => 
                        new Date(item.createdDate) >= this.startDate
                    );
                }
                
                if (this.endDate) {
                    filteredData = filteredData.filter(item => 
                        new Date(item.createdDate) <= this.endDate
                    );
                }

                for (let i = 0; i < filteredData.length; i++) {
                    if (filteredData[i].isProcessed === true) {
                        filteredData[i].processed = 'Yes';
                    } else {
                        filteredData[i].processed = 'No';
                    }
                }

                this.dataChange.next(filteredData);
                this.isLoading$.next(false);
                this.stopLoading();
            },
            error => {
                this.alertService.error('Failed to load postings');
                this.isLoading$.next(false);
                this.stopLoading();
            }
        );
    }

    getProductCrossRefTranTypes() {
        this.ProductCrossRefTranTypes = new Array();
        this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(refs => {
            this.ProductCrossRefTranTypes = refs;
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
            
            // Only apply text filtering if there's a search term
            if (this.filter && this.filter.trim() !== '') {
                this.filteredData = this.data.slice().filter((item: AbilityCollections) => {
                    if (!item || !item.reference) return false;
                    const searchStr = (item.reference || '').toLowerCase() + 
                        (item.chartIsNo || '').toString().toLowerCase() + 
                        (item.chartBsNo || '').toString().toLowerCase();
                    return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
                });
            } else {
                // If no search term, use all data
                this.filteredData = this.data.slice();
            }

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            const endIndex = startIndex + this.paginator.pageSize;
            this.renderedData = sortedData.slice(startIndex, endIndex);
            return this.renderedData;
        }));
    }

    disconnect() { }
    /** Returns a sorted copy of the database data. */
    getSortedData(data: AbilityCollections[]): AbilityCollections[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this.sort.active) {
                case 'product': [propertyA, propertyB] = [a.level1, b.level1]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
    
}

