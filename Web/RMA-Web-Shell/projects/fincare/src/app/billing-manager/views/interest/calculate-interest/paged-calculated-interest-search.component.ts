import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { InterestService } from '../../../services/interest.service';
import { Interest } from '../../../models/interest';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { PagedCalculateInterestSearchDataSource } from './paged-calculated-interest-search.datasource';
import { InterestStatusEnum } from 'projects/fincare/src/app/shared/enum/interest-status.enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InterestCalculationRequest } from '../../../models/interest-calculation-request';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
    selector: 'paged-calculated-interest-search',
    templateUrl: './paged-calculated-interest-search.component.html',
    styleUrls: ['./paged-calculated-interest-search.component.css']
})
export class PagedCalculatedInterestSearchComponent extends PermissionHelper implements OnInit {

    requiredPermission = 'Manage Interest';

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    form: any;
    dataSource: PagedCalculateInterestSearchDataSource;

    isReadOnly = true;
    isEditMode = false;

    editedInterestRecords: Interest[] = [];

    industryClasses: IndustryClassEnum[] = [];
    productCategoryTypes: ProductCategoryTypeEnum[] = [];
    triggerReset: boolean;

    standardFiltersExpanded = true;
    advancedFiltersExpanded = false;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly interestService: InterestService,
        private readonly dialog: MatDialog,
        private readonly alertService: ToastrManager
    ) {
        super();
        this.dataSource = new PagedCalculateInterestSearchDataSource(this.interestService);
    }

    ngOnInit() {
        this.isReadOnly = !this.userHasPermission(this.requiredPermission);
        this.getLookups();
        this.createForm();
        this.getData();
        this.isLoading$.next(false);
    }

    getLookups() {
        this.industryClasses = this.ToArray(IndustryClassEnum);
        this.productCategoryTypes = this.ToArray(ProductCategoryTypeEnum);
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            industryClassFilter: [{ value: 'All', disabled: false }],
            productCategoryTypeFilter: [{ value: 'All', disabled: false }],
        });
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    industryClassFilterChanged($event: IndustryClassEnum) {
        this.dataSource.industryClassFilter = $event.toString() == 'All' ? null : +IndustryClassEnum[$event];
        this.standardFiltersExpanded = !this.canGenerate();
        this.getData();
    }

    productCategoryTypeFilterChanged($event: ProductCategoryTypeEnum) {
        this.dataSource.productCategoryTypeFilter = $event.toString() == 'All' ? null : +ProductCategoryTypeEnum[$event];
        this.standardFiltersExpanded = !this.canGenerate();
        this.getData();
    }

    periodFilterChanged($event: number) {
        this.dataSource.periodFilter = $event[0].value;
        this.standardFiltersExpanded = !this.canGenerate();
        this.getData();
    }

    onInterestChanged($event: Interest): void {
        $event.adjustedInterestAmount = $event.adjustedInterestAmount as any == '' ? null : $event.adjustedInterestAmount;
        $event.comment = $event.comment?.trim() == '' ? null : $event.comment;

        const index = this.editedInterestRecords.findIndex(r => r.interestId === $event.interestId);

        if (index > -1) {
            this.editedInterestRecords[index] = { ...$event };
        } else {
            this.editedInterestRecords.push({ ...$event });
        }

        this.dataSource.editedInterestRecords = this.editedInterestRecords;
    }

    toggleMode() {
        this.isEditMode = !this.isEditMode;
    }

    toggleIsReadOnly() {
        this.isReadOnly = !this.isReadOnly;
    }

    reset(skipFilterReset: boolean) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('loading...please wait');

        this.standardFiltersExpanded = true;
        this.advancedFiltersExpanded = false;

        this.paginator.pageIndex = 0;
        this.paginator.pageSize = 5;

        if (!skipFilterReset) {
            this.dataSource.industryClassFilter = null;
            this.dataSource.productCategoryTypeFilter = null;
            this.dataSource.periodFilter = null;

            this.dataSource.rolePlayerFilter = null;

            this.form?.patchValue({
                industryClassFilter: 'All',
                productCategoryTypeFilter: 'All'
            });

            this.triggerReset = !this.triggerReset;
        }

        this.editedInterestRecords = [];
        this.dataSource.editedInterestRecords = []

        if (this.isEditMode) {
            this.toggleMode();
        }

        this.getData()
        this.isLoading$.next(false);
    }

    save() {
        this.isLoading$.next(true);
        this.loadingMessage$.next('saving...please wait');

        this.interestService.updateCalculatedInterest(this.editedInterestRecords).subscribe(_ => {
            this.reset(true);
        });
    }

    delete($event: Interest) {
        if (!this.isValid($event)) {
            $event.adjustedInterestAmount = null;
            $event.comment = null;
        }

        $event.isDeleted = !$event.isDeleted;

        this.onInterestChanged($event);
    }

    openGenerateConfirmationDialog() {
        const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
            width: '40%',
            disableClose: true,
            data: {
                title: 'Generate Interest?',
                text: 'Interest will be calculated and generated. Existing pending records for the selected filters will be recalculated. Are you sure you want to proceed?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.generate();
            }
        });
    }

    openProcessConfirmationDialog() {
        const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
            width: '40%',
            disableClose: true,
            data: {
                title: 'Process Interest?',
                text: 'Interest will be processed. Are you sure you want to proceed?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.process();
            }
        });
    }

    generate() {
        this.isLoading$.next(true);
        this.loadingMessage$.next('generating interest records...please wait');

        const interestCalculationRequest = new InterestCalculationRequest();
        interestCalculationRequest.industryClass = this.dataSource.industryClassFilter;
        interestCalculationRequest.productCategoryId = this.dataSource.productCategoryTypeFilter;
        interestCalculationRequest.periodId = this.dataSource.periodFilter;

        this.interestService.startInterestCalculation(interestCalculationRequest).subscribe(result => {
            this.alertService.successToastr('Interest Calculated Successfully...');
            this.reset(false);
        }, error => {
            this.reset(false);
        });

        this.isLoading$.next(false);
    }

    process() {
        this.isLoading$.next(true);
        this.loadingMessage$.next('processing interest records...please wait');

        const interestCalculationRequest = new InterestCalculationRequest();
        interestCalculationRequest.industryClass = this.dataSource.industryClassFilter;
        interestCalculationRequest.productCategoryId = this.dataSource.productCategoryTypeFilter;
        interestCalculationRequest.periodId = this.dataSource.periodFilter;

        this.interestService.processInterestCalculation(interestCalculationRequest).subscribe(result => {
            this.alertService.successToastr('Interest Processed Successfully...');
            this.reset(false);
        }, error => {
            this.reset(false);
        });

        this.isLoading$.next(false);
    }

    isEdited($event: Interest): boolean {
        return this.editedInterestRecords.some(r => r.interestId == $event.interestId);
    }

    isDeleted($event: Interest): boolean {
        return this.editedInterestRecords.some(r => r.interestId == $event.interestId && r.isDeleted) || $event.isDeleted;
    }

    isExcluded($event: Interest): boolean {
        return $event.adjustedInterestAmount != null;
    }

    isValid($event: Interest): boolean {
        if (!this.isEdited($event)) { return true; }
        return ($event.adjustedInterestAmount > 0 && $event.comment?.trim().length > 0) || (!$event.adjustedInterestAmount && (!$event.comment || $event.comment.trim() == ''));
    }

    canSave(): boolean {
        return this.editedInterestRecords.length > 0 &&
            this.editedInterestRecords.every(s => this.isValid(s));
    }

    canGenerate(): boolean {
        return this.dataSource?.industryClassFilter != null && this.dataSource?.productCategoryTypeFilter != null && this.dataSource?.periodFilter != null;
    }

    canProcess(): boolean {
        return this.canGenerate() && this.dataSource?.data?.rowCount > 0;
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) == false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getInterestStatus($event: InterestStatusEnum) {
        return this.formatLookup(InterestStatusEnum[$event]);
    }

    getIndustryClass($event: IndustryClassEnum) {
        return this.formatLookup(IndustryClassEnum[$event]);
    }

    getProductCategoryType($event: ProductCategoryTypeEnum) {
        return this.formatLookup(ProductCategoryTypeEnum[$event]);
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'industryClass', show: true },
            { def: 'rolePlayerId', show: true },
            { def: 'productCategoryId', show: true },
            { def: 'balance', show: true },
            { def: 'calculatedInterestAmount', show: true },
            { def: 'adjustedInterestAmount', show: true },
            { def: 'comment', show: true },
            { def: 'interestStatus', show: true },
            { def: 'actions', show: this.isEditMode },
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    setDebtorFilter($event: RolePlayer) {
        this.dataSource.rolePlayerFilter = $event;
        this.advancedFiltersExpanded = false;
        this.getData();
    }
}
