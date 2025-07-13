import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NotesDialogComponent } from 'projects/shared-components-lib/src/lib/notes-dialog/notes-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { CadPool } from '../../../shared/entities/funeral/cad-pool.model';
import { PersonEventType } from '../../../shared/enums/personEvent.enum';
import { EarningsAssessorPoolDataSource } from './earnings-assessor-pool.datasource';
import { PersonEventSmsAuditComponent } from 'projects/claimcare/src/app/claim-manager/views/person-event-sms-audit/person-event-sms-audit.component';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AllocateClaimUserComponent } from '../claim-workpool/allocate-claim-user/allocate-claim-user.component';
import { ManageClaimUserComponent } from '../claim-workpool/manage-claim-user/manage-claim-user.component';
import { ReAllocateClaimUserComponent } from '../claim-workpool/re-allocate-claim-user/re-allocate-claim-user.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';

@Component({
  selector: 'app-earnings-assessor-pool',
  templateUrl: './earnings-assessor-pool.component.html',
  styleUrls: ['./earnings-assessor-pool.component.css']
})
export class EarningsAssessorPoolComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  currentQuery: any;
  form: any;
  query = '';
  showSearch = false;
  dataSource: EarningsAssessorPoolDataSource;
  checkedClaimsToAllocate: any[];
  buttonAccessToUser = true;
  currentUserObject: User;
  permissionClaimSearchSortFilter: boolean;

  menus: { title: string; url: string; disable: boolean }[];
  holisticView = 'claimcare/claim-manager/holistic-claim-view/';

  constructor(
    public dialog: MatDialog,
    readonly router: Router,
    private readonly claimCareService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService) {
  }

  placeHolder = 'Search by Claim Number, Employee Name or Identification Number';

  displayedColumns: string[] = ['select', 'assignedTo', 'personEventCreatedBy', 'description', 'dateSent', 'dateDue', 'priority', 'eventNumber', 'personEventId', 'lifeAssured',
    'identificationNumber', 'lastModifiedBy', 'sourceApplication', 'actions'];


  ngOnInit(): void {
    this.dataSource = new EarningsAssessorPoolDataSource(this.claimCareService);
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    this.checkedClaimsToAllocate = new Array();
    this.currentUserObject = this.authService.getCurrentUser();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.permissionClaimSearchSort();
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
}, 1)
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
      { title: 'View', url: this.holisticView, disable: false },
      { title: 'Email Audit', url: '', disable: false },
      { title: 'SMS Audit', url: '', disable: false },
      { title: 'View Notes', url: '', disable: false },
    ];
  }

  onMenuSelect(item: CadPool, menu: any) {
    switch (menu.title) {
      case 'View':
        this.allocateUserToClaim('Allocate', item);
        menu.url = this.holisticView;
        this.getEvent(item.personEventId, menu.url);
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

  getEvent(personEventId: number, url: any) {
    this.claimCareService.getPersonEvent(personEventId).subscribe(result => {
      if (result) {
        this.router.navigateByUrl(url + result.eventId + '/' + personEventId);
      }
    })
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

  getIndustryClass(id: number) {
    return this.format(IndustryClassEnum[id]);
  }

  format(text: string) {
    const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
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

  AddCheckedItems(event, item) {

    if (event.checked === true) {
      let valueExist = false;
      for (const value of this.checkedClaimsToAllocate) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === false) {
        this.checkedClaimsToAllocate.push(item.id, item);
        if (item.lastWorkedOnUserId === 0 || item.lastWorkedOnUserId === undefined) {
          this.buttonAccessToUser = false;
        }
      }
    } else if (event.checked === false) {
      let valueExist = false;
      this.buttonAccessToUser = true;
      for (const value of this.checkedClaimsToAllocate) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === true) {
        const index: number = this.checkedClaimsToAllocate.indexOf(item.id);
        if (index !== -1) {
          this.checkedClaimsToAllocate.splice(index, 2);
        }
      }
    }
  }


  openAllocateToUsersPopup(): void {
    if (this.checkedClaimsToAllocate.length === 0) {
      this.alertService.error(`No item selected`, 'Allocate', true);
      return;
    }
    // ===Check if it already allocated to a user : if so then cant allocate again
    let valueExist = false;
    if (this.checkedClaimsToAllocate.length > 0) {
      for (const value of this.checkedClaimsToAllocate) {
        const index: number = this.checkedClaimsToAllocate.indexOf(value);
        if (index % 2 !== 0) {
          const personEventAssignedTo = value.personEventAssignedTo;
          if (personEventAssignedTo !== null || (value.userName !== null)) {
            valueExist = true;
          }
        }
      }
      if (valueExist === true) {
        this.alertService.error(`Already allocated. Cannot allocate again. Use Re-Allocate`, 'Allocate', true);
        return;
      }
    }

    // ===Check if it Claim exist
    let claimExist = true;
    if (this.checkedClaimsToAllocate.length > 0) {
      for (const value of this.checkedClaimsToAllocate) {
        const index: number = this.checkedClaimsToAllocate.indexOf(value);
        if (index % 2 !== 0) {
          const existingClaimId = 0;
          if (existingClaimId === 0 || existingClaimId === null) {
            claimExist = false;
          }
        }
      }
    }

    const dialogRef = this.dialog.open(AllocateClaimUserComponent, {
      data: this.checkedClaimsToAllocate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Allocate') {
        this.loadData();
        this.checkedClaimsToAllocate = new Array();
      }
    });
  }


  openReAllocateToUsersPopup(): void {
    // ====Check how many items selected. if more than one than dont open popup for users to re allocate
    if (this.checkedClaimsToAllocate.length === 0) {
      this.alertService.error(`No item selected`, 'Re-Allocate', true);
      return;
    }
    if (this.checkedClaimsToAllocate.length <= 2) {
      if ((this.checkedClaimsToAllocate[1].userId === 0 || this.checkedClaimsToAllocate[1].userId === null) && this.checkedClaimsToAllocate[1].userName === null) {
        this.alertService.error(`You can only reallocate if the item is already allocated to a user`, 'Re-Allocate', true);
        return;
      } else {
        const dialogRef = this.dialog.open(ReAllocateClaimUserComponent, {
          data: this.checkedClaimsToAllocate
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'ReAllocate') {
            this.loadData();
            this.checkedClaimsToAllocate = new Array();
          }
        });
      }
    } else {
      this.alertService.error(`More than one item selected`, 'Re-Allocate', true);
      return;
    }
  }

  openManageUsersPopup(): void {
    const def: any[] = [];
    const dialogRef = this.dialog.open(ManageClaimUserComponent, {
      data: this.checkedClaimsToAllocate
    });
  }

  allocateUserToClaim(allocateUserToClaim, item: CadPool): void {
    let valueExist = false;
    if (item !== null) {
      const assignedToUserId = item.personEventAssignedTo;
      if (assignedToUserId !== null || (item.userName !== null)) {
        valueExist = true;
      }
    }

    if (valueExist === true) {
      return;
    }
    else {
      this.alertService.loading(`Allocating...`, 'Allocate', true);
      let claimId = item.claimId;
      const workPoolId = item.workPoolId;
      let nWorkPoolId = 0;
      if (workPoolId != null) {
        nWorkPoolId = workPoolId;
      }
      if (claimId == null) {
        claimId = 0;
      }
      this.claimCareService.updateClaimWithWorkPool(claimId, item.personEventId, nWorkPoolId, item.wizardId, item.claimStatusId, this.currentUserObject.id).subscribe(result => {
        allocateUserToClaim;
      });
    }

  }

  permissionClaimSearchSort(): void {
    this.permissionClaimSearchSortFilter = userUtility.hasPermission('Claim searching Sorting filtering');
    if(this.authService.getCurrentUser().roleName === 'Claims Assessor')
    {
      this.permissionClaimSearchSortFilter = false
    }
    
  }
}
