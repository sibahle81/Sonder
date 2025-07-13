import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { HealthCareProviderSearchDataSource } from './health-care-provider-search.datasource';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';

@Component({
    selector: 'health-care-provider-search-V2',
    templateUrl: './health-care-provider-search.component.html',
    styleUrls: ['./health-care-provider-search.component.css']
})

export class HealthcareProviderSearchComponentV2 implements OnInit {
    @Input() triggerReset: boolean;

    @Output() healthCareProviderSelectedEmit = new EventEmitter<HealthCareProvider>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;


    dataSource: HealthCareProviderSearchDataSource;

    form: any;

    searchTerm = '';
    selectedHealthCareProvider: HealthCareProvider;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly healthCareProviderService: HealthcareProviderService,
    ) {
        this.dataSource = new HealthCareProviderSearchDataSource(this.healthCareProviderService);
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
        if (!this.searchTerm || this.searchTerm === '') {
            this.getData();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    healthCareProviderSelected(healthCareProvider: HealthCareProvider) {
        this.selectedHealthCareProvider = healthCareProvider;
        this.healthCareProviderSelectedEmit.emit(this.selectedHealthCareProvider);
    }

    reset() {
        this.searchTerm = null;
        this.selectedHealthCareProvider = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'practiceNumber', show: true },
            { def: 'name', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
