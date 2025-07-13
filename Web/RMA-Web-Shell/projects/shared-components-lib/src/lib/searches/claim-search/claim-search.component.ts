import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { ClaimSearchDataSource } from './claim-search.datasource';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimSearchResult } from './claim-search-result.model';

@Component({
    selector: 'claim-search',
    templateUrl: './claim-search.component.html',
    styleUrls: ['./claim-search.component.css']
})
export class ClaimSearchComponent implements OnInit {

    @Input() title = 'Claims';

    @Output() claimSelectedEmit: EventEmitter<ClaimSearchResult> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: ClaimSearchDataSource;

    form: any;

    searchTerm = '';
    selectedClaim: ClaimSearchResult;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly claimService: ClaimCareService
    ) {
        this.dataSource = new ClaimSearchDataSource(this.claimService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.paginator.pageIndex = 0;
        this.searchTerm = searchTerm;
        !this.searchTerm || this.searchTerm === '' ? this.getData() : this.searchTerm?.length >= 3 ? this.getData() : null;
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    claimSelected($event: ClaimSearchResult) {
        this.selectedClaim = $event;
        this.claimSelectedEmit.emit(this.selectedClaim);
    }

    reset() {
        this.searchTerm = null;
        this.selectedClaim = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'eventReferenceNumber', show: true },
            { def: 'eventDate', show: true },
            { def: 'member', show: true },
            { def: 'claimant', show: true },
            { def: 'personEventReferenceNumber', show: true },
            { def: 'claimReferenceNumber', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}