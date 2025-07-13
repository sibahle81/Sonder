import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ClientSearchDataSource } from './client-search.datasource';
import { Client } from '../../../client-manager/shared/Entities/client';
import { ClientService } from '../../../client-manager/shared/services/client.service';

@Component({
    selector: 'client-search',
    templateUrl: './client-search.component.html',
    styleUrls: ['./client-search.component.css']
})
export class ClientSearchComponent implements OnInit,AfterViewInit {
  form: UntypedFormGroup;
  clients: Client[];
  currentQuery: string;

    displayedColumns = ['name', 'referenceNumber', 'description', 'actions'];

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: ClientSearchDataSource;
    @Input('redirectRoute') redirectRoute;
    @Output() clientEmit: EventEmitter<Client> = new EventEmitter();

    constructor(
        public readonly clientService: ClientService,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.dataSource = new ClientSearchDataSource(this.clientService);
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

    onSelect(item: Client): void {
        if (this.redirectRoute) {
            this.router.navigate([this.redirectRoute, item.id]);
        } else {
            this.clientEmit.emit(item);
        }
    }

    search() {
        this.paginator.pageIndex = 0;
        this.loadData();
    }

    loadData(): void {
        this.currentQuery = this.filter.nativeElement.value;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }

    clearFilter(): void {
        this.form.patchValue({ query: '' });
    }
}
