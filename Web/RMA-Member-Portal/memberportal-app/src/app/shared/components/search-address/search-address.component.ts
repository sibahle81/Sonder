import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CityRetrieval } from '../../models/city-retrieval.model';
import { AddressService } from '../../services/address.service';
import { SearchAddressDataSource } from './search-address.datasource';



@Component({
    selector: 'lib-search-address',
    templateUrl: './search-address.component.html',
    styleUrls: ['./search-address.component.css']
})
export class SearchAddressComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    currentQuery: string;
    selected: CityRetrieval;

    displayedColumns = ['code', 'city', 'suburb', 'province'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('filter') filter: ElementRef;
    dataSource: SearchAddressDataSource;
    constructor(
        public readonly addressService: AddressService,
        private readonly router: Router,
        public dialogRef: MatDialogRef<SearchAddressComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.dataSource = new SearchAddressDataSource(this.addressService);
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

    onSelect(item: CityRetrieval): void {
        this.selected = item;
        this.dialogRef.close(this.selected);
    }

    search() {
        this.paginator.pageIndex = 0;
        this.loadData();
    }

    loadData(): void {
        this.currentQuery = this.filter.nativeElement.value;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
    closeDialog(): void {
        this.dialogRef.close(this.selected);
    }
}

