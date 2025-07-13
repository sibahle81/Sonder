import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { RolePlayerSearchDataSource } from './role-player-search.datasource';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';

@Component({
    selector: 'role-player-search',
    templateUrl: './role-player-search.component.html',
    styleUrls: ['./role-player-search.component.css']
})
export class RolePlayerSearchComponent extends PermissionHelper implements OnInit {
    @Input() basicMode = false;

    @Input() rolePlayerIdentificationTypes: RolePlayerIdentificationTypeEnum[] =
        [
            RolePlayerIdentificationTypeEnum.Company,
            RolePlayerIdentificationTypeEnum.HealthCareProvider,
            RolePlayerIdentificationTypeEnum.LegalPractitioner,
            RolePlayerIdentificationTypeEnum.Person,
            RolePlayerIdentificationTypeEnum.SundryServiceProvider
        ];

    @Output() rolePlayerSelectedEmit = new EventEmitter<RolePlayer>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: RolePlayerSearchDataSource;

    form: any;

    searchTerm = '';
    selectedRolePlayer: RolePlayer;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly rolePlayerService: RolePlayerService,
    ) {
        super();
        this.dataSource = new RolePlayerSearchDataSource(this.rolePlayerService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getLookups();
    }

    getLookups() {
        this.rolePlayerIdentificationTypes = this.ToArray(RolePlayerIdentificationTypeEnum);
        this.getData();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            rolePlayerIdentificationTypeFilter: [{ value: null, disabled: false }],
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

    rolePlayerSelected(rolePlayer: RolePlayer) {
        this.selectedRolePlayer = rolePlayer;
        this.rolePlayerSelectedEmit.emit(this.selectedRolePlayer);
    }

    rolePlayerIdentificationTypeFilterChanged($event: RolePlayerIdentificationTypeEnum) {
        this.dataSource.rolePlayerIdentificationTypeId = +RolePlayerIdentificationTypeEnum[$event];
        this.search(this.searchTerm)
    }

    reset() {
        this.searchTerm = null;
        this.selectedRolePlayer = null;

        this.dataSource.rolePlayerIdentificationTypeId = 0;

        this.form.controls.rolePlayerIdentificationTypeFilter.reset();

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getClientType(clientType: ClientTypeEnum): string {
        return this.formatLookup(ClientTypeEnum[clientType]);
    }

    getRolePlayerIdentificationType(rolePlayerIdentificationType: RolePlayerIdentificationTypeEnum): string {
        return this.formatLookup(RolePlayerIdentificationTypeEnum[rolePlayerIdentificationType]);
    }

    getIndustryClass(industryClass: IndustryClassEnum) {
        return this.formatLookup(IndustryClassEnum[industryClass]);
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'finpayeeNumber', show: true },
            { def: 'displayName', show: true },
            { def: 'uniqueIdentifier', show: true },
            { def: 'rolePlayerIdentificationType', show: true },
            { def: 'clientType', show: true },
            { def: 'industryClass', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
