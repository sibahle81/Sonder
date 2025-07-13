import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { StagedClientRatesSearchDataSource } from './staged-client-rates-search.datasource';
import { LoadRate } from 'projects/clientcare/src/app/policy-manager/shared/entities/load-rate';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';

@Component({
    selector: 'staged-client-rates-search',
    templateUrl: './staged-client-rates-search.component.html',
    styleUrls: ['./staged-client-rates-search.component.css']
})

export class StagedClientRatesSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    approvalPermission = 'Approve Staged Member Rates';

    @Input() memberNumber: string;

    @Output() rateSelectedEmit = new EventEmitter<LoadRate>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: StagedClientRatesSearchDataSource;

    form: any;

    searchTerm = '';
    selectedRate: LoadRate;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly declarationService: DeclarationService,
        public dialog: MatDialog
    ) {
        super();
        this.dataSource = new StagedClientRatesSearchDataSource(this.declarationService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!String.isNullOrEmpty(this.memberNumber)) {
            this.search(this.memberNumber);
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

    rateSelected(rate: LoadRate) {
        this.selectedRate = rate;
        this.rateSelectedEmit.emit(this.selectedRate);
    }

    reset() {
        this.searchTerm = null;
        this.selectedRate = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getCategoryInsured(categoryInsured: CategoryInsuredEnum) {
        return this.formatLookup(CategoryInsuredEnum[categoryInsured]);
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
            { def: 'memberNo', show: true },
            { def: 'product', show: true },
            { def: 'ratingYear', show: true },
            { def: 'category', show: true },
            { def: 'rate', show: true },
            { def: 'modifiedBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'modifiedByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'modifiedDate', show: true },
            { def: 'actions', show: false } // (this.userHasPermission(this.approvalPermission)) }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
