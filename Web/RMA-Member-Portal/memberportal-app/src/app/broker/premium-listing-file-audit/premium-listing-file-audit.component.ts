import { AfterViewInit, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatColumnDef, MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { PremiumListingStatusEnum } from 'src/app/shared/enums/premium-listing-status.enum';
import { PremiumListingFileAudit } from 'src/app/shared/models/premium-listing-file-audit';
import { BrokerPolicyService } from '../services/broker-policy-service';

@Component({
  selector: 'premium-listing-file-audit',
  templateUrl: './premium-listing-file-audit.component.html',
  styleUrls: ['./premium-listing-file-audit.component.scss']
})
export class PremiumListingFileAuditComponent implements OnInit, AfterViewInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<PremiumListingFileAudit>();
  premiumListingStatus: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  @ViewChild('table') table: ElementRef;
  @Output() viewExceptionReport = new EventEmitter<string>();

  searchText: string;
  placeHolder = 'Search by file name';
  displayedColumns = ['fileName', 'createdDate', 'createdBy', 'status', 'Actions'];

  public searchContainsNothing = true;
  public hasData = false;
  public hidePaginator = true;
  public currentUser: UserDetails;

  constructor(
    private readonly brokerPolicyService: BrokerPolicyService,
    private readonly authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.getData();
  }

  ngAfterViewInit(): void {
    this.isLoading$.next(true);
    this.isData$.subscribe(result => {
      if (!result) {
        this.hasData = false;
        this.setPaginatorFilter(0);
      } else {
        this.setPaginatorFilter(this.dataSource.data.length);
        this.hasData = true;
      }
    })
  }

  searchData(data) {
    this.applyFilter(data);
  }

  getStatus(row: PremiumListingStatusEnum): string {
    let status = ''
    switch (row) {
      case PremiumListingStatusEnum.AwaitingApproval:
        status = 'Awaiting Approval';
        break;
      default: status = PremiumListingStatusEnum[row];
        break;
    }
    return status;
  }

  applyFilter(filterValue: any) {
    this.searchText = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.length = this.dataSource.filteredData.length;
    this.dataSource.paginator.firstPage();
    if (this.searchText == '') {
      this.dataSource.paginator.length = this.dataSource.data.length;
    }
    this.setPaginatorFilter(this.dataSource.paginator.length);
  }

  setPaginatorFilter(paginatorLength: number) {
    if (paginatorLength === 0) {
      this.searchContainsNothing = true;
      this.hidePaginator = true;
    } else {
      this.searchContainsNothing = false;
      this.hidePaginator = false;
    }
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  fillTable(isData) {
    if (isData) {
      this.searchContainsNothing = false;
      this.hidePaginator = false;
    }
  }

  onViewDetails(premiumListingFileAudit: PremiumListingFileAudit): void {
    this.viewExceptionReport.emit(premiumListingFileAudit.fileHash)
  }

  getData(): void {
    this.isLoading$.next(true);
    this.brokerPolicyService.GetPremiumListingFileAuditsByBrokerEmail(this.currentUser.email).subscribe(
      data => {
        if (data.length > 0) {
          this.dataSource.data = data;
          this.searchContainsNothing = false;
          this.dataSource.data.forEach(element => {
            element.premiumListingStatusName = this.getStatus(element.premiumListingStatus);
          });
          setTimeout(() => {
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          })

          this.isLoading$.next(false);
          this.isData$.next(true);
        }
      });
  }

  sortData(data: PremiumListingFileAudit[]): PremiumListingFileAudit[] {
    if (!this.sort.active || this.sort.direction === '') { return data; }

    return data.sort((a, b) => {
        let propertyA: number | string = '';
        let propertyB: number | string = '';
        switch (this.sort.active) {
            case 'fileName': [propertyA, propertyB] = [a.fileName, b.fileName]; break;
            case 'createdDate': [propertyA, propertyB] = [a.createdDate.toDateString(), b.createdDate.toDateString()]; break;
            case 'createdBy': [propertyA, propertyB] = [a.createdBy, b.createdBy]; break;
            case 'status': [propertyA, propertyB] = [a.premiumListingStatusName, b.premiumListingStatusName]; break;
        }

        const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
        const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

        return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
}
}
