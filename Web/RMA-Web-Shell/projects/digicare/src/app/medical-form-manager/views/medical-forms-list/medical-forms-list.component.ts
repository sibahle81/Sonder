import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { MedicalFormsDataSource } from 'projects/digicare/src/app/medical-form-manager/datasources/medical-forms.datasource';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { MedicalReportFormDetail } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form-detail';

@Component({
  selector: 'app-medical-forms-list',
  templateUrl: 'medical-forms-list.component.html',
  styleUrls: ['./medical-forms-list.component.css'],
})
export class MedicalFormsListComponent implements OnInit, AfterViewInit {
  currentUser: string;
  displayedColumns: string[] = ['reportTypeName', 'reportCategoryName', 'claimReferenceNumber', 'healthcareProviderPracticeNumber','healthcareProviderName', 'patientFullName', 'employerName', 'reportDate', 'reportStatus', 'viewReport'];
  medicalReportFormsList: MedicalReportFormDetail[];
  loadingMedicalReportForms : boolean

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  dataSource: MedicalFormsDataSource;

  constructor(
    readonly medicalFormService: MedicalFormService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService) { }

  ngOnInit() {
    this.dataSource = new MedicalFormsDataSource(this.medicalFormService);
    this.currentUser = this.authService.getUserEmail();
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData(): void {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active,  this.sort.direction == '' ? "desc" : this.sort.direction, this.currentUser);
  }

  getMedicalReportForms(): void {
    this.loadingMedicalReportForms = true;
    this.medicalReportFormsList = [];
    let userEmail = this.authService.getUserEmail();
    this.medicalFormService.getMedicalReportFormsByCreatedBy(userEmail).subscribe(data => {
      this.medicalReportFormsList = data;
      this.loadingMedicalReportForms = false;
    });
  }
  onSelect(item: MedicalReportForm): void {
    this.router.navigate(['/digicare/medical-form-viewer', item.medicalReportFormId]);
  }
}
