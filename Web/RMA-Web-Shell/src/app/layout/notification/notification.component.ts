import { Component, OnInit, ElementRef, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NotificationDatasource } from './notification.datasource';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit, AfterViewInit  {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  displayedColumns = ['name', 'type', 'createdBy', 'createdDate', 'lockedStatus', 'wizardStatusText', 'actions'];
  currentUser: User;
  wizardConfigIds: string;
  title: string;
  type: string;
  placeHolder = 'Filter by name, type, created by or status';
  searchText: string;
  currentQuery: any;
  dataSource: NotificationDatasource;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NotificationComponent>,
    public wizardService: WizardService
  ) {
    this.wizardConfigIds = data.wizardConfigIds;
    this.title = data.title;
    this.type = data.type;
  }

    ngOnInit(): void {
      this.currentUser = this.authService.getCurrentUser();
      const container = document.getElementById('notificationCard').parentElement.parentElement;
      container.style.display = 'content !important';
      container.style.padding = '0';
      this.dataSource = new NotificationDatasource(this.wizardService);
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '', this.wizardConfigIds);
      this.clearInput();
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
            } else if (this.currentQuery.length === 0) {
              this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.wizardConfigIds);
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

    search() {
      this.paginator.pageIndex = 0;
      this.loadData();
    }

    loadData(): void {
      this.currentQuery = this.filter.nativeElement.value;
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.wizardConfigIds);
    }

    formatWizardType(type: string) {
      const temp = type.replace('-', ' ');
      return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
    }

    clearInput() {
      this.filter.nativeElement.value = String.Empty;
      this.loadData();
    }

    close(): void {
      this.dialogRef.close();
    }

    onSelect(item: Wizard): void {
      Wizard.redirect(this.router, item.type, item.id);
      this.close();
    }

  }
