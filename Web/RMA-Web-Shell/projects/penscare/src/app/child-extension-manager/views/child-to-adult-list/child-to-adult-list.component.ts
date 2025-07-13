import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ChildToAdultListDataSource } from './child-to-adult-list-datasource';
import { fromEvent, Subscription, merge } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ChildToAdultPensionLedger } from '../../../shared-penscare/models/child-to-adult-pension-ledger.model';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-child-to-adult-list',
  templateUrl: './child-to-adult-list.component.html',
  styleUrls: ['./../../styles/child-to-adult-list.css', './../../../styles/penscare.css'],
  providers: [ChildToAdultListDataSource]
})
export class ChildToAdultListComponent implements OnInit {
  @ViewChild('searchField', { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  currentQuery: string;
  creatingWizard = false;

  menus: { title: string, action: string, disable: boolean}[];
  displayedColumns = ['beneficiaryName', 'dateOfBirth',  'expiryDate', 'pensionCaseNumber','actions'];
  constructor(
    public readonly dataSource: ChildToAdultListDataSource,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private wizardService: WizardService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
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

    this.search(true);
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  search(isInitialLoad?: boolean): void {
    if (this.form.valid) {
        this.currentQuery = this.readForm();
        this.dataSource.getData(1, 5 , 'desc', '', this.currentQuery);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5 , 'desc', '', '');
    }
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  filterMenu(item: any) {
    this.menus = null;
    this.menus =
      [
        { title: 'Extend', action: 'extend', disable: false }
      ];
  }

  onMenuItemClick(item: ChildToAdultPensionLedger, menu): void {
    switch (menu.action) {
      case 'extend':
        this.startWizard(item)
        break
    }
  }

  startWizard(data: ChildToAdultPensionLedger) {
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'child-extension';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.creatingWizard = false;
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      this.router.navigateByUrl(`/penscare/child-extension-manager/child-extension/continue/${result.id}`);
    });
  }
}
