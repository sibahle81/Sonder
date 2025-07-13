import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { EventModel } from '../../../entities/personEvent/event.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatDialog } from '@angular/material/dialog';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';

@Component({
  selector: 'employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnChanges {
  @Input() event: EventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  //optional inputs
  @Input() isInjury = false;
  @Input() closeInjuryList = false;

  @Input() triggerRefresh = false;
  @Input() isDocumentTab = false;

  @Output() emitRefresh: EventEmitter<boolean> = new EventEmitter();

  documentSets: DocumentSetEnum[] = [];

  menus: { title: string; action: string; disable: boolean }[];

  personEvents: PersonEventModel[];
  selectedPersonEvent: PersonEventModel;

  dataSource = new MatTableDataSource<PersonEventModel>();
  mode: ModeEnum;
  heading = '';
  editEmployee = true;
  viewDocuments = false;

  accident = EventTypeEnum.Accident;
  disease = EventTypeEnum.Disease;

  @ViewChild(MatPaginator, { static: false }) set paginator(
    value: MatPaginator
  ) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.setObjectIfDisease();
    this.populateEmployeeTable();
    this.setHeading();
  }

  setObjectIfDisease() {
    if (this.event.eventType == EventTypeEnum.Disease) {
      this.event.personEvents[0].rolePlayer = this.event.personEvents && this.event.personEvents[0]?.rolePlayer ? this.event.personEvents[0]?.rolePlayer : new RolePlayer();
    }
  }

  populateEmployeeTable() {
    if (this.event.personEvents) {
      this.personEvents = this.event.personEvents?.filter((a) => a.rolePlayer.person != null && a.rolePlayer.person.idType > 0);
    }

    this.dataSource = new MatTableDataSource(this.personEvents);
    this.dataSource.paginator = this.paginator;
    this.emitRefresh.emit(true);
  }

  setHeading() {
    if (this.event.eventType === EventTypeEnum.Accident && this.isInjury && !this.isDocumentTab) {
      this.heading = 'Injury Details';
    }
    if (!this.isInjury && !this.isDocumentTab) {
      this.heading = 'Employee Details';
    }
    if (this.isDocumentTab) {
      this.heading = 'Employee Documents';
    }
  }

  view(personEvent: PersonEventModel) {
    this.isReadOnly = true;
    this.populateSelectedPersonEvent(personEvent);
    this.mode = ModeEnum.View;
  }

  addInjury(personEvent: PersonEventModel) {
    this.populateSelectedPersonEvent(personEvent);
    this.mode = ModeEnum.NewPerson;
    this.emitRefresh.emit(true);
  }

  edit(personEvent: PersonEventModel) {
    this.isReadOnly = false;
    this.populateSelectedPersonEvent(personEvent);
    this.mode = ModeEnum.Edit;
  }

  populateSelectedPersonEvent(personEvent: PersonEventModel) {
    this.selectedPersonEvent = personEvent;
    this.selectedPersonEvent.claimantId = this.event.memberSiteId;
    this.selectedPersonEvent.eventDate = this.event.eventDate;
    this.selectedPersonEvent.eventType = this.event.eventType;

    const shallowEvent = { ...this.event, personEvents: [] } as EventModel;
    this.selectedPersonEvent.event = shallowEvent;
  }

  removeEmployee($event: any) {
    if (this.event.eventType === EventTypeEnum.Disease) {
      let index = this.event.personEvents.indexOf($event);
      this.event.personEvents[index].rolePlayer.person = null;
    } else if (this.event.eventType === EventTypeEnum.Accident) {
      let index = this.event.personEvents.indexOf($event);
      this.event.personEvents.splice(index, 1);
    }
    this.selectedPersonEvent = null;
    this.populateEmployeeTable();
  }

  addEmployee() {
    this.mode = ModeEnum.NewPerson;

    this.selectedPersonEvent = new PersonEventModel();

    this.selectedPersonEvent.eventId = this.event.eventId;
    this.selectedPersonEvent.companyRolePlayerId = this.event.memberSiteId;
    this.selectedPersonEvent.eventType = this.event.eventType;
    this.selectedPersonEvent.eventDate = this.event.eventDate;
    this.selectedPersonEvent.personEventStatus = PersonEventStatusEnum.New;

    this.setDamageBasedOnEventType();
  }

  setDamageBasedOnEventType() {
    if (this.event.eventType === EventTypeEnum.Disease) {
      this.selectedPersonEvent.physicalDamages = this.event.personEvents[0].physicalDamages;
    } else if (this.event.eventType === EventTypeEnum.Accident) {
      this.selectedPersonEvent.physicalDamages = [];
    }
  }

  close() {
    const index = this.event.personEvents.findIndex(s => s == this.selectedPersonEvent);
    if (index > -1) {
      this.event.personEvents[index] = this.selectedPersonEvent;
    } else {
      if (this.selectedPersonEvent.rolePlayer) {
        this.event.personEvents.push(this.selectedPersonEvent);
      }
    }

    this.selectedPersonEvent = null;
    this.emitRefresh.emit(true);
  }

  emitPersonEvent($event: PersonEventModel, closeDetails: boolean) {
    if (!closeDetails) {
      this.selectedPersonEvent = null;
      this.emitRefresh.emit(true);
    } else {
      $event.companyRolePlayerId = this.event.memberSiteId;
      $event.claimantId = this.event.memberSiteId;
      $event.eventType = this.event.eventType;
      $event.eventDate = this.event.eventDate;

      this.readFormDisease($event);
      this.readFormInjury($event);
      this.populateEmployeeTable();
    }
  }

  readFormDisease($event: PersonEventModel) {
    if ($event.eventType === EventTypeEnum.Disease) {
      this.event.personEvents[0].personEventId = $event.personEventId;
      this.event.personEvents[0].personEventReferenceNumber = $event.personEventReferenceNumber;
      this.event.personEvents[0].insuredLifeId = $event.insuredLifeId;
      this.event.personEvents[0].rolePlayer = $event.rolePlayer;
      this.event.personEvents[0].rolePlayer.cellNumber = $event.rolePlayer.cellNumber;
      this.event.personEvents[0].rolePlayer.tellNumber = $event.rolePlayer.tellNumber;
      this.event.personEvents[0].rolePlayer.emailAddress = $event.rolePlayer.emailAddress;
      this.event.personEvents[0].rolePlayer.preferredCommunicationTypeId = $event.rolePlayer.preferredCommunicationTypeId;
      this.event.personEvents[0].rolePlayer.rolePlayerTypeId = +RolePlayerTypeEnum.InsuredLife;
      this.event.personEvents[0].companyRolePlayerId = this.event.memberSiteId;

      this.selectedPersonEvent = this.event.personEvents[0];
    }
  }

  readFormInjury($event: PersonEventModel) {
    if ($event.eventType === EventTypeEnum.Accident) {
      this.populatePersonEvents($event);
      this.addMedicalDocumentIfInjury($event);
    }

    this.emitRefresh.emit(true);
  }

  addMedicalDocumentIfInjury($event: PersonEventModel) {
    if (
      $event.physicalDamages &&
      $event.physicalDamages[0]?.injuries[0]?.injuryId > 0
    ) {
      this.documentSets.push(DocumentSetEnum.ClaimMedicalDocuments);
    }
  }

  populatePersonEvents($event: PersonEventModel) {
    let index = this.event.personEvents.findIndex(
      (a) => a.rolePlayer.person.idNumber === $event.rolePlayer.person.idNumber
    );
    if (index > -1) {
      this.event.personEvents[index] = $event;
    } else {
      this.event.personEvents.push($event);
    }
    this.emitRefresh.emit(true);
  }

  filterMenu(item: PersonEventModel) {
    if (item.claims && item.claims.length > 0 && this.event.eventId <= 0) {
      this.editEmployee = false;
    } else {
      this.editEmployee = true;
    }

    this.menus = null;
    if (this.isInjury) {
      this.setInjuryActions(item);
    } else {
      this.setEmployeeActions(item);
    }
    if (this.isDocumentTab) {
      this.setDocumentActions(item);
    }
  }

  checkInjuryDetailsExist(personEvent: PersonEventModel): boolean {
    return personEvent?.physicalDamages.length > 0 ? true : false;
  }

  onMenuItemClick(item: PersonEventModel, menu: any): void {
    if (menu.title.toLowerCase().includes('injury')) {
      this.onInjurySelect(menu, item);
    } else {
      this.onEmployeeSelect(menu, item);
    }
    if (menu.title.toLowerCase().includes('medical')) {
      this.onDocumentSelect(menu, item);
    }
  }

  setInjuryActions(item: PersonEventModel) {
    const editInjury = this.checkInjuryDetailsExist(item);
    this.menus = [];
    this.menus.push({
      title: 'Add Injury Details',
      action: 'add',
      disable: editInjury ? true : false,
    });

    if (item.rolePlayer && ((!item.rolePlayer.rolePlayerId || item.rolePlayer.rolePlayerId <= 0) || userUtility.hasPermission('Edit Injury Details'))) {
      this.menus.push({
        title: 'Edit Injury Details',
        action: 'edit',
        disable: !editInjury ? true : false,
      });
    }

    this.menus.push({
      title: 'View Injury Details',
      action: 'view',
      disable: editInjury ? false : true,
    });
  }

  setEmployeeActions(item: PersonEventModel) {
    if (!this.editEmployee) {
      this.menus = [
        {
          title: 'Edit Employee Details',
          action: 'edit',
          disable: !this.editEmployee ? true : false,
        },
        {
          title: 'Remove Employee Details',
          action: 'remove',
          disable: !this.editEmployee ? true : false,
        },
        { title: 'View Employee Details', action: 'view', disable: false },
      ];
    } else {
      this.menus = [
        {
          title: 'Edit Employee Details',
          action: 'edit',
          disable: false
        },
        {
          title: 'Remove Employee Details',
          action: 'remove',
          disable: false
        },
        {
          title: 'View Employee Details',
          action: 'view',
          disable: false
        },
      ];
    }
  }

  setDocumentActions(item: PersonEventModel) {
    this.menus = [
      {
        title: 'View / Upload Medical Reports',
        action: 'view',
        disable: false,
      },
    ];
  }

  onInjurySelect(menu: any, item: PersonEventModel) {
    switch (menu.action) {
      case 'add':
        this.addInjury(item);
        break;
      case 'edit':
        this.edit(item);
        break;
      case 'view':
        this.view(item);
        break;
    }
  }

  onEmployeeSelect(menu: any, item: PersonEventModel) {
    switch (menu.action) {
      case 'edit':
        this.edit(item);
        break;
      case 'remove':
        this.openRemoveEmployeeConfirmationDialog(item);
        break;
      case 'view':
        this.view(item);
        break;
    }
  }

  openRemoveEmployeeConfirmationDialog(item: PersonEventModel) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Remove Employee: ${item.rolePlayer.displayName}?`,
        text: 'Are you sure you want to proceed?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeEmployee(item);
      }
    });
  }

  onDocumentSelect(menu: any, item: PersonEventModel) {
    switch (menu.action) {
      case 'view':
        this.viewDocuments = true;
        break;
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'name', show: true },
      { def: 'surname', show: true },
      { def: 'idPassportNumber', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  isRequiredDataSupplied($event: PersonEventModel): boolean {
    let isRequiredDataSupplied = true;
    if (this.isDocumentTab) {
      return isRequiredDataSupplied;
    }

    if (!this.isInjury) {
      if ($event.rolePlayer && (!$event.rolePlayer.rolePlayerContacts || $event.rolePlayer.rolePlayerContacts.length <= 0)) {
        isRequiredDataSupplied = false;
      }

      if ($event.rolePlayer && $event.rolePlayer.person && (!$event.rolePlayer.person.personEmployments || $event.rolePlayer.person.personEmployments.length <= 0)) {
        isRequiredDataSupplied = false;
      }
    } else {
      if (!$event.physicalDamages || $event.physicalDamages.length <= 0) {
        isRequiredDataSupplied = false;
      } else {
        $event.physicalDamages.forEach(pd => {
          if (!pd.injuries || pd.injuries.length <= 0) {
            isRequiredDataSupplied = false;
          }
        });
      }
    }

    return isRequiredDataSupplied;
  }
}
