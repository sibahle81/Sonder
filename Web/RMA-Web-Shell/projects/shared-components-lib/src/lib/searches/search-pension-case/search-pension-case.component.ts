import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { SearchPensionCaseDataSource } from './search-pension-case.datasource';
import { PensionClaim } from '../../models/pension-case.model';
import { PMPService } from 'projects/medicare/src/app/pmp-manager/services/pmp-service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'lib-search-pension-case',
    templateUrl: './search-pension-case.component.html',
    styleUrls: ['./search-pension-case.component.css']
})
export class SearchPensionCaseComponent extends UnSubscribe implements OnInit, OnChanges {
    @Input() title = 'Search Pension Case';
    @Input() triggerReset: boolean;

    @Output() pensionCaseSelectedEmit: EventEmitter<PensionClaim> = new EventEmitter();
    @Output() triggerResearch: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedPensionCase: PensionClaim;
    dataSource: SearchPensionCaseDataSource;
    form: any;
    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly pmpService: PMPService
    ) {
        super();
        this.dataSource = new SearchPensionCaseDataSource(this.pmpService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.reset();
        }
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

        this.getData();
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
        this.triggerResearch.emit(true);
        if (!isNullOrUndefined(this.searchTerm) && this.searchTerm?.length > 0 && !(this.searchTerm === ''))
            this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    pensionCaseSelected(pensionClaim: PensionClaim) {
        this.selectedPensionCase = pensionClaim;
        this.pensionCaseSelectedEmit.emit(this.selectedPensionCase);
    }

    reset() {
        if (!this.form) { return; }

        this.searchTerm = '';

        this.form.patchValue({
            searchTerm: this.searchTerm
        });

        this.selectedPensionCase = null;
        this.pensionCaseSelectedEmit.emit(this.selectedPensionCase);

        if (this.dataSource.data && this.dataSource.data.data) {
            this.dataSource.data.data = null;
        }
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'pensionCaseNumber', show: true },
            { def: 'claimReferenceNumber', show: true },
            { def: 'drg', show: true },
            { def: 'pmpmca', show: true },
            { def: 'pmpspa', show: true },
            { def: 'action', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
