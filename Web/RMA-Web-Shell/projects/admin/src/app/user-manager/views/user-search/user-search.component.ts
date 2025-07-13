import { Component,  OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserSearchDataSource } from './user-search.datasource';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';

@Component({
    templateUrl: './user-search.component.html',
    styleUrls: ['./user-search.component.css'],
// tslint:disable-next-line: component-selector
    selector: 'user-search'
})
export class UserSearchComponent implements OnInit, AfterViewInit {
    form: UntypedFormGroup;
    currentQuery: string;
    displayedColumns = ['displayName', 'email', 'roleName', 'status', 'actions'];

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: UserSearchDataSource;

    constructor(
        public readonly userService: UserService,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.dataSource = new UserSearchDataSource(this.userService);
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

    onSelect(item: User): void {
        this.router.navigate(['user-manager/user-details', item.id]);
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
