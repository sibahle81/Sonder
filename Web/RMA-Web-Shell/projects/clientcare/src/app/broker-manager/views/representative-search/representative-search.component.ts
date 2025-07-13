import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { RepresentativeSearchDataSource } from 'projects/clientcare/src/app/broker-manager/datasources/representative-search.datasource';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'representative-search',
  templateUrl: './representative-search.component.html',
  styleUrls: ['./representative-search.component.css']
})
export class RepresentativeSearchComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  canEdit = false;

  displayedColumns = ['code', 'name', 'idNumber', 'actions'];
  currentQuery: string;

  @Input() selectOnly: boolean;
  @Output() newItemSelectedEvent = new EventEmitter<Representative>();
  showResults: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  dataSource: RepresentativeSearchDataSource;

  constructor(
    public readonly brokerService: RepresentativeService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.dataSource = new RepresentativeSearchDataSource(this.brokerService);
    this.checkUserPermissions();
  }

  checkUserPermissions(): void {
    this.canEdit = userUtility.hasPermission('Edit Representative');
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

  onSelect(item: Representative): void {
    this.router.navigate(['clientcare/broker-manager/broker-details', item.id]);
  }

  search() {
    this.showResults = true;
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(): void {
    this.showResults = true;
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  linkAgent(item: Representative): void {
    this.router.navigate(['clientcare/broker-manager/link-agent/new', item.id]);
  }

  selectedRepresentativeChanged(value: Representative): void {
    this.newItemSelectedEvent.emit(value);
    this.showResults = false;
  }
}
