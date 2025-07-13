import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { BillingService } from '../../../../services/billing.service';
import { UploadedWriteOffDatasource } from './uploaded-write-off-datasource';

@Component({
  selector: 'app-uploaded-write-off-files',
  templateUrl: './uploaded-write-off-files.component.html',
  styleUrls: ['./uploaded-write-off-files.component.css']
})
export class UploadedWriteOffFilesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  searchText: string;
  noData = false;
  placeHolder = 'Search by filename';
  isLoading$ = new BehaviorSubject<boolean>(false);
  form: UntypedFormGroup;
  startDate: Date;
  endDate: Date;
  endMaxDate: Date;
  startMaxDate: Date;
  endMinDate: Date;
  searchQuery = '';
  selectedStatusId = 0;
  backLink = '/fincare/billing-manager';
  displayedColumns: string[] = ['fileName', 'createdBy', 'createdDate', 'status', 'actions'];
  statuses: Lookup[] = [];
  isLoadingStatuses$ = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private alert: ToastrManager,
    public datasource: UploadedWriteOffDatasource,
    private readonly formbuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private readonly lookupService: LookupService,
    private readonly billingService: BillingService
  ) {
    this.loadStatuses();
  }

  ngOnInit(): void {
    this.datasource.setControls(this.paginator, this.sort);
    this.createForm();
    this.form.get('status').setValue(0);
  }

  createForm() {
    this.form = this.formbuilder.group({
      status: [null],
      startDate: [null],
      endDate: [null],
      source: [null]
    });

    const today = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.startDate.setDate(1);
    this.endDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.endMaxDate = today;
    this.endMinDate = this.startDate;
    this.startMaxDate = today;
  }

  loadData() {
    this.noData = false;
    this.datasource.isLoading = true;
    this.billingService.getUploadedWriteOffLists(this.startDate, this.endDate).subscribe(results => {
      this.datasource.getData(results);
      this.datasource.isLoading = false;
      if (results.length === 0) {
        this.noData = true;
      }
    },
      error => {
        this.alert.errorToastr(error, 'Error fetching file details');
        this.datasource.isLoading = false;
      });
  }

  viewFileDetils(fileid: string) {
    this.router.navigate([`${this.backLink}/file-exceptions/${fileid}`]);
  }

  back() {
    this.router.navigate([this.backLink]);
  }


  search() {
    this.loadData();
  }

  endDateChange() {
    const endDate = this.form.controls.endDate.value;
    this.startMaxDate = new Date(endDate);
    this.endDate = endDate;
  }

  startDateChange() {
    const startDate = this.form.controls.startDate.value;
    this.endMinDate = new Date(startDate);
    this.startDate = startDate;
  }

  selectedStatusChanged($event: { value: number; }) {
    this.selectedStatusId = $event.value;
  }

  loadStatuses(): void {
    this.isLoadingStatuses$.next(true);
    this.lookupService.getUploadedFilesProcessingStatuses().subscribe(
      data => {
        this.statuses = data;
        this.isLoadingStatuses$.next(false);
      }
    );
  }
}
