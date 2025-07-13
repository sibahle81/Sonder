import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';import { GroupSearchDataSource } from './group-search.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Group } from '../../../client-manager/shared/Entities/group';
import { GroupService } from '../../../client-manager/shared/services/group.service';

@Component({
    templateUrl: './group-search.component.html',
    selector: 'group-search',
    styleUrls: ['./group-search.component.css']
})
export class GroupSearchComponent implements OnInit, AfterViewInit {
    currentQuery: string;
    displayedColumns = ['name', 'registrationNumber', 'actions'];

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: GroupSearchDataSource;

    constructor(
        public readonly groupService: GroupService,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.dataSource = new GroupSearchDataSource(this.groupService);
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

    onSelect(item: Group): void {
        this.router.navigate(['clientcare/client-manager/group-details', item.id]);
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
