import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { CampaignSearchDataSource } from './campaign-search.datasource';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';


@Component({
    templateUrl: './campaign-search.component.html',

    selector: 'campaign-search'
})
export class CampaignSearchComponent implements OnInit, AfterViewInit {
    form: UntypedFormGroup;
    currentQuery: string;

    displayedColumns = ['name', 'description', 'status', 'startDate', 'actions'];
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: CampaignSearchDataSource;
    constructor(
        public readonly campaignService: CampaignService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.dataSource = new CampaignSearchDataSource(this.campaignService);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => {
                    this.currentQuery = this.filter.nativeElement.value;
                    if (this.currentQuery.length >= 3) {
                        this.paginator.pageIndex = 0;
                        this.loadData();
                    }
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadData())
            )
            .subscribe();
    }

    onSelect(item: Campaign): void {
        this.router.navigate(['campaign-manager/campaign-details', item.id]);
    }

    search() {
        this.paginator.pageIndex = 0;
        this.loadData();
    }

    loadData(): void {
        this.currentQuery = this.filter.nativeElement.value;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
}
