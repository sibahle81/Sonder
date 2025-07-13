import { Component,  OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { FollowUpSearchDataSource } from './follow-up-search.datasource';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FollowUp } from '../../../policy-manager/shared/entities/follow-up';
import { FollowUpService } from '../../../policy-manager/shared/Services/follow-up.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
    templateUrl: './follow-up-search.component.html',

    selector: 'follow-up-search'
})
export class FollowUpSearchComponent implements OnInit {
    form: UntypedFormGroup;
    followUps: FollowUp[];
    currentQuery: string;
    email: string;

    displayedColumns = ['reference', 'itemType', 'description', 'actions'];
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;

    constructor(
        public readonly dataSource: FollowUpSearchDataSource,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly router: Router,
        private readonly followUpService: FollowUpService,
        private readonly authService: AuthService,
        private readonly location: Location,
        private datePipe: DatePipe) {
    }

    ngOnInit(): void {
        this.createForm();
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.clearData();
    }


    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            query: new UntypedFormControl('', [Validators.minLength(3) , Validators.required])
        });
    }

    readForm(): any {
        const formModel = this.form.value;
        return formModel.query as string;
    }

    search(): void {
        if (this.form.valid) {
            this.currentQuery = this.readForm();
            this.dataSource.getData(this.currentQuery);
        }
    }

    clearFilter(): void {
        this.form.patchValue({ query: '' });
    }
}
