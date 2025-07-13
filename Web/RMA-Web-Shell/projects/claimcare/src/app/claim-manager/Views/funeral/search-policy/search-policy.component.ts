import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { SearchPolicyDataSource } from './search-policy.datasource';
import { RolePlayerSearchResult } from '../../../shared/entities/funeral/roleplayer-search-result';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';

@Component({
  selector: 'claim-search-policy',
  templateUrl: './search-policy.component.html',
  styleUrls: ['./search-policy.component.css'],
})
export class SearchPolicyComponent implements OnInit, AfterViewInit {
  selectedFilterTypeId = 0; // default to Filter
  showActiveCheckBoxInput = true;
  rootMenus: { title: string, url: string, submenu: boolean, disable: boolean }[];
  subMenus: { title: string, url: string, disable: boolean }[];
  filters: { title: string, id: number }[];
  filterSearch: string;
  isSearching: boolean;
  placeHolder = "Search by Name, Surname, Identity Number, Passport Number, Employee Number";

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @Input() title: string;
  @Output() resultEmit: EventEmitter<RolePlayerSearchResult> = new EventEmitter();

  dataSource: SearchPolicyDataSource;
  userService: any;
  currentQuery: any;
  router: any;
  form: any;
  formBuilder: any;
  alertService: AlertService;
  claimCareService: ClaimCareService;
  appEventManagerService: AppEventsManager;
  headerTitle: string;
  isDisabled = false;
  isReset = false;
  cancelledStatus = PolicyStatusEnum.Cancelled;
  displayedColumns = ['policyNumber', 'policyStatus', 'policyCancelReason', 'memberFirstName', 'memberLastName', 'memberRole', 'status', 'employeeNumber', 'claimReferenceNumber', 'actions'];
  constructor(
    // dataSource: LandingSearchDataSource,
    // formBuilder: FormBuilder,
    // router: Router,
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
    this.dataSource = new SearchPolicyDataSource(this.claimCareService);
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
    this.isSearching = true;
    let query = this.currentQuery as string;
    query = query.trim();
    if (!query) {
      return;
    } else {
      this.dataSource.getData({
        query: query,
        pageNumber: this.paginator.pageIndex + 1,
        pageSize: this.paginator.pageSize,
        orderBy: this.sort.active,
        sortDirection: this.sort.direction,
        showActive: this.showActiveCheckBoxInput
      });
    }
  }

  onSelected(item: RolePlayerSearchResult): void {
    if (item.policyStatus === PolicyStatusEnum[PolicyStatusEnum.Cancelled]) {
      this.alertService.error('Policy has been cancelled, cant proceed');
    } else { this.resultEmit.emit(item); }


  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value;

    if (this.currentQuery.length >= 3) {
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
