import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Refund } from '../../../models/refund';
import { RefundListDataSource } from './refund-list.datasource';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Router } from '@angular/router';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { RefundReasonEnum } from 'projects/fincare/src/app/shared/enum/refund-reason.enum';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.component.html',
  styleUrls: ['./refund-list.component.css']
})
export class RefundListComponent implements OnInit, AfterViewInit {

  selectedFilterTypeId = 0; // default to Filter
  rootMenus: { title: string, url: string, submenu: boolean, disable: boolean }[];
  subMenus: { title: string, url: string, disable: boolean }[];
  filters: { title: string, id: number }[];
  filterSearch: string;
  isSearching: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  dataSource: RefundListDataSource;
  userService: any;
  currentQuery: any;
  form: any;
  formBuilder: any;
  alertService: AlertService;
  roleplayerService: RolePlayerService;
  appEventManagerService: AppEventsManager;
  headerTitle: string;
  // displayedColumns = ['policyNumber', 'displayName', 'refundAmount', 'actions'];
  displayedColumns = ['policyNumber', 'refundAmount', 'actions'];


  constructor(
    appEventsManager: AppEventsManager,
    roleplayerService: RolePlayerService,
    alertService: AlertService,
    private readonly wizardService: WizardService,
    private readonly router: Router
  ) {

    this.alertService = alertService;
    this.appEventManagerService = appEventsManager;
    this.roleplayerService = roleplayerService;
  }

  ngOnInit(): void {
    this.headerTitle = 'Refunds';
    this.dataSource = new RefundListDataSource(this.roleplayerService);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

      fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => {
            this.currentQuery = this.filter.nativeElement.value;
            this.paginator.pageIndex = 0;
            this.loadData();
          })
        )
        .subscribe();

      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          tap(() => this.loadData())
        )
        .subscribe();

      this.search();
    });
  }

  loadData() {
    this.dataSource.getData({
      query: this.currentQuery,
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      orderBy: this.sort.active,
      sortDirection: this.sort.direction
    });
  }

  onSelected(item: Refund): void {
    this.dataSource.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = item.rolePlayerId;
    startWizardRequest.type = 'refund';
    item.trigger = RefundTypeEnum.PolicyCancellation;
    item.refundReason = RefundReasonEnum.PolicyCancellation;
    startWizardRequest.data = JSON.stringify(item);
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.router.navigateByUrl(`fincare/billing-manager/refund/continue/${wizard.id}`);
    });
  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.loadData();
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

