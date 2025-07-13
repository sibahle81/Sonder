import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { PersonEventQuestionnaire } from '../../../entities/personEvent/personEventQuestionnaire.model';
import { EmployeeQuestionnaireComponent } from '../../../../views/employee-questionnaire/employee-questionnaire.component';
import { EventModel } from '../../../entities/personEvent/event.model';
import { MatDialog } from '@angular/material/dialog';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { PopupQuestionnaireDeleteComponent } from '../../../../views/popup-questionnaire-delete/popup-questionnaire-delete.component';
import { MatTable } from '@angular/material/table';
import { AdditionalDocumentRequest } from '../../../entities/additional-document-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';

@Component({
  selector: 'holistic-questionnaire',
  templateUrl: './holistic-questionnaire.component.html',
  styleUrls: ['./holistic-questionnaire.component.css']
})
export class HolisticQuestionnaireComponent implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  @Output() ShowQuizButton: EventEmitter<PersonEventModel> = new EventEmitter();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable) personEventQuestionnaireTable: MatTable<PersonEventQuestionnaire>;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading questionnaires...please wait');

  menus: { title: string, action: string, disable: boolean }[];
  displayedColumnsQuestionnaire = ['employeeNumber', 'averageEarnings', 'annualBonus', 'actions'];

  questionnaireDataSource: PersonEventQuestionnaire[] = [];
  personEventQuestionnaire: PersonEventQuestionnaire;

  event: EventModel;

  hasData = false;
  hasPermission = false;
  employeeIsTrainee = false;
  isViewQuestionnaire = false;
  showQuestionnaireButton = false;

  constructor(
    public dialog: MatDialog,
    private readonly eventService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly rolePlayerService: RolePlayerService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkQuestionNaire();
    if (!this.isWizard) {
      this.getEvent();
    }
    else{
      this.isLoading$.next(false);
    }
    if(this.personEvent.claimantId){
      this.getPersonEmploymentDetails(this.personEvent.insuredLifeId, this.personEvent.claimantId);
    }
  }

  getPersonEmploymentDetails(employeeRolePlayerId: number, employerRolePlayerId: number) {
    this.rolePlayerService.getPersonEmployment(employeeRolePlayerId, employerRolePlayerId).subscribe(result => {
      if (result.employeeRolePlayerId > 0) {
        this.personEvent.rolePlayer.person.personEmployments = [];
        this.personEvent.rolePlayer.person.personEmployments.push(result);
      }
      this.isLoading$.next(false);
    });
  }

  getEvent() {
    this.eventService.getEventDetails(this.personEvent.eventId).subscribe(result => {
      this.event = result;
      this.personEvent.event = result;
      this.isLoading$.next(false);
    })
  }

  openQuestionnaireDialog(): void {
    const dateOfBirth = new Date(this.personEvent.rolePlayer.person.dateOfBirth);
    const dialogRef = this.dialog.open(EmployeeQuestionnaireComponent, {
      width: '1024px',
      disableClose: true,
      data: {
        personEvent: this.personEvent,
        employeeName: this.personEvent.rolePlayer.person.firstName + '' + this.personEvent.rolePlayer.person.surname,
        idNumber: this.personEvent.rolePlayer.person.idNumber,
        dateOfBirth: this.personEvent.rolePlayer.person.dateOfBirth,
        employeeAge: this.personEvent.rolePlayer.person.firstName === null ? 0 : this.getAge(dateOfBirth),
        presentOccupation: null,
        pattersonBand: 0,
        isTrainee: this.personEvent.personEventQuestionnaire.isTrainee,
        isSkilled: this.personEvent.rolePlayer.person.personEmployments[0].isSkilled,
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.isViewQuestionnaire = true;
        this.questionnaireDataSource.push(this.personEvent.personEventQuestionnaire);
        this.updateQuestionnaireTable();
        this.showQuestionnaireButton = false;
      }
    });
  }

  openDialogDeleteDocuments(item: PersonEventQuestionnaire) {
    let message;
    if (!String.isNullOrEmpty(item.employeeNumber)) {
      message = 'Are you sure you want to delete questionnaire for employee number ' + item.employeeNumber + '?';
    } else {
      message = 'Are you sure you want to delete questionnaire';
    }

    const dialogRef = this.dialog.open(PopupQuestionnaireDeleteComponent, {
      width: '1024px',
      data: { data: message }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.questionnaireDataSource.splice(0, 1);
        this.updateQuestionnaireTable();
        this.personEvent.personEventQuestionnaire = null;
        this.ShowQuizButton.emit(this.personEvent);
      }
    });
  }

  updateQuestionnaireTable() {
    if (this.personEventQuestionnaireTable) {
      this.personEventQuestionnaireTable.renderRows();
      this.hasData = true;
    }
    if (this.questionnaireDataSource.length === 0) {
      this.hasData = false;
    }
  }

  openQuestionnaireDialogView(item: PersonEventQuestionnaire, menu: any): void {
    const type = menu;
    this.personEvent.event = this.personEvent.event ? this.personEvent.event : this.createEventVariables();
    this.personEvent.personEventQuestionnaire = item ? item : new PersonEventQuestionnaire();
    const dateOfBirth = new Date(this.personEvent.rolePlayer.person.dateOfBirth);
    const dialogRef = this.dialog.open(EmployeeQuestionnaireComponent, {
      width: '80%',
      height: '700px',
      data: {
        personEvent: this.personEvent,
        employeeName: this.personEvent.rolePlayer.person.firstName,
        idNumber: this.personEvent.rolePlayer.person.idNumber,
        dateOfBirth: dateOfBirth,
        employeeAge: this.personEvent.rolePlayer.person.dateOfBirth === null ? 0 : this.getAge(dateOfBirth),
        presentOccupation: null,
        pattersonBand: 0,
        isTrainee: this.personEvent.personEventQuestionnaire.isTrainee,
        isSkilled: this.personEvent.rolePlayer.person.personEmployments && this.personEvent.rolePlayer.person.personEmployments.length > 0 
                    ? this.personEvent.rolePlayer.person.personEmployments[0].isSkilled : null,
        dataType: type,
      }
    });
    if (type === 'edit') {
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          this.personEventQuestionnaire = data.personEventQuestionnaire;
          this.hasData = true;
          if(data.personEventQuestionnaire.personEventId > 0){
            this.eventService.updatePersonEventQuestionnaire(data.personEventQuestionnaire).subscribe(result => {

            })
          }
        }
      });
    }

  }

  createEventVariables(): EventModel {
    let event = new EventModel()
    event.eventDate = this.personEvent.eventDate;
    event.eventType = this.personEvent.eventType;
    event.memberSiteId = this.personEvent.claimantId;

    return event;
  }

  filterQuestionnaireMenu(item: PersonEventQuestionnaire) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: false },
        { title: 'Delete', action: 'delete', disable: false },
        { title: 'Update Section 51', action: 'Update Section 51', disable: false }
      ];
  }

  checkQuestionNaire() {
    if (this.personEvent.personEventQuestionnaire && !String.isNullOrEmpty(this.personEvent.personEventQuestionnaire.employeeNumber)) {
      this.personEventQuestionnaire = this.personEvent.personEventQuestionnaire;
      if (this.questionnaireDataSource.length === 0) {
        this.questionnaireDataSource.push(this.personEventQuestionnaire);
        this.updateQuestionnaireTable();
        this.hasData = true;
        this.isLoading$.next(this.isWizard);
      }
    }
  }

  isLeap(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  getAge(birthDate: Date) {
    const now = new Date();
    let days = Math.floor((now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24);
    let age = 0;
    for (let y = birthDate.getFullYear(); y <= now.getFullYear(); y++) {
      const daysInYear = this.isLeap(y) ? 366 : 365;
      if (days >= daysInYear) {
        days -= daysInYear;
        age++;
      }
    }
    return age;
  }

  onQuestionnaireMenuItemClick(item: PersonEventQuestionnaire, menu: any): void {
    switch (menu.action) {
      case 'view':
      case 'edit':
        this.openQuestionnaireDialogView(item, menu.action);
        break;
      case 'delete':
        if (item) { this.openDialogDeleteDocuments(item); }
        break;
      case 'Update Section 51':
        this.reCaptureSectionNotification();
        break;
    }
  }

  reCaptureSectionNotification() {
    this.isLoading$.next(true);
    this.loadingMessages$.next('sending notifications....please wait');
    const additionalDocumentRequest = new AdditionalDocumentRequest();
    additionalDocumentRequest.rolePlayerContacts = this.personEvent.rolePlayer.rolePlayerContacts;
    additionalDocumentRequest.note = 'please update section 51';
    additionalDocumentRequest.personEventId = this.personEvent.personEventId;
    additionalDocumentRequest.reason = 'Section 51 Needs to be Updated';
    this.eventService.recaptureSectionNotification(additionalDocumentRequest).subscribe(result => {
      if (result) {
        this.alertService.success('notification has been sent successfully');
        this.isLoading$.next(false);
      }
    })
  }
}