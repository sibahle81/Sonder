import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PensCareTableLedgerDataSource } from './penscare-table-ledger-datasource';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PensionLedgerStatusEnum } from 'projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PensionCaseStatusEnum } from '../../../shared-penscare/enums/pensioncase-status-enum';
import { PensionTypeEnum } from '../../../shared-penscare/enums/pension-type-enum';

@Component({
  selector: 'app-penscare-table-ledger',
  templateUrl: './penscare-table-ledger.component.html',
  styleUrls: ['./penscare-table-ledger.component.css', './../../../styles/penscare.css'],
  providers: [PensCareTableLedgerDataSource]
})
export class PenscareTableLedgerComponent implements OnInit {
  @ViewChild('editTypeInput', { static: true }) editTypeInput: ElementRef;

  form: UntypedFormGroup;
  currentQuery: string;
  elementKeyUp: Subscription;
  beneficiaryType = BeneficiaryTypeEnum;
  pensionCaseStatus = PensionCaseStatusEnum;
  pensionType = PensionTypeEnum;
  editPensionCaseMode = false;
  canEdit = false;
  menus: { title: string, action: string, disable: boolean, status?: PensionLedgerStatusEnum }[];

  displayedColumns = ['pensionCaseNumber', 'pensionType', 'modifiedDate', 'StatusDescription', 'pensionerName', 'actions'];
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('searchField', { static: false }) filter: ElementRef;


  constructor(
    public readonly dataSource: PensCareTableLedgerDataSource,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly alertService: AlertService,
    private dialog: MatDialog,
    private wizardService: WizardService,
    private readonly router: Router) {
  }

  ngOnInit(): void {
    this.createForm();
    this.setPermissions();
  }

  setPermissions(): void {
    this.canEdit = userUtility.hasPermission('Edit Pension Case');
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

  onSelect(item: any): void {
    this.router.navigate(['penscare/view-pensioncase/', item.pensionCaseId]);
  }

  onMenuItemClick(item: any, menu): void {

    switch (menu.action) {
      case 'ledger-corrective-entries':
      case 'commutation-entry-list':
        this.router.navigate([`penscare/${menu.action}/`, item.pensionCaseId]);
        break;
      case 'view':
        this.router.navigate(['penscare/view-pensioncase/', item.pensionCaseId]);
        break;
    }
  }

  getDialogConfig(data): MatDialogConfig {
    const config = new MatDialogConfig();
    config.data = data;
    return config;
  }


  onBackToSearch() {
    this.editPensionCaseMode = false;
  }

  filterMenu(item: any) {
    this.menus = null;
    this.menus =
      [
        { title: 'View Pension Case', action: 'view', disable: false },
        { title: 'Commutation', action: 'commutation-entry-list', disable: item.beneficiaryType == this.beneficiaryType.Child || [PensionLedgerStatusEnum.Closed, PensionLedgerStatusEnum.Stopped].includes(item.status) },
        { title: 'Corrective Entry', action: 'ledger-corrective-entries', disable: false },
      ];
  }
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  search(isInitialLoad?: boolean): void {
    this.paginator.pageIndex = 0;
    if (this.form.valid) {
      this.currentQuery = this.readForm();
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5, 'PensionCaseNumber', '', '');
    }
  }

  clearFilter(): void {
    this.form.patchValue({ query: '' });
  }

  back(): void {
  }

  ngOnDestroy(): void {
    if (this.elementKeyUp) { this.elementKeyUp.unsubscribe() }
  }
}

