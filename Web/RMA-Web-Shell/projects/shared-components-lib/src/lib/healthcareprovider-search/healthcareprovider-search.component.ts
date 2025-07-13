
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { HealthcareProviderService } from '../../../../medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderSearchDataSource } from 'projects/medicare/src/app/medi-manager/datasources/healthCareProvider-search-datasource';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { isNullOrUndefined } from 'util';
import { ConfirmationDialogsService } from '../confirm-message/confirm-message.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router } from '@angular/router';

@Component({
    selector: 'lib-healthcareprovider-search',
    templateUrl: './healthcareprovider-search.component.html',
    styleUrls: ['./healthcareprovider-search.component.css']
})
export class HealthcareProviderSearchComponent implements OnInit {
    @Output() healthCareProviderSelectedEmit = new EventEmitter<HealthCareProvider>();
    @Output() registerNewHealthCareProviderEmit = new EventEmitter<HealthCareProvider>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    displayedColumns: string[] = ['name', 'practitionerTypeName', 'practiceNumber', 'isVat', 'isAuthorised', 'actions'];
    dataSource: HealthcareProviderSearchDataSource;

    form: any;

    searchTerm = '';
    selectedHealthCareProvider: HealthCareProvider;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly healthcareProviderService: HealthcareProviderService, public dialog: MatDialog,
        readonly confirmservice: ConfirmationDialogsService,
        private readonly toastr: ToastrManager,
        private readonly router: Router,
    ) {
        this.dataSource = new HealthcareProviderSearchDataSource(this.healthcareProviderService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }, [Validators.required]]
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
            this.reset();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        const healthCareProviderQuery: HealthCareProvider = { practiceNumber: this.searchTerm, name: this.searchTerm, rolePlayerId: 0, providerTypeId: 0, practitionerTypeName: "", isVat: false, isHospital: false };
        const healthCareProviderQueryStringified = JSON.stringify(healthCareProviderQuery);
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, 'modifiedDate', 'desc', healthCareProviderQueryStringified);
        if (isNullOrUndefined(this.dataSource?.data?.data))
            this.healthCareProviderSelectedEmit.emit(null);
    }

    healthCareProviderSelected(healthCareProvider: HealthCareProvider) {
        this.selectedHealthCareProvider = healthCareProvider;
        this.healthCareProviderSelectedEmit.emit(this.selectedHealthCareProvider);
    }

    reset() {
        this.searchTerm = '';
        this.selectedHealthCareProvider = null;
        this.form.controls.searchTerm.reset();
    }

    registeredHealthcareProvider() {
        this.router.navigateByUrl('medicare/manage-hcp/register-new-healthcare-provider');
    }


}
