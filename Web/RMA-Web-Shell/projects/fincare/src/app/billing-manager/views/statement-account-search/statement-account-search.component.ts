import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { StatementAccountSearchDataSource } from './statement-account-search.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'statement-account-search',
  templateUrl: './statement-account-search.component.html',
  styleUrls: ['./statement-account-search.component.css']
})
export class StatementAccountSearchComponent implements OnInit, AfterViewInit {
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
  @Output() resultEmit: EventEmitter<SearchAccountResults> = new EventEmitter();

  dataSource: StatementAccountSearchDataSource;
  currentQuery: any;
  router: any;
  form: any;
  formBuilder: any;
  headerTitle: string;
  displayedColumns = ['finPayeNumber', 'displayName', 'emailAddress', 'actions'];

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.headerTitle = this.title;
    this.dataSource = new StatementAccountSearchDataSource(this.invoiceService);
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
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData() {

    this.dataSource.getData({
      query: this.currentQuery,
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      orderBy: this.sort.active,
      sortDirection: this.sort.direction,
      showActive: this.showActiveCheckBoxInput
    });
  }

  onSelected(item: SearchAccountResults): void {
    this.resultEmit.emit(item);
  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value;

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


