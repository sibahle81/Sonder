import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BenefitService } from '../../services/benefit.service';
import { BenefitsUploadDataSource } from '../../datasources/benefits-upload.datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'app-benefit-upload-error-audit',
  templateUrl: './benefit-upload-error-audit.component.html',
  styleUrls: ['./benefit-upload-error-audit.component.css']
})
export class BenefitUploadErrorAuditComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() title: string;

  displayedColumns: string[] = ['benefitName', 'errorCategory', 'errorMessage', 'excelRowNumber','fileName','createdDate'];
  isSearching: boolean;
  query = '';
  dataSource: BenefitsUploadDataSource;
  alertService: AlertService;
  appEventManagerService: AppEventsManager;
  currentQuery: any;
  selectedClientType: number;

  constructor(public router: Router,
    public benefitService: BenefitService,
    appEventsManager: AppEventsManager,
    alertService: AlertService) { 
      this.alertService = alertService;
      this.appEventManagerService = appEventsManager;
    }

  ngOnInit(): void {
    this.dataSource = new BenefitsUploadDataSource(this.benefitService);
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
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

  search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(): void {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  reset() {
    this.paginator.firstPage();
    this.loadData();
  }
}
