
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { isNullOrUndefined } from 'util';
import { MedicalInvoiceSearchCriteria } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-search-criteria';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { MedicalInvoiceListDatasource } from 'projects/medicare/src/app/medi-manager/datasources/medical-invoice-list-datasource';
import { InvoiceSearchEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-search-enum';
import { MedicareMedicalInvoiceCommonService } from '../../services/medicare-medical-invoice-common.service';
@Component({
  selector: 'app-medical-invoice-search',
  templateUrl: './medical-invoice-search.component.html',
  styleUrls: ['./medical-invoice-search.component.css']
})
export class MedicalInvoiceSearchComponent implements OnInit {

  form: UntypedFormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  invoiceStatusSelection: InvoiceStatusEnum;
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  invoiceStatusEnumArray = Object.keys(InvoiceStatusEnum).filter((v) => isNaN(Number(v)));
  dataSource: MedicalInvoiceListDatasource;
  invoiceSearchEnum: typeof InvoiceSearchEnum = InvoiceSearchEnum;

  medicalInvoiceSearchCriteria: MedicalInvoiceSearchCriteria
  returnedSearchResults: any
  pageIndex: number = 0;
  sortDirection: string = "desc";
  pageSize: number = 5;
  orderBy: string = "invoiceId"

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public readonly datepipe: DatePipe,
    private medicalInvoiceService: MedicalInvoiceService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService) { }
    currentUrl = this.router.url;

  ngOnInit() {
    this.createForm();
    this.dataSource = new MedicalInvoiceListDatasource(this.medicareMedicalInvoiceCommonService);

    if(!isNullOrUndefined(sessionStorage.getItem('previousMedicalInvoiceSearchLink'))){
      this.onMedicalInvoiceSearch(this.invoiceSearchEnum.SearchFromView);
    }
  }

  ngAfterViewInit(): void {
  }

  createForm() {
    this.form = this.formBuilder.group({
      practiceNumber: [''],
      serviceDate: [''],
      invoiceDate: [''],
      invoiceStatus: [''],
      claimNumber: ['']
    });
  }

  onResetForm() {

    if(!isNullOrUndefined(sessionStorage.getItem('previousMedicalInvoiceSearchLink'))){
      sessionStorage.removeItem('previousMedicalInvoiceSearchLink');
      sessionStorage.removeItem('previousMedicalInvoiceSearchParams');
    }

    this.form.reset();
  }

  onMedicalInvoiceSearch(searchFrom) {

    this.loading$.next(true);

    //if coming from view screen then take data and call seach with previous value otherwise no
    if (searchFrom == this.invoiceSearchEnum.SearchFromForm) {
      let claimnumber = this.form.controls.claimNumber.value?.replace(/\//g, '-')
      this.medicalInvoiceSearchCriteria = {
        practiceNumber: (this.form.controls.practiceNumber.value > 0) ? this.form.controls.practiceNumber.value : null,
        serviceDate: (this.form.controls.serviceDate.value != "") && (this.form.controls.serviceDate.value != null) ? this.datepipe.transform(this.form.controls.serviceDate.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
        invoiceDate: (this.form.controls.invoiceDate.value != "") && (this.form.controls.invoiceDate.value != null) ? this.datepipe.transform(this.form.controls.invoiceDate.value, 'yyyy-MM-dd')
          : this.datepipe.transform("", 'yyyy-MM-dd'),
        invoiceStatus: this.invoiceStatusSelection,
        claimReferenceNumber: (claimnumber?.length > 0) ? claimnumber : "",
        personEventId: null,
        invoiceNumber: null,
        hcpInvoiceNumber: null,
        hcpAccountNumber: null
      }

      if (!isNullOrUndefined(sessionStorage.getItem('previousMedicalInvoiceSearchLink'))) {
        sessionStorage.removeItem('previousMedicalInvoiceSearchLink');
        sessionStorage.removeItem('previousMedicalInvoiceSearchParams');
      }
    }
    else {

      this.medicalInvoiceSearchCriteria = JSON.parse(sessionStorage.getItem('previousMedicalInvoiceSearchParams'));
      this.form.patchValue({
        practiceNumber: this.medicalInvoiceSearchCriteria.practiceNumber > 0 ? this.medicalInvoiceSearchCriteria.practiceNumber : "",
        serviceDate: this.medicalInvoiceSearchCriteria.serviceDate,
        invoiceDate: this.medicalInvoiceSearchCriteria.invoiceDate,
        invoiceStatus: this.medicalInvoiceSearchCriteria.invoiceStatus,
        claimNumber: this.medicalInvoiceSearchCriteria.claimReferenceNumber

      });

    }

    this.dataSource.getDataSearch(this.pageIndex + 1, this.pageSize,
      this.orderBy, this.sortDirection, JSON.stringify(this.medicalInvoiceSearchCriteria))
      .subscribe(searchResults => {
        this.returnedSearchResults = searchResults;
        this.loading$.next(false);
      });

  }

  onSortPagingSearchedInvoiceTable($event) {
    //values for sort and paging
    this.sortDirection = isNullOrUndefined($event[0]) || $event[0] == "" ? "desc" : $event[0];
    this.pageSize = $event[3] > 0 ? $event[3] : 5;
    this.orderBy = isNullOrUndefined($event[1]) || $event[1] == "" ? "invoiceId" : $event[1];
    this.pageIndex = $event[2];

    this.onMedicalInvoiceSearch(this.invoiceSearchEnum.SearchFromForm);
  }

  onChangeinvoiceStatus(e) {
    this.invoiceStatusSelection = e.value;
  }

  refreshSearch() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.currentUrl]);
    });
  }

}
