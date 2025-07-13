import { Component,  OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { MedicalFormsDataSource } from 'projects/digicare/src/app/medical-form-manager/datasources/medical-forms.datasource';
import { MedicalReportFormDetail } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form-detail';

@Component({
    templateUrl: './medical-forms-search.component.html',
    styleUrls: ['./medical-forms-search.component.css'],
// tslint:disable-next-line: component-selector
    selector: 'app-medical-forms-search'
})
export class MedicalFormsSearchComponent implements OnInit, AfterViewInit {
    form: UntypedFormGroup;
    currentQuery: string;
    displayedColumns = ['reportTypeName', 'reportCategoryName', 'claimReferenceNumber', 'healthcareProviderPracticeNumber', 'healthcareProviderName', 'patientFullName', 'employerName', 'reportDate', 'reportStatus', 'viewReport'];

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: MedicalFormsDataSource;

    constructor(
        public readonly medicalFormsService: MedicalFormService,
        private readonly router: Router) {
    }

    ngOnInit(): void {
        this.dataSource = new MedicalFormsDataSource(this.medicalFormsService);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => {
                    this.currentQuery = this.filter.nativeElement.value;
                    this.currentQuery = this.currentQuery.replace(" ",",").replace(/\//g, '|');
                    if (this.currentQuery.length >= 3) {
                        this.paginator.pageIndex = 0;
                        this.loadData();
                    }
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadData())
            )
            .subscribe();
    }

    onSelect(item: MedicalReportFormDetail): void {
        this.router.navigate(['/digicare/medical-form-viewer', item.medicalReportFormId]);
      }

    search() {
        this.paginator.pageIndex = 0;
        this.loadData();
    }

    loadData(): void {
        this.currentQuery = this.filter.nativeElement.value;
        this.currentQuery = this.currentQuery.replace(" ",",").replace(/\//g, '|');
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
}
