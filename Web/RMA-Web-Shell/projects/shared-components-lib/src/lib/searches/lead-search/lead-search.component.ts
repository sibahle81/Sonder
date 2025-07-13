import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { LeadSearchDataSource } from './lead-search.datasource';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { Router } from '@angular/router';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';
import { UserSearchDialogComponent } from '../../dialogs/user-search-dialog/user-search-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'lead-search',
    templateUrl: './lead-search.component.html',
    styleUrls: ['./lead-search.component.css']
})

export class LeadSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    addPermission = 'Add Lead';
    editPermission = 'Edit Lead';
    viewPermission = 'View Lead';

    @Input() basicMode = true;
    @Input() triggerReset: boolean;

    @Output() leadSelectedEmit = new EventEmitter<Lead>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: LeadSearchDataSource;

    form: any;

    searchTerm = '';
    selectedLead: Lead;

    leadStatuses: LeadClientStatusEnum[];

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly leadService: LeadService,
        private readonly router: Router,
        public dialog: MatDialog
    ) {
        super();
        this.dataSource = new LeadSearchDataSource(this.leadService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getLookups();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.getData();
        }
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            leadStatusFilter: [{ value: null, disabled: false }],
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    getLookups() {
        this.leadStatuses = this.ToArray(LeadClientStatusEnum);
        this.getData();
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
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    leadStatusFilterChanged($event: LeadClientStatusEnum) {
        this.dataSource.leadStatusId = +LeadClientStatusEnum[$event];
        this.search(this.searchTerm)
    }

    getClientType(clientType: ClientTypeEnum): string {
        return this.formatLookup(ClientTypeEnum[+clientType]);
    }

    getLeadClientStatus(leadClientStatus: LeadClientStatusEnum): string {
        return this.formatLookup(LeadClientStatusEnum[+leadClientStatus]);
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

    leadSelected(lead: Lead) {
        this.selectedLead = lead;
        this.leadSelectedEmit.emit(this.selectedLead);
    }

    reset() {
        this.searchTerm = null;
        this.selectedLead = null;

        this.dataSource.leadStatusId = 0;
        this.form.controls.leadStatusFilter.reset();

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    navigate() {
        this.router.navigate([`/clientcare/lead-manager/lead-view`]);
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'code', show: true },
            { def: 'displayName', show: true },
            { def: 'clientType', show: true },
            { def: 'registrationNumber', show: true },
            { def: 'compensationFundReferenceNumber', show: true },
            { def: 'compensationFundRegistrationNumber', show: true },
            { def: 'leadClientStatus', show: true },
            { def: 'assignedTo', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'assignedToConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'actions', show: (this.userHasPermission(this.viewPermission) || this.userHasPermission(this.editPermission)) }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    openUserSearchDialog() {
        const dialogRef = this.dialog.open(UserSearchDialogComponent, {
            width: '70%',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.form.patchValue({
                    searchTerm: result.email
                });
                this.search(result.email);
            }
        });
    }
}
