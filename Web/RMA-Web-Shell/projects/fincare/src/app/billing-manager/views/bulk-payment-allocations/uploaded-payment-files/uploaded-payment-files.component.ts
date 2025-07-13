import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { CollectionsService } from '../../../services/collections.service';
import { UploadedPaymentFilesDatasource } from './uploaded-payment-files.datasource';

@Component({
  selector: 'app-uploaded-payment-files',
  templateUrl: './uploaded-payment-files.component.html',
  styleUrls: ['./uploaded-payment-files.component.css']
})
export class UploadedPaymentFilesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  searchText: string;
  noData = false;
  placeHolder = 'Search by filename';
  isLoading$ = new BehaviorSubject<boolean>(false);

  displayedColumns: string[] = ['fileName', 'totalLines', 'totalAmount', 'createdBy', 'createdDate', 'status', 'actions'];

  constructor(private readonly collectionService: CollectionsService,
              private router: Router,
              private alert: ToastrManager,
              public datasource: UploadedPaymentFilesDatasource) { }

   ngOnInit(): void {
    this.datasource.setControls(this.paginator, this.sort);
    this.loadData();
  }

  loadData() {
    this.noData = false;
    this.datasource.isLoading = true;
    this.collectionService.getBulkPaymentFiles().subscribe(results => {
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



  viewFileDetils(id: number) {
    this.router.navigate([`fincare/billing-manager/bulk-payment-file-details/${id}`]);
  }

  back() {
    this.router.navigate(['fincare/billing-manager/']);
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
}
