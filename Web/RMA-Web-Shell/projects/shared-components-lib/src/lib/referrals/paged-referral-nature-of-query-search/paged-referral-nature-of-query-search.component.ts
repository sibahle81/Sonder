import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralNatureOfQuery } from 'projects/shared-models-lib/src/lib/referrals/referral-nature-of-query';
import { PagedReferralNatureOfQuerySearchDataSource } from './paged-referral-nature-of-query-search.datasource';
import { RoleSearchDialogComponent } from '../../dialogs/role-search-dialog/role-search-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

@Component({
    selector: 'paged-referral-nature-of-query-search',
    templateUrl: './paged-referral-nature-of-query-search.component.html',
    styleUrls: ['./paged-referral-nature-of-query-search.component.css']
})
export class PagedReferralNatureOfQuerySearchComponent extends PermissionHelper implements OnInit, OnChanges {

    configureReferralNatureOfQueryPermission = 'Configure Referral Nature Of Query';

    @Input() isConfigurationMode: boolean; // optional: use only if you want to allow user to configure the responsible role
    @Input() targetModuleType: ModuleTypeEnum; // optional: use only if you want lock the search results to the targeted module 
    @Output() referralNatureOfQuerySelectedEmit: EventEmitter<ReferralNatureOfQuery> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: PagedReferralNatureOfQuerySearchDataSource;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    form: any;

    searchTerm = '';
    selectedReferralNatureOfQuery: ReferralNatureOfQuery;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly referralService: ReferralService,
        public readonly dialog: MatDialog
    ) {
        super();
        this.dataSource = new PagedReferralNatureOfQuerySearchDataSource(this.referralService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.targetModuleType) {
            this.dataSource.targetModuleType = this.targetModuleType;
        }

        this.getData();
    }

    createForm(): void {
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
        if (!this.searchTerm || this.searchTerm.length > 2) {
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

    referralNatureOfQuerySelected(referralNatureOfQuery: ReferralNatureOfQuery) {
        this.selectedReferralNatureOfQuery = referralNatureOfQuery;
        this.referralNatureOfQuerySelectedEmit.emit(this.selectedReferralNatureOfQuery);
    }

    reset() {
        this.searchTerm = null;
        this.selectedReferralNatureOfQuery = null;

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

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'name', show: true },
            { def: 'moduleTypeId', show: true },
            { def: 'roleId', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    getModuleType(moduleType: ModuleTypeEnum) {
        return this.formatLookup(ModuleTypeEnum[moduleType]);
    }

    openRoleSearchDialog($event: ReferralNatureOfQuery) {
        const dialogRef = this.dialog.open(RoleSearchDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                title: 'Configuration: Assign Default Responsible Role'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading$.next(true);
                $event.roleId = result.id;
                this.referralService.updateReferralNatureOfQuery($event).subscribe(result => {
                    this.getData();
                    this.isLoading$.next(false);
                });
            }
        });
    }

    openConfirmationDialog($event: ReferralNatureOfQuery) {
        const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
          width: '40%',
          disableClose: true,
          data: {
            title: 'Remove configured responsible role?',
            text: `Are you sure you want to proceed?`
          }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.removeConfiguredRole($event);
          }
        });
      }

    removeConfiguredRole(referralNatureOfQuery: ReferralNatureOfQuery) {
        this.isLoading$.next(true);
        referralNatureOfQuery.roleId = null;
        this.referralService.updateReferralNatureOfQuery(referralNatureOfQuery).subscribe(result => {
            this.getData();
            this.isLoading$.next(false);
        });
    }
}
