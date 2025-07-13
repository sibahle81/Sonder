import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CollectionsService } from '../../../services/collections.service';
import { ExceptionFileDetailsDatasource } from './exception-file-details.datasourse';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ExceptionAllocation } from '../../../models/exception-allocation';

@Component({
  selector: 'app-exception-file-details',
  templateUrl: './exception-file-details.component.html',
  styleUrls: ['./exception-file-details.component.css']
})
export class ExceptionFileDetailsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selectedItemIdsToEdit = [];
  selectedItemsToDelete = [];
  showSubmitDelete = false;
  showSubmitEdit = false;
  selectedItemsToEdit = [];
  fileId: number;
  placeHolder = 'Search by userReference2, allocateTo';
  searchText: string;
  noData = false;
  ssrsBaseUrl = '';
  parametersAudit: any;
  reportTitle = 'Bulk Allocations Exeption Report';
  reportServerAudit: string;
  reportUrlAudit = 'RMA.Reports.FinCare/RMABulkAllocationExceptionReport'
  showParametersAudit = 'false';
  languageAudit = 'en-us';
  widthAudit = 100;
  heightAudit = 100;
  toolbarAudit = 'true';
  showReport = true;
  format = 'EXCEL';
  selectedTabIndex = 0;

  displayedColumns: string[] = ['userReference', 'userReference2', 'allocateTo', 'amount', 'status', 'error'];
  currentQuery = '';

  isSubmitting$ = new BehaviorSubject<boolean>(false);
  isDownloading = false;
  canDownload: boolean;

  constructor(private readonly collectionService: CollectionsService,
    private activatedRoute: ActivatedRoute,
    private alert: ToastrManager,
    private readonly router: Router,
    private readonly lookupService: LookupService,
    public datasource: ExceptionFileDetailsDatasource) {
    this.activatedRoute.paramMap
      .pipe(map(params => params.get('id')),
        tap(id => {
          this.fileId = +id;
        }
        ))
      .subscribe();
  }

  ngOnInit(): void {
    this.datasource.setControls(this.paginator, this.sort);

    if (this.fileId > 0) {
      this.loadData();
    }
  }

  loadData() {
    this.noData = false;
    this.datasource.isLoading = true;
    this.collectionService.getExceptionFileDetails(this.fileId).subscribe(results => {
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

  editChecked(event: any, item: ExceptionAllocation) {
    if (event.checked) {
      this.selectedItemIdsToEdit.push(item.id);
      this.selectedItemsToEdit.push(item);
    }
    else {
      const index = this.selectedItemIdsToEdit.indexOf(item.id);
      const indexSelectedItem = this.selectedItemsToEdit.findIndex(c => c.id === item.id);
      if (index > -1) {
        this.selectedItemIdsToEdit.splice(index, 1);
      }

      if (indexSelectedItem > -1) {
        this.selectedItemsToEdit.splice(indexSelectedItem, 1);
      }
    }

    if (this.selectedItemIdsToEdit.length > 0) {
      this.showSubmitEdit = true;
    } else {
      this.showSubmitEdit = false;
    }
  }

  deleteChecked(event: any, item: ExceptionAllocation) {
    if (event.checked) {
      this.selectedItemsToDelete.push(item.id);
    }
    else {
      const index = this.selectedItemsToDelete.indexOf(item.id);
      if (index > -1) {
        this.selectedItemsToDelete.splice(index, 1);
      }
    }

    if (this.selectedItemsToDelete.length > 0) {
      this.showSubmitDelete = true;
    } else {
      this.showSubmitDelete = false;
    }
  }

  submitEdit() {
    this.isSubmitting$.next(true);
    if (this.selectedItemsToEdit.length > 0) {
      this.collectionService.editBulkAllocations(this.selectedItemsToEdit).subscribe(
        result => {
          if (result) {
            this.alert.successToastr('item(s) successfully edited');
            this.selectedItemsToEdit = [];
            this.selectedItemIdsToEdit = [];
            this.isSubmitting$.next(false);
            this.showSubmitEdit = false;
            this.loadData();
          }
        },
        err => {
          this.isSubmitting$.next(false);
          this.alert.errorToastr('error occured editting items');
        });
    }
  }

  submitDelete() {
    this.isSubmitting$.next(true);
    if (this.selectedItemsToDelete.length > 0) {
      this.collectionService.deleteBulkAllocations(this.selectedItemsToDelete).subscribe(
        result => {
          if (result) {
            this.alert.successToastr('item(s) successfully deleted');
            this.selectedItemsToDelete = [];
            this.isSubmitting$.next(false);
            this.showSubmitDelete = false;
            this.loadData();
          }
        },
        err => {
          this.isSubmitting$.next(false);
          this.alert.errorToastr('error occured deleting item(s)');
        }
      );
    }
  }

  valueInput(row: ExceptionAllocation) {
    const indexSelectedItem = this.selectedItemsToEdit.findIndex(c => c.id === row.id);
    if (indexSelectedItem > -1) {
      this.selectedItemsToEdit.splice(indexSelectedItem, 1);
    }
    this.selectedItemsToEdit.push(row);
  }

  back() {
    this.router.navigate(['fincare/billing-manager/exception-files/']);
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

  downloadExceptionReport(): void {
    this.canDownload = true;
    this.showReport = false;
    this.isDownloading = true;

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = { fileId: this.fileId };
        this.reportServerAudit = data;
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.format = 'excel';
        this.showReport = true;
        this.canDownload = true;
      },
      error => {
        this.alert.errorToastr('Error downloading report');
        this.canDownload = true;
      }
    );
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }
}
