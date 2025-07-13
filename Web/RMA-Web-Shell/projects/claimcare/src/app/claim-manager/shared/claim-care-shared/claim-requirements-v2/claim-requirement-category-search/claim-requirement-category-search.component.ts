import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimRequirementCategory } from '../../../entities/claim-requirement-category';
import { ClaimRequirementCategoryDataSource } from './claim-requirement-category-search.datasource';
import { ClaimRequirementService } from '../../../../Services/claim-requirement.service';
import { EventTypeEnum } from '../../../enums/event-type-enum';

@Component({
    selector: 'claim-requirement-category-search',
    templateUrl: './claim-requirement-category-search.component.html',
    styleUrls: ['./claim-requirement-category-search.component.css']
})

export class ClaimRequirementCategorySearchComponent extends UnSubscribe implements OnInit, OnChanges {
    @Input() title = 'Search Claim Requirement Categories';
    @Input() eventType: EventTypeEnum; // type of event
    @Input() allowMultiple = false; // allows user to select multiple records if set to TRUE. Default value is FALSE
    @Input() triggerReset: boolean;
    @Input() allowInstructionOverride = false; // allows the user to manually override the instruction on the requirement if set to TRUE. Default value is FALSE

    @Output() claimRequirementCategoriesSelectedEmit: EventEmitter<ClaimRequirementCategory[]> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedClaimRequirementCategories: ClaimRequirementCategory[] = [];
    dataSource: ClaimRequirementCategoryDataSource;
    form: any;
    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly claimRequirementService: ClaimRequirementService
    ) {
        super();
        this.dataSource = new ClaimRequirementCategoryDataSource(this.claimRequirementService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.reset();
        }
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

        this.getData();
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
        this.dataSource.eventType = this.eventType;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    claimRequirementCategorySelected(claimRequirementCategory: ClaimRequirementCategory) {
        if (!this.selectedClaimRequirementCategories) { this.selectedClaimRequirementCategories = []; }

        if (this.allowMultiple) {
            let index = this.selectedClaimRequirementCategories.findIndex(a => a.claimRequirementCategoryId === claimRequirementCategory.claimRequirementCategoryId);
            if (index > -1) {
                this.selectedClaimRequirementCategories.splice(index, 1);
            } else {
                this.selectedClaimRequirementCategories.push(claimRequirementCategory);
            }
        } else {
            if (this.selectedClaimRequirementCategories.length > 0) {
                this.selectedClaimRequirementCategories[0] = claimRequirementCategory;
            } else {
                this.selectedClaimRequirementCategories.push(claimRequirementCategory);
            }
        }

        this.claimRequirementCategoriesSelectedEmit.emit(this.selectedClaimRequirementCategories);
    }

    reset() {
        if (!this.form) { return; }

        this.searchTerm = '';

        this.form.patchValue({
            searchTerm: this.searchTerm
        });

        this.selectedClaimRequirementCategories = [];
        this.claimRequirementCategoriesSelectedEmit.emit(this.selectedClaimRequirementCategories);

        if (this.dataSource.data && this.dataSource.data.data) {
            this.dataSource.data.data = null;
        }
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'name', show: true },
            { def: 'description', show: true },
            { def: 'isMemberVisible', show: this.allowInstructionOverride },
            { def: 'selectSingle', show: !this.allowMultiple },
            { def: 'selectMultiple', show: this.allowMultiple }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    isSelected($event: ClaimRequirementCategory): boolean {
        return !this.selectedClaimRequirementCategories ? false : this.selectedClaimRequirementCategories.some(s => s.claimRequirementCategoryId == $event.claimRequirementCategoryId)
    }
}
