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
import { CmcPoolDataSource } from './cmc-pool.datasource';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';
import { PersonEventSmsAuditComponent } from '../person-event-sms-audit/person-event-sms-audit.component';

@Component({
  selector: 'app-cmc-pool',
  templateUrl: './cmc-pool.component.html',
  styleUrls: ['./cmc-pool.component.css']
})
export class CmcPoolComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  currentQuery: any;
  form: any;
  query = '';
  showSearch = false;
  dataSource: CmcPoolDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  public isLoading = false;

  constructor(
    public dialog: MatDialog,
    readonly router: Router,
    private readonly claimCareService: ClaimCareService) {
  }

  placeHolder = 'Search by Claim Number, Employee Name or Identification Number';

  displayedColumns: string[] = ['select','assignedTo','personEventCreatedBy','description','dateSent','dateDue','priority','eventNumber', 'personEventId', 'lifeAssured',
  'identificationNumber','lastModifiedBy', 'sourceApplication', 'actions'];


  ngOnInit(): void {
    this.isLoading = true;
    this.dataSource = new CmcPoolDataSource(this.claimCareService);
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

  getClaimType(id: number) {
    return this.format(ClaimTypeEnum[id]);
  }

  format(text: string) {
    const status = text.replace(/([A-Z])/g, '$1').trim();
    return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
  }

  sortData(dataSource: any): CadPool[] {
    if (!this.sort.active || this.sort.direction === '') { return dataSource.data; }

    return dataSource.data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this.sort.active) {
        case 'assignedTo': [propertyA, propertyB] = [a.personEventAssignedTo, b.personEventAssignedTo]; break;
        case 'personEventCreatedBy': [propertyA, propertyB] = [a.personEventCreatedBy, b.personEventCreatedBy]; break;
        case 'description': [propertyA, propertyB] = [a.description, b.description]; break;
        case 'dateSent': [propertyA, propertyB] = [a.dateCreated.toString(), b.dateCreated.toString()]; break;
        case 'dateDue': [propertyA, propertyB] = [a.dateCreated.toString(), b.dateCreated.toString()]; break;
        case 'priority': [propertyA, propertyB] = [a.priority, b.priority]; break;
        case 'eventNumber': [propertyA, propertyB] = [a.eventNumber, b.eventNumber]; break;
        case 'personEventId': [propertyA, propertyB] = [a.claimNumber, b.claimNumber]; break;
        case 'lifeAssured': [propertyA, propertyB] = [a.lifeAssured, b.lifeAssured]; break;
        case 'identificationNumber': [propertyA, propertyB] = [a.identificationNumber, b.identificationNumber]; break;
        case 'lastModifiedBy': [propertyA, propertyB] = [a.lastModifiedBy, b.lastModifiedBy]; break;
        case 'sourceApplication': [propertyA, propertyB] = [a.application, b.application]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
  }
}
