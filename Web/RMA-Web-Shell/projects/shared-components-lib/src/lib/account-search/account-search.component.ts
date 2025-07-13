import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { UntypedFormControl, Validators } from '@angular/forms';
import { AccountSearchDataSource } from './account-search.datasource';
import { AccountSearchResult } from '../../../../fincare/src/app/shared/models/account-search-result';
import { AccountService } from '../../../../fincare/src/app/shared/services/account.service';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'account-search',
  templateUrl: './account-search.component.html',
  styleUrls: ['./account-search.component.css']
})

export class AccountSearchComponent implements OnInit, AfterViewInit {
  selectedFilterTypeId = 0; // default to Filter
  showActiveCheckBoxInput = true;
  rootMenus: { title: string, url: string, submenu: boolean, disable: boolean }[];
  subMenus: { title: string, url: string, disable: boolean }[];
  filters: { title: string, id: number }[];
  filterSearch: string;
  isSearching: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @Input() title: string;
  @Output() itemSelected: EventEmitter<AccountSearchResult> = new EventEmitter();

  dataSource: AccountSearchDataSource;
  userService: any;
  currentQuery: any;
  form: any;
  formBuilder: any;
  alertService: AlertService;
  accountService: AccountService;
  appEventManagerService: AppEventsManager;
  headerTitle: string;
  displayedColumns = ['finPayeNumber', 'displayName', 'emailAddress', 'actions'];

  constructor(
    appEventsManager: AppEventsManager,
    accountService: AccountService,
    alertService: AlertService) {
    this.alertService = alertService;
    this.appEventManagerService = appEventsManager;
    this.accountService = accountService;
  }

  ngOnInit(): void {
    this.headerTitle = !this.title ? 'Debtor Account Search' : this.title;
    this.dataSource = new AccountSearchDataSource(this.accountService, this.alertService);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          }
        })).subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadData())).subscribe();
  }

  loadData() {
    this.dataSource.getData({
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      orderBy: this.sort.active,
      sortDirection: this.sort.direction,
      query: this.currentQuery,
    });
  }

  onSelected(item: AccountSearchResult): void {
    this.itemSelected.emit(item);
  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value;

    if (this.currentQuery.length >= 3) {
      this.isSearching = true;

      this.loadData();

      this.isSearching = false;
    }
  }

  createForm(): void {
    this.currentQuery = '';
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      query: new UntypedFormControl('', [Validators.minLength(3), Validators.required])
    });
    this.patchDefaultValues();
  }

  patchDefaultValues() {
    this.form.patchValue({
      filter: this.filters
    });
  }
}

