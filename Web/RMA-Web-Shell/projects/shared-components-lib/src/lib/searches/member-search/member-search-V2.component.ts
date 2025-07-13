import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MemberSearchV2DataSource } from './member-search-V2.datasource';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';

@Component({
    selector: 'member-search-V2',
    templateUrl: './member-search-V2.component.html',
    styleUrls: ['./member-search-V2.component.css']
})
export class MemberSearchV2Component extends PermissionHelper implements OnInit {

    editPermission = 'Edit Member Details';
    viewPermission = 'View Member Details';
    viewSlaPermission = 'View SLA';

    @Input() title = 'Search Members';
    @Input() basicMode = false;
    @Input() triggerReset: boolean;
    @Input() clientType: ClientTypeEnum;

    @Output() memberSelectedEmit = new EventEmitter<RolePlayer>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    industryClasses: IndustryClassEnum[];
    clientTypes: ClientTypeEnum[];

    slaItemType = SLAItemTypeEnum.Member;

    dataSource: MemberSearchV2DataSource;

    form: any;

    searchTerm = '';
    selectedMember: RolePlayer;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly memberService: MemberService,
    ) {
        super();
        this.dataSource = new MemberSearchV2DataSource(this.memberService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getLookups();
    }

    getLookups() {
        this.industryClasses = this.ToArray(IndustryClassEnum);
        this.clientTypes = this.ToArray(ClientTypeEnum);
        this.setForm();
        this.getData();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            industryClassFilter: [{ value: null, disabled: false }],
            clientTypeFilter: [{ value: null, disabled: false }],
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    setForm(): void{
        if(this.clientType)
        {
            this.dataSource.clientTypeId = +this.clientType;
            this.form.controls.clientTypeFilter.value = ClientTypeEnum[this.clientType];
        }
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

    memberSelected(member: RolePlayer) {
        this.selectedMember = member;
        this.memberSelectedEmit.emit(this.selectedMember);
    }

    industryClassFilterChanged($event: IndustryClassEnum) {
        this.dataSource.industryClassId = +IndustryClassEnum[$event];
        this.search(this.searchTerm)
    }

    clientTypeFilterChanged($event: ClientTypeEnum) {
        this.dataSource.clientTypeId = +ClientTypeEnum[$event];
        this.search(this.searchTerm)
    }

    reset() {
        this.searchTerm = null;
        this.selectedMember = null;

        this.dataSource.industryClassId = 0;
        this.dataSource.clientTypeId = 0;

        this.form.controls.industryClassFilter.reset();
        this.form.controls.clientTypeFilter.reset();

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

    getClientType(clientType: ClientTypeEnum) {
        return this.formatLookup(ClientTypeEnum[clientType]);
    }

    getIndustryClass(industryClass: IndustryClassEnum) {
        return this.formatLookup(IndustryClassEnum[industryClass]);
    }

    formatLookup(lookup: string): string {
        if (!lookup || lookup == '') { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'finpayeeNumber', show: true },
            { def: 'displayName', show: true },
            { def: 'clientType', show: true },
            { def: 'industryClass', show: true },
            { def: 'compensationFundReferenceNumber', show: true },
            { def: 'companyRegistrationNumber', show: true },
            { def: 'sla', show: this.userHasPermission(this.viewSlaPermission) && (this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10) },
            { def: 'actions', show: (this.userHasPermission(this.viewPermission) || this.userHasPermission(this.editPermission)) }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
