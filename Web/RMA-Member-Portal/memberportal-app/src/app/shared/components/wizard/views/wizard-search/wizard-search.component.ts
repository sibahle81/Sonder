import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { Wizard } from '../../shared/models/wizard';
import { WizardService } from '../../shared/services/wizard.service';
import { WizardSearchDataSource } from './wizard-search.datasource';

@Component({
  templateUrl: './wizard-search.component.html',
  // tslint:disable-next-line: component-selector
  selector: 'wizard-search'
})
export class WizardSearchComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  currentUser: string;
  currentQuery: string;
  displayedColumns = ['name', 'type', 'createdBy', 'lockedToUser', 'lockedStatus', 'wizardStatusText', 'overAllSLAHours', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  dataSource: WizardSearchDataSource;

  constructor(
    readonly wizardService: WizardService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.dataSource = new WizardSearchDataSource(this.wizardService);
    this.currentUser = this.authService.getUserEmail();
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

  onSelect(item: Wizard): void {
    Wizard.redirect(this.router, item.type, item.id);
  }

  onViewDetails(wizard: Wizard): void {
    this.router.navigate(['wizard-manager/wizard-details', wizard.id]);
  }

  search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }
}
