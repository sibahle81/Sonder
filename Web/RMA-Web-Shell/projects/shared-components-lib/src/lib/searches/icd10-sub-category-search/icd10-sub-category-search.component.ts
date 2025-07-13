import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { Icd10SubCategorySearchDataSource } from './icd10-sub-category-search.datasource';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';

@Component({
    selector: 'icd10-sub-category-search',
    templateUrl: './icd10-sub-category-search.component.html',
    styleUrls: ['./icd10-sub-category-search.component.css']
})

export class Icd10SubCategorySearchComponent extends PermissionHelper implements OnInit, OnChanges {

    @Input() triggerReset: boolean; // if toggled the component will reset

    @Output() icd10SubCategorySelectedEmit = new EventEmitter<ICD10SubCategory>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: Icd10SubCategorySearchDataSource;

    form: any;

    searchTerm = '';
    selectedICD10SubCategory: ICD10SubCategory;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly icd10CodeService: ICD10CodeService,
    ) {
        super();
        this.dataSource = new Icd10SubCategorySearchDataSource(this.icd10CodeService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.getData();
        }
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

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    }

    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (!this.searchTerm || this.searchTerm === '') {
            this.paginator.pageIndex = 0;
            this.getData();
        } else {
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    icd10SubCategorySelected($event: ICD10SubCategory) {
        this.selectedICD10SubCategory = $event;
        this.icd10SubCategorySelectedEmit.emit(this.selectedICD10SubCategory);
    }

    reset() {
        this.searchTerm = null;
        this.selectedICD10SubCategory = null;

        this.icd10SubCategorySelectedEmit.emit(this.selectedICD10SubCategory);

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
            { def: 'icd10SubCategoryCode', show: true },
            { def: 'icd10SubCategoryDescription', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
