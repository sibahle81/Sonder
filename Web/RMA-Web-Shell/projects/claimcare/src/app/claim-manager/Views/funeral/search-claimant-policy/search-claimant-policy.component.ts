import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { SearchClaimantPolicyDataSource } from './search-claimant-policy.datasource';
import { RolePlayerSearchResult } from '../../../shared/entities/funeral/roleplayer-search-result';

@Component({
  selector: 'search-claimant-policy',
  templateUrl: './search-claimant-policy.component.html',
  styleUrls: ['./search-claimant-policy.component.css']
})
export class SearchClaimantPolicyComponent implements OnInit, AfterViewInit {
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
  @Output() resultEmit: EventEmitter<RolePlayerSearchResult> = new EventEmitter();

  dataSource: SearchClaimantPolicyDataSource;
  userService: any;
  currentQuery: any;
  router: any;
  form: any;
  isReset = false;
  formBuilder: any;
  alertService: AlertService;
  claimCareService: ClaimCareService;
  appEventManagerService: AppEventsManager;
  headerTitle: string;
  displayedColumns = ['policyNumber', 'memberFirstName', 'memberLastName', 'memberRole', 'status', 'employeeNumber', 'claimReferenceNumber', 'actions'];
  constructor(
    appEventsManager: AppEventsManager,
    claimCareService: ClaimCareService,
    alertService: AlertService
  ) {

    this.alertService = alertService;
    this.appEventManagerService = appEventsManager;
    this.claimCareService = claimCareService;
  }

  ngOnInit(): void {
    this.headerTitle = this.title;
    this.dataSource = new SearchClaimantPolicyDataSource(this.claimCareService);
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
            this.isReset = false;
            this.loadData();
          }
          if (this.currentQuery.length == 0) {
            this.reset()
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  reset() {
    this.filter.nativeElement.value = '';
    this.paginator.pageIndex = 0;
    this.dataSource.resetData();
    this.isReset = true;
  }

  loadData() {
    this.currentQuery = this.currentQuery.trim();
    if (this.currentQuery.length >= 3) {
      this.dataSource.getData({
        query: this.currentQuery,
        pageNumber: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        orderBy: this.sort.active,
        sortDirection: this.sort.direction,
        showActive: this.showActiveCheckBoxInput
      });
    }
  }

  onSelected(item: RolePlayerSearchResult): void {
    this.resultEmit.emit(item);
  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value.trim();
    if (this.currentQuery.length >= 3) {
      this.isSearching = true;
      this.loadData();
      this.isSearching = false;
    }
  }

  validateQuery() {
    this.form.get('query').setErrors(null);
    this.form.get('query').updateValueAndValidity();
    const query = this.form.get('query').value as string;

    switch (this.selectedFilterTypeId) {
      case 2:
        const maxDigits = query.match('^[0-9]{13}$');
        const numbersOnly = query.match('^[0-9]*$');
        if (maxDigits === null) {
          this.form.get('query').setErrors({ idCheck: true });
        }
        if (numbersOnly === null) {
          this.form.get('query').setErrors({ onlyNumbers: true });
        }
        if (maxDigits !== null && numbersOnly !== null) {
          this.form.get('query').setErrors(null);
          this.form.get('query').updateValueAndValidity();
        }
        break;
      case 7:
        const alphaOnly = query.match('^[a-zA-Z ]+$');
        if (alphaOnly === null) {
          this.form.get('query').setErrors({ onlyAlpha: true });
        }
        if (alphaOnly !== null) {
          this.form.get('query').setErrors(null);
          this.form.get('query').updateValueAndValidity();
        }
        break;
      default: return;
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

  selectedFilterChanged($event: any) {
    if (this.filters[0].id === 0) {
      this.filters.shift();
    }
    this.selectedFilterTypeId = $event.value as number;
  }
}

