import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { CityRetrieval } from 'projects/shared-models-lib/src/lib/common/city-retrieval.model';
import { CitySearchDataSource } from './city-search.datasource';
import { AddressService } from 'projects/shared-services-lib/src/lib/services/address/address.service';

@Component({
    selector: 'city-search',
    templateUrl: './city-search.component.html',
    styleUrls: ['./city-search.component.css']
})

export class CitySearchComponent extends UnSubscribe implements OnInit {

    @Output() citySelectedEmit: EventEmitter<CityRetrieval> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedCity: CityRetrieval;
    dataSource: CitySearchDataSource;
    form: any;
    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly addressService: AddressService
    ) {
        super();
        this.dataSource = new CitySearchDataSource(this.addressService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (this.searchTerm && this.searchTerm !== '') {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    citySelected(city: CityRetrieval) {
        this.selectedCity = city;
        this.selectedCity.city = this.formatSentenceCase(this.selectedCity.city)
        this.citySelectedEmit.emit(this.selectedCity);
    }

    reset() {
        this.searchTerm = null;
        this.selectedCity = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    formatSentenceCase(text: string): string {
        return text.charAt(0).toLocaleUpperCase() + text.substring(1).toLowerCase();
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'code', show: true },
            { def: 'suburb', show: true },
            { def: 'city', show: true },
            { def: 'province', show: true },
            { def: 'actions', show: true },
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
