import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PreAuthorisationSearchFullDataSource } from 'projects/medicare/src/app/medi-manager/datasources/preauth-search-full-datasource';
import { PreauthTypeEnum } from '../../../enums/preauth-type-enum';

@Component({
  selector: 'preauth-search-full-component',
  templateUrl: './preauth-search-full.component.html',
  styleUrls: ['./preauth-search-full.component.css']
})
export class PreauthSearchFullComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  currentQuery: string;
  displayedColumns: string[] = ['preAuthId', 'personEventId', 'preAuthNumber', 'dateAuthorisedFrom', 'dateAuthorisedTo', 'preAuthStatus'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filterPreAuthNumber', { static: true }) filterPreAuthNumber: ElementRef;
  @ViewChild('filterDescription', { static: true }) filterDescription: ElementRef;
  @ViewChild('filterAuthComments', { static: true }) filterAuthComments: ElementRef;
  dataSource: PreAuthorisationSearchFullDataSource;

  constructor(
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.dataSource = new PreAuthorisationSearchFullDataSource(this.mediCarePreAuthService);
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

  onSelect(item: PreAuthorisation): void {
    if (item.preAuthType == PreauthTypeEnum.Treatment) {
      this.router.navigate(['/medicare/treatment-preauth-details', item.preAuthId]);
    }
    else {
      this.router.navigate(['/medicare/preauth-view', item.preAuthId]);
    }
  }

  search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(): void {
    let queryData = new PreAuthorisation;
    queryData.preAuthNumber = this.filterPreAuthNumber.nativeElement.value.replace(" ", ",").replace(/\//g, '|');
    queryData.requestComments = this.filterDescription.nativeElement.value.replace(" ", ",").replace(/\//g, '|');
    queryData.reviewComments = this.filterAuthComments.nativeElement.value.replace(" ", ",").replace(/\//g, '|');
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, 'preAuthId', this.sort.direction, JSON.stringify(queryData));
  }

}
