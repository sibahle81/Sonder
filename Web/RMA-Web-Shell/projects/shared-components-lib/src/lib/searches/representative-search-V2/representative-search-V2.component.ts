import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { RepresentativeSearchV2DataSource } from './representative-search-V2.datasource';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { RepresentativeTypeEnum } from 'projects/shared-models-lib/src/lib/enums/representative-type-enum';

@Component({
    selector: 'representative-search-V2',
    templateUrl: './representative-search-V2.component.html',
    styleUrls: ['./representative-search-V2.component.css']
})

export class RepresentativeSearchV2Component extends UnSubscribe implements OnInit {

    @Output() representativeSelectedEmit: EventEmitter<Representative> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedRepresentative: Representative;
    dataSource: RepresentativeSearchV2DataSource;
    form: any;
    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly representiveService: RepresentativeService
    ) {
        super();
        this.dataSource = new RepresentativeSearchV2DataSource(this.representiveService);
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
            this.paginator.pageIndex = 0;
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

    representativeSelected(representative: Representative) {
        this.selectedRepresentative = representative;
        this.representativeSelectedEmit.emit(this.selectedRepresentative);
    }

    reset() {
        this.searchTerm = null;
        this.selectedRepresentative = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getRepresentativeType(representativeType: RepresentativeTypeEnum) {
        return this.formatLookup(RepresentativeTypeEnum[representativeType]);
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'code', show: true },
            { def: 'name', show: true },
            { def: 'idNumber', show: true },
            { def: 'email', show: true },
            { def: 'repType', show: true },
            { def: 'actions', show: true },
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
