import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PagedReferralSearchDataSource } from './paged-referral-search.datasource';
import { ReferralTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-status-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ReferralSearchTypeEnum } from './referral-search-type-enum';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ReferralQuickViewDialogComponent } from './referral-quick-view-dialog/referral-quick-view-dialog.component';

@Component({
    selector: 'paged-referral-search',
    templateUrl: './paged-referral-search.component.html',
    styleUrls: ['./paged-referral-search.component.css']
})
export class PagedReferralSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    viewSlaPermission = 'View SLA';

    @Input() sourceModuleType: ModuleTypeEnum; // optional: use only if you want lock the referral search results to the source module 
    @Input() targetModuleType: ModuleTypeEnum; // optional: use only if you want lock the referral search results to the targeted module 
    //---these two optional inputs must both be passed in together when the component is in context----
    @Input() referralItemType: ReferralItemTypeEnum;
    @Input() itemId: number;
    //--------------------------------------------------------------------------------------------------
    @Input() basicMode = false; // optional: use only if you want minimal filters and columns 

    @Output() referralSelectedEmit: EventEmitter<Referral> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isSendingReminder$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    dataSource: PagedReferralSearchDataSource;

    form: any;

    searchTerm = '';
    selectedReferral: Referral;

    currentUser: User;

    referralItemTypes: ReferralItemTypeEnum[];
    referralStatuses: ReferralStatusEnum[];
    referralSearchTypes: ReferralSearchTypeEnum[];
    selectedReferralSearchType = ReferralSearchTypeEnum.All;

    slaItemType = SLAItemTypeEnum.Referral;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly referralService: ReferralService,
        private readonly authService: AuthService,
        private readonly userReminderService: UserReminderService,
        private readonly alertService: ToastrManager,
        public dialog: MatDialog
    ) {
        super();
        this.dataSource = new PagedReferralSearchDataSource(this.referralService);
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getLookups();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.sourceModuleType) {
            this.dataSource.sourceModuleType = this.sourceModuleType;
        }

        if (this.targetModuleType) {
            this.dataSource.targetModuleType = this.targetModuleType;
        }

        if (this.referralItemType) {
            this.form?.patchValue({
                referralItemTypeFilter: [{ value: ReferralItemTypeEnum[this.referralItemType] }]
            });

            this.dataSource.referralItemType = this.referralItemType;
        }

        if (this.itemId) {
            this.dataSource.itemId = this.itemId;
        }

        this.getData();
    }

    getLookups() {
        this.referralStatuses = this.ToArray(ReferralStatusEnum);
        this.referralItemTypes = this.ToArray(ReferralItemTypeEnum);
        this.referralSearchTypes = this.ToArray(ReferralSearchTypeEnum);
        this.getData();
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            referralStatusFilter: [{ value: 'All Open', disabled: false }],
            referralItemTypeFilter: [{ value: this.referralItemType ? ReferralItemTypeEnum[this.referralItemType] : 'All', disabled: this.itemId }],
            assignmentFilter: [{ value: ReferralSearchTypeEnum[this.selectedReferralSearchType], disabled: false }],
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
        if (this.selectedReferralSearchType == ReferralSearchTypeEnum.All) {
            this.dataSource.assignedByUser = null;
            this.dataSource.assignedToUser = null;
        }

        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    referralSelected(referral: Referral) {
        this.selectedReferral = referral;
        this.referralSelectedEmit.emit(this.selectedReferral);
    }

    referralStatusFilterChanged($event: ReferralStatusEnum) {
        this.dataSource.referralStatus = +ReferralStatusEnum[$event];
        this.getData();
    }

    referralItemTypeFilterChanged($event: ReferralItemTypeEnum) {
        this.dataSource.referralItemType = +ReferralItemTypeEnum[$event];
        this.getData();
    }

    assignmentFilterChanged($event: ReferralSearchTypeEnum) {
        this.selectedReferralSearchType = +ReferralSearchTypeEnum[$event];

        switch (this.selectedReferralSearchType) {
            case ReferralSearchTypeEnum.All:
                this.dataSource.sourceModuleType = this.sourceModuleType;
                this.dataSource.targetModuleType = this.targetModuleType;
                this.dataSource.assignedByUser = null;
                this.dataSource.assignedToUser = null;
                this.dataSource.assignedToRole = null;
                break;
            case ReferralSearchTypeEnum.CreatedByMe:
                this.dataSource.assignedByUser = this.currentUser;
                this.dataSource.assignedToUser = null;
                this.dataSource.assignedToRole = null;
                break;
            case ReferralSearchTypeEnum.AssignedToMe:
                this.dataSource.assignedByUser = null;
                this.dataSource.assignedToRole = this.currentUser.role;
                this.dataSource.assignedToUser = this.currentUser;
                break;
        }

        this.getData();
    }

    reset() {
        this.searchTerm = null;
        this.selectedReferral = null;

        this.dataSource.referralStatus = null;
        this.dataSource.referralItemType = this.referralItemType;
        this.form.patchValue({
            referralStatusFilter: 'All Open',
            referralItemTypeFilter: this.referralItemType ? ReferralItemTypeEnum[this.referralItemType] : 'All',
            searchTerm: this.searchTerm
        });

        this.referralSelectedEmit.emit(this.selectedReferral);
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
            { def: 'referralReferenceNumber', show: true },
            { def: 'referralItemTypeReference', show: true },
            { def: 'referralType', show: true },
            { def: 'sourceModuleTypeId', show: true },
            { def: 'targetModuleTypeId', show: true },
            { def: 'assignedByUserId', show: this.selectedReferralSearchType == ReferralSearchTypeEnum.AssignedToMe || this.selectedReferralSearchType == ReferralSearchTypeEnum.All },
            { def: 'assignedToUserId', show: this.selectedReferralSearchType == ReferralSearchTypeEnum.CreatedByMe || this.selectedReferralSearchType == ReferralSearchTypeEnum.All },
            { def: 'referralNatureOfQueryId', show: true },
            { def: 'referralStatus', show: true },
            { def: 'sla', show: (this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10) && !this.basicMode },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    getReferralType(referralType: ReferralTypeEnum) {
        return this.formatLookup(ReferralTypeEnum[referralType]);
    }

    getModuleType(moduleType: ModuleTypeEnum) {
        return this.formatLookup(ModuleTypeEnum[moduleType]);
    }

    getReferralStatus(referralStatus: ReferralStatusEnum) {
        return this.formatLookup(ReferralStatusEnum[referralStatus]);
    }

    getReferralItemType(referralItemType: ReferralItemTypeEnum) {
        return this.formatLookup(ReferralItemTypeEnum[referralItemType]);
    }

    isActionRequiredByCurrentUser($event: Referral): boolean {
        return ((($event.referralStatus === ReferralStatusEnum.New || $event.referralStatus === ReferralStatusEnum.InProgress || $event.referralStatus === ReferralStatusEnum.Disputed) && $event.assignedToUserId === this.currentUser.id)
            || ($event.referralStatus === ReferralStatusEnum.Actioned && $event.assignedByUserId === this.currentUser.id)) && !this.basicMode;
    }

    sendReminder($event: Referral) {
        this.alertService.infoToastr('Sending reminder...');

        this.isSendingReminder$.next(true);
        const userReminder = new UserReminder();

        userReminder.userReminderType = UserReminderTypeEnum.Reminder;
        userReminder.text = `Just a friendly reminder that action is required by you on referral with ref: ${$event.referralReferenceNumber}`;
        userReminder.alertDateTime = new Date().getCorrectUCTDate();
        userReminder.userReminderItemType = UserReminderItemTypeEnum.Referral;
        userReminder.itemId = $event.referralId;
        userReminder.linkUrl = $event.linkUrl ? $event.linkUrl : null;

        if (this.currentUser.id == $event.assignedByUserId) {
            userReminder.assignedByUserId = $event.assignedByUserId;
            userReminder.assignedToUserId = $event.assignedToUserId;
        } else if (this.currentUser.id == $event.assignedToUserId) {
            userReminder.assignedByUserId = $event.assignedToUserId;
            userReminder.assignedToUserId = $event.assignedByUserId;
        }

        this.userReminderService.createUserReminder(userReminder).subscribe(result => {
            this.alertService.successToastr('Reminder sent successfully...');
            this.isSendingReminder$.next(false);
        });
    }

    canSendReminder($event: Referral): boolean {
        const isActionRequiredByCurrentUser = this.isActionRequiredByCurrentUser($event);
        return $event.referralStatus != ReferralStatusEnum.Closed && !isActionRequiredByCurrentUser && $event.assignedToUserId && (this.currentUser?.id == $event.assignedByUserId || this.currentUser?.id == $event?.assignedToUserId);
    }

    openFeedbackQuickView($event: Referral) {
        const dialogRef = this.dialog.open(ReferralQuickViewDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                referral: $event
            }
        });
    }
}
