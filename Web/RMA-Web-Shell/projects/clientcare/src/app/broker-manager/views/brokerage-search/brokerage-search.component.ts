import { Component, OnInit, ViewChild, ElementRef, AfterViewInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';

import { BrokerageSearchDataSource } from '../../datasources/brokerage-search.datasource';
import { Brokerage } from '../../models/brokerage';
import { BrokerageService } from '../../services/brokerage.service';
import { BrokerageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/brokerage-type-enum';

@Component({
    selector: 'brokerage-search',
    templateUrl: './brokerage-search.component.html',
    styleUrls: ['./brokerage-search.component.css']
})
export class BrokerageSearchComponent implements OnInit, AfterViewInit {
    form: UntypedFormGroup;

    displayedColumns = ['name', 'code', 'fspNumber', 'actions'];
    currentQuery: string;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: BrokerageSearchDataSource;
    @Input() isBinderPartnerSearch : boolean;

    constructor(
        public readonly brokerageService: BrokerageService,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.dataSource = new BrokerageSearchDataSource(this.brokerageService,this.isBinderPartnerSearch);
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

    onSelect(item: Brokerage): void {
        this.router.navigate(['clientcare/broker-manager/brokerage-details', item.id]);
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

