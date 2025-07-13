import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, Form, UntypedFormGroup } from '@angular/forms';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, filter, map } from 'rxjs/operators';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-seach-debtor',
  templateUrl: './seach-debtor.component.html',
  styleUrls: ['./seach-debtor.component.css']
})

export class SeachDebtorComponent implements OnInit, AfterViewInit {
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
  @Output() itemSelected: EventEmitter<DebtorSearchResult> = new EventEmitter();

  datasource = new MatTableDataSource<DebtorSearchResult>();
  currentQuery = '';
  form: UntypedFormGroup;
  displayedColumns = ['finPayeeNumber', 'displayName', 'idNumber', 'emailAddress', 'industryClass', 'actions'];
  searchReturned = false;
  hideNoResultsMessage = true;

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        filter(((key: any) => key.target.value.length > 2)),
        tap(() => this.isSearching = true),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((key: any) => this.rolePlayerService.searchForFinPayees(key.target.value)),
        tap((data: DebtorSearchResult[]) => {
          this.searchReturned = true;
          this.currentQuery = this.filter.nativeElement.value;
          this.datasource.data = this.getUnique(data, 'finPayeNumber');
          if (data.length > 0) {
            this.hideNoResultsMessage = true;
          } else {
            this.hideNoResultsMessage = false;
          }
          this.isSearching = false;
        }))
      .subscribe();
  }

  getUnique(arr, comp) {
    const unique = arr.map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => arr[e]).map(e => arr[e]);
    return unique;
  }

  onSelected(item: DebtorSearchResult): void {
    this.itemSelected.emit(item);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl('')
    });
  }

  search() {
    this.rolePlayerService.searchForFinPayees(this.filter.nativeElement.value).
      subscribe((data: DebtorSearchResult[]) => {
        this.searchReturned = true;
        this.currentQuery = this.filter.nativeElement.value;
        this.datasource.data = this.getUnique(data, 'finPayeNumber');
        if (data.length > 0) {
          this.hideNoResultsMessage = true;
        } else {
          this.hideNoResultsMessage = false;
        }
        this.isSearching = false;
      });
  }
}

