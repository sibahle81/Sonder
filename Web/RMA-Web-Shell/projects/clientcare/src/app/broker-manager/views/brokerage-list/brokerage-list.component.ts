// tslint:disable-next-line: no-reference
import { Component,  OnInit, ViewChild, ElementRef } from '@angular/core';
import { BreadcrumbBrokerService } from '../../services/breadcrumb-broker.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BenefitSearchDataSource } from '../../../product-manager/datasources/benefit-search.datasource';

@Component({
    selector: 'brokerage-list',
    templateUrl: './brokerage-list.component.html',
})
export class BrokerageListComponent implements OnInit {
    currentQuery: string;
    displayedColumns = ['name', 'code', 'actions'];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;
    dataSource: BenefitSearchDataSource;
    isBinderPartnerSearch: boolean = false;
    constructor(private readonly breadcrumbService: BreadcrumbBrokerService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a brokerage');
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
