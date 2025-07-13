import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NotesDialogComponent } from 'projects/shared-components-lib/src/lib/notes-dialog/notes-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ClaimCareService } from '../../Services/claimcare.service';
import { CadPool } from '../../shared/entities/funeral/cad-pool.model';
import { PersonEventType } from '../../shared/enums/personEvent.enum';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';
import { CadPoolDataSource } from '../work-pools/cad-pool/cad-pool.datasource';
import { PersonEventSmsAuditComponent } from '../person-event-sms-audit/person-event-sms-audit.component';

@Component({
  selector: 'app-cad-pool',
  templateUrl: './cad-pool.component.html',
  styleUrls: ['./cad-pool.component.css']
})
export class CadPoolComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  currentQuery: any;
  form: any;
  query = '';
  showSearch = false;
  dataSource: CadPoolDataSource;
  menus: { title: string; url: string; disable: boolean }[];

  constructor(
    public dialog: MatDialog,
    readonly router: Router,
    private readonly claimCareService: ClaimCareService) {
  }

  placeHolder = 'Search by Claim Number, Employee Name or Identification Number';

  displayedColumns: string[] = ['select', 'dateCreated', 'claimNumber', 'lifeAssured', 'personEventStatusId', 'personEventStatusName', 'identificationNumber', 'personEventCreatedBy',
    'userName', 'userSLAHours', 'overAllSLAHours', 'lastModifiedBy', 'STPExitReason', 'actions'];


  ngOnInit(): void {
    this.dataSource = new CadPoolDataSource(this.claimCareService);
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
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
            this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
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
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  filterMenu(item: CadPool) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: 'claimcare/claim-manager/claim-notification-view/', disable: false },
      { title: 'Email Audit', url: '', disable: false },
      { title: 'SMS Audit', url: '', disable: false },
      { title: 'View Notes', url: '', disable: false },
    ];
  }

  onMenuSelect(item: CadPool, menu: any) {
    switch (menu.title) {
      case 'View':
        this.router.navigateByUrl(menu.url + item.personEventId);
        break;
      case 'Email Audit':
        this.openEmailAuditDialog(item);
        break;
      case 'SMS Audit':
        this.openSmsAuditDialog(item);
        break;
      case 'View Notes':
        this.openNotesDialog(item);
        break;
    }
  }

  openEmailAuditDialog($event: CadPool) {
    if ($event) {
      const dialogRef = this.dialog.open(ViewEmailAuditDialogComponent, {
        width: '80%',
        maxHeight: '750px',
        disableClose: true,
        data: {
          itemType: 'PersonEvent',
          itemId: $event.personEventId
        }
      });
    }
  }

  openSmsAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: 'PersonEvent',
      itemId: row.personEventId
    };
    this.dialog.open(PersonEventSmsAuditComponent,
      dialogConfig);
  }

  openNotesDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      serviceType: ServiceTypeEnum.ClaimManager,
      itemType: 'PersonEvent',
      itemId: row.personEventId
    };
    this.dialog.open(NotesDialogComponent,
      dialogConfig);
  }

  reset() {
    this.paginator.firstPage();
    this.loadData();
  }

  getStatus(pevStatusId: number): string {
    const statusText = PersonEventType[pevStatusId];
    return statusText;
  }

  getSTPExitReason(id: number) {
    return this.format(STPExitReasonEnum[id]);
  }

  format(text: string) {
    const status = text.replace(/([A-Z])/g, '$1').trim();
    return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
  }
}
