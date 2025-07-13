import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { MyWorkflowsDataSource } from './my-workflows-search.datasource';
import { WizardService } from '../../wizard/shared/services/wizard.service';
import { WizardStatus } from '../../wizard/shared/models/wizard-status.enum';
import { Wizard } from '../../wizard/shared/models/wizard';
import { Router } from '@angular/router';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
    selector: 'my-workflows-search',
    templateUrl: './my-workflows-search.component.html',
    styleUrls: ['./my-workflows-search.component.css']
})

export class MyWorkflowsSearchComponent extends PermissionHelper implements OnInit {

    @Input() title = 'My Active Workflows'; // optional: title of the page
    @Input() wizardConfigIds: string; // optional: CSV list of wizard configuration ids to be displayed. If none are specified then all wizards locked to the user will display

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: MyWorkflowsDataSource;

    form: any;

    searchTerm = '';

    currentUser: User;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly wizardService: WizardService,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {
        super();
        this.currentUser = this.authService.getCurrentUser();
        this.dataSource = new MyWorkflowsDataSource(this.wizardService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
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
        this.dataSource.wizardConfigs = this.wizardConfigIds ? this.wizardConfigIds : 'none';
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    onSelect(wizard: Wizard): void {
        Wizard.redirect(this.router, wizard.wizardConfiguration.name, wizard.id);
      }

    reset() {
        this.searchTerm = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getWizardStatusText($event: WizardStatus) {
        return this.formatLookup(WizardStatus[$event]);
    }

    formatWizardType(type: string) {
        if (!type) { return; }
        const temp = type.replace('-', ' ');
        return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
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
            { def: 'name', show: true },
            { def: 'type', show: true },
            { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },

            { def: 'lockedStatus', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'lockedStatusConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            
            { def: 'wizardStatusText', show: true },
            { def: 'overAllSLAHours', show: this.currentUser?.isInternalUser },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
