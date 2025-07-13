import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HealthcareProviderSearchDataSource } from "projects/medicare/src/app/medi-manager/datasources/healthCareProvider-search-datasource";
import { HealthcareProviderService } from "projects/medicare/src/app/medi-manager/services/healthcareProvider.service";
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-medical-invoice-under-payment-and-non-payment',
    templateUrl: './medical-invoice-under-payment-and-non-payment.component.html',
    styleUrls: ['./medical-invoice-under-payment-and-non-payment.component.css']
  })

export class MedicalInvoiceUnderPaymentAndNonPaymentComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'practiceNumber', 'name'];
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  dataSource: HealthcareProviderSearchDataSource;

  constructor(
    readonly healthCareProviderService: HealthcareProviderService,
    private readonly formBuilder: UntypedFormBuilder,
    public readonly datepipe: DatePipe) { }

  ngOnInit() {
    this.createForm();
    this.dataSource = new HealthcareProviderSearchDataSource(this.healthCareProviderService);
    this.paginator.pageIndex = 0;
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.onMedicalInvoiceSearch())
      )
      .subscribe();
  }

  createForm() {
    this.form = this.formBuilder.group({
      practiceNumber: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  onResetForm() {
    this.form.reset();
  }

  selectHandler(row: any) {

}

  onMedicalInvoiceSearch() { 

    let queryData = {
        practiceNumber: (this.form.controls.practiceNumber.value > 0) ? this.form.controls.practiceNumber.value : '',
        startDate: (this.form.controls.startDate.value != "") && (this.form.controls.startDate.value != null) ? this.datepipe.transform(this.form.controls.startDate.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
        endDate: (this.form.controls.endDate.value != "") && (this.form.controls.endDate.value != null) ? this.datepipe.transform(this.form.controls.endDate.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
  
      }
      this.dataSource.getDataForInvoiceReports(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, JSON.stringify(queryData));
  }

}
