import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { DebtorSearchDataSource } from './debtor-search.datasource';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';

@Component({
    selector: 'debtor-search',
    templateUrl: './debtor-search.component.html',
    styleUrls: ['./debtor-search.component.css']
})

export class DebtorSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    @Input() industryClassId: number; // default is all unless overridden by input
    @Input() triggerReset: boolean;
    @Input() title ='Search Debtors'; // default is all unless overridden by input

    @Output() debtorSelectedEmit = new EventEmitter<RolePlayer>();
    @Output() resetEmit = new EventEmitter<boolean>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: DebtorSearchDataSource;

    form: any;

    searchTerm = '';
    selectedDebtor: RolePlayer;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly rolePlayerService: RolePlayerService,
    ) {
        super();
        this.dataSource = new DebtorSearchDataSource(this.rolePlayerService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.triggerReset && (changes.triggerReset.currentValue === false || changes.triggerReset.currentValue === true)) {
            this.reset();
        } else {
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
    }

    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (!this.searchTerm || this.searchTerm === '') {
            this.paginator.pageIndex = 0;
            this.getData();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        this.dataSource.industryClassId = this.industryClassId ? this.industryClassId : 0;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    memberSelected(member: RolePlayer) {
        this.selectedDebtor = member;
        this.debtorSelectedEmit.emit(this.selectedDebtor);
    }

    reset() {
        this.searchTerm = null;
        this.selectedDebtor = null;

        if (this.form) {
            this.form.patchValue({
                searchTerm: this.searchTerm
            });
        }

        this.getData();

        this.debtorSelectedEmit.emit(null);
        this.resetEmit.emit(!this.triggerReset);
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    getClientType(clientType: ClientTypeEnum) {
        return this.formatLookup(ClientTypeEnum[clientType]);
    }

    getIndustryClass(industryClass: IndustryClassEnum) {
        return this.formatLookup(IndustryClassEnum[industryClass]);
    }

    formatLookup(lookup: string) {
        return lookup ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2') : 'N/A';
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'finpayeeNumber', show: true },
            { def: 'displayName', show: true },
            { def: 'clientType', show: true },
            { def: 'industryClass', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
