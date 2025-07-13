import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PremiumListingService } from '../../../../shared/Services/premium-listing.service';
import { FileExceptionsDataSource } from './file-exceptions.datasource';

@Component({
  selector: 'app-file-exceptions',
  templateUrl: './file-exceptions.component.html',
  styleUrls: ['./file-exceptions.component.css']
})
export class FileExceptionsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selectedItemIdsToEdit = [];
  selectedItemsToDelete = [];
  showSubmitDelete = false;
  showSubmitEdit = false;
  selectedItemsToEdit = [];
  fileId: string;
  placeHolder = 'Search by memberName';
  searchText: string;
  noData = false;

  displayedColumns: string[] = ['memberPolicyNumber', 'memberIdNumber', 'firstname', 'surname', 'paymentDate', 'paymentAmount', 'errorMessage'];
  currentQuery = '';

  isSubmitting$ = new BehaviorSubject<boolean>(false);
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  format: string;
  showReport = false;
  isDownloading = true;

  constructor(private readonly premiumListingService: PremiumListingService,
              private activatedRoute: ActivatedRoute,
              private alert: ToastrManager,
              private readonly router: Router,
              public datasource: FileExceptionsDataSource,
              private readonly lookupService: LookupService,
              private readonly toastr: ToastrManager) {
    this.activatedRoute.paramMap
    .pipe(map(params => params.get('fileId')),
      tap(id => {
        this.fileId = id;
      }
      ))
    .subscribe();
  }

  ngOnInit(): void {
    this.datasource.setControls(this.paginator, this.sort);

    if (this.fileId.length > 0) {
      this.loadData();
    }
  }

  loadData() {
    this.noData = false;
    this.datasource.isLoading = true;
    this.premiumListingService.getPremiumPaymentFileExceptions(this.fileId).subscribe(results => {
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

  back() {
    this.router.navigate(['clientcare/policy-manager/uploaded-premium-payment-files/']);
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

  downloadReport(): void {
    this.showReport = false;
    this.isDownloading = true;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          FileIdentifier: this.fileId,
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/RMAPremiumPaymentErrors';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.format = 'excel';
        this.showReport = true;
      },
      error => {
        this.toastr.errorToastr(error, 'Error downloading report');
      }
    );
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }

}


