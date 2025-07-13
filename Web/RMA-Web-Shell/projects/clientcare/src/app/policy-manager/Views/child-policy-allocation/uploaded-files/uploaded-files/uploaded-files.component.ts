import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { PremiumListingService } from '../../../../shared/Services/premium-listing.service';
import { UploadedFilesDatasource } from './uploaded-files.datasource';
import { DatePipe } from '@angular/common';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'app-uploaded-files',
  templateUrl: './uploaded-files.component.html',
  styleUrls: ['./uploaded-files.component.css']
})
export class UploadedFilesComponent implements OnInit {

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

  displayedColumns: string[] = ['fileName', 'createdBy', 'createdDate', 'status', 'actions'];
  statuses: Lookup[] = [];
  isLoadingStatuses$ = new BehaviorSubject(false);

  constructor(
    private readonly premiumListingService: PremiumListingService,
    private router: Router,
    private alert: ToastrManager,
    public datasource: UploadedFilesDatasource,
    private readonly formbuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private readonly lookupService: LookupService
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
    this.endDate = new Date(this.datePipe.transform('2999-12-31', 'yyyy-MM-dd'));
    this.endMaxDate = today;
    this.endMinDate = this.startDate;
    this.startMaxDate = today;
  }

  loadData() {
    const queryObject = { statusId: this.selectedStatusId, startDate: this.startDate, endDate: this.endDate };
    this.noData = false;
    this.datasource.isLoading = true;
    this.premiumListingService.getPremiumListingPaymentFiles(queryObject).subscribe(results => {
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
    this.router.navigate([`clientcare/policy-manager/file-exceptions/${fileid}`]);
  }

  back() {
    this.router.navigate(['clientcare/policy-manager/']);
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.datasource.filter = filterValue.trim().toLowerCase();
    this.paginator.length = this.datasource.filteredData.length;
    this.datasource.paginator.firstPage();
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
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
