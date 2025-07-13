import { MatDialog } from '@angular/material/dialog';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { UntypedFormArray, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { EarningType } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-type-model';
import { CaptureEarningsComponent } from 'projects/claimcare/src/app/claim-manager/views/claim-earnings/capture-earnings/capture-earnings.component';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { EarningDetail } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-detail-model';
import { Earning } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-model';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { EarningsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/earnings-type-enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClaimInvoiceService } from '../../../services/claim-invoice.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';

@Component({
  selector: 'app-list-earnings',
  templateUrl: './list-earnings.component.html',
  styleUrls: ['./list-earnings.component.css'],
  providers: [ClaimEarningService],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListEarningsComponent extends PermissionHelper implements OnChanges, OnDestroy {
  addPermission = 'Add Earnings';
  editPermission = 'Edit Earnings';

  moduleName = 'claimcare';
  managerName = 'claim-manager';

  @Input() personEvent: PersonEventModel;
  @Input() earningType: EarningsTypeEnum;
  @Input() isWizard = false;

  @Output() earningsEmit = new EventEmitter<Earning[]>();
  @Output() refreshEmit = new EventEmitter<boolean>();
  @Output() requiredDocumentsUploaded = new EventEmitter<boolean>();

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource: MatTableDataSource<Earning>;

  activeWizards: Wizard[];

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading earnings...please wait');

  public rowArray: UntypedFormArray = this.formBuilder.array([]);
  public formGroup: UntypedFormGroup = this.formBuilder.group({ earnings: this.rowArray });
  public formErrors: any;
  public menus: any[];
  public eventDate: Date;

  protected formError: { [id: string]: string };
  protected totalColumnDisplay: boolean = false;
  protected pageSizeOptions;
  protected variableEarningTypes: EarningType[] = [];
  protected nonVariableEarningTypes: EarningType[] = [];
  protected unsubscribe: Subscription[] = [];

  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  spinnerWithoutBackdrop = false;
  users: User[];

  activeWizardsChecked$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isEarningsWorkflowInProgress = false;
  triggerRefresh: boolean;

  allRequiredDocumentsUploaded = false;
  documentSet = DocumentSetEnum.EmployeeEarningsDocuments;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  forceRequiredDocumentTypeFilter = [DocumentTypeEnum.StatementOfEarnings];

  section51Reason: string;
  isAgeUnder26: boolean;
  isTrainee: boolean;

  event: EventModel;

  currentUser: User;

  constructor(
    protected dialog: MatDialog,
    protected formBuilder: UntypedFormBuilder,
    protected claimEarningService: ClaimEarningService,
    protected claimService: ClaimCareService,
    protected claimInvoiceService: ClaimInvoiceService,
    protected readonly confirmService: ConfirmationDialogsService,
    protected readonly alertService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userReminderService: UserReminderService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser()

    let sub = this.claimEarningService.getAllClaimEarningTypes().subscribe(res => {
      this.variableEarningTypes = res.filter(x => x.isVariable == true);
      this.nonVariableEarningTypes = res.filter(x => x.isVariable == false);
    })
    this.unsubscribe.push(sub);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEvent && this.personEvent.personEventId && this.personEvent.personEventId > 0) {
      this.getPersonEventEarnings();
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  getPersonEventEarnings() {
    this.isLoading$.next(true);
    this.claimService.getEventDetails(this.personEvent.eventId).subscribe(result => {
      this.event = result;

      this.getEventDate(result);
      this.loadData(true);
    });
  }

  filterMenu(item: Earning) {
    this.menus = [];

    if (this.isWizard) {
      this.menus = [
        { title: 'Edit', url: '', disable: item.isEstimated || !this.userHasPermission(this.editPermission) || item.earningsType != this.earningType },
        { title: 'Delete', url: '', disable: item.earningId > 0 },
      ];
    }
  }

  onMenuSelect($event: Earning, menu: any) {
    switch (menu.title) {
      case 'Edit':
        this.editEarning($event);
        break;
      case 'Delete':
        this.deleteEarning($event);
        break;
    }
  }

  startCaptureEarningsWizard() {
    this.isLoading$.next(true);
    this.loadingMessages$.next('Starting earnings workflow...please wait');

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.personEvent.personEventId;
    startWizardRequest.type = 'capture-earnings';
    startWizardRequest.data = JSON.stringify(this.personEvent);

    this.wizardService.startWizard(startWizardRequest).subscribe(_ => {
      this.triggerRefresh = !this.triggerRefresh;
      this.refreshEmit.emit(this.triggerRefresh);
      this.alertService.successToastr('Earnings workflow started...');
      this.isLoading$.next(false);
    });
  }

  startEditEarningsWizard($event: Earning) {
    this.isLoading$.next(true);
    this.loadingMessages$.next('Starting earnings workflow...please wait');

    // Make a deep copy of personEvent before modifying it
    const personEventCopy = structuredClone(this.personEvent) || JSON.parse(JSON.stringify(this.personEvent));

    // Modify only the copy, not the original
    personEventCopy.earnings = [$event]; // Replace earnings with only the one to be edited

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = personEventCopy.personEventId;
    startWizardRequest.type = 'capture-earnings';
    startWizardRequest.data = JSON.stringify(personEventCopy);

    this.wizardService.startWizard(startWizardRequest).subscribe(_ => {
      this.triggerRefresh = !this.triggerRefresh;
      this.refreshEmit.emit(this.triggerRefresh);
      this.alertService.successToastr('Earnings workflow started...');
      this.isLoading$.next(false);
    });
  }

  done(statusMessage: string) {
    this.alertService.successToastr(statusMessage, 'Success', true);
  }

  loadData(stopLoader: boolean) {
    this.loadingMessages$.next('loading earnings...please wait');

    if (!this.isWizard) {
      this.claimEarningService.getEarningsByPersonEventId(this.personEvent.personEventId).subscribe(results => {
        this.personEvent.earnings = results;
        this.earningsEmit.emit(this.personEvent.earnings);

        this.setIsSection51();
        this.setEarningTypeforCapture();
        this.setRequiredDocuments();

        this.dataSource = new MatTableDataSource<Earning>(results);
        this.dataSource.paginator = this.paginator;

        this.isLoading$.next(!stopLoader);
      });
    } else {
      this.earningsEmit.emit(this.personEvent.earnings);
      this.setIsSection51();
      this.setEarningTypeforCapture();
      this.setRequiredDocuments();

      this.dataSource = new MatTableDataSource<Earning>(this.personEvent.earnings);
      this.dataSource.paginator = this.paginator;

      this.isLoading$.next(!stopLoader);
    }

  }

  addEarning(): void {
    if (this.isWizard) {
      const dialogRef = this.dialog.open(CaptureEarningsComponent, {
        width: '70%',
        maxHeight: '800px',
        disableClose: true,
        data: {
          personEvent: this.personEvent,
          earningId: 0,
          eventDate: this.eventDate,
          section51Reason: this.earningType != EarningsTypeEnum.Current ? this.section51Reason : null,
          isTrainee: this.isTrainee && this.earningType != EarningsTypeEnum.Current,
          isAgeUnder26: this.isAgeUnder26 && this.earningType != EarningsTypeEnum.Current,
          earningType: this.earningType
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.isLoading$.next(true);
        this.loadData(true);
      });
    } else {
      this.startCaptureEarningsWizard();
    }
  }

  deleteEarning(earning: Earning): void {
    this.confirmService.confirmWithoutContainer(' Delete', ' Are you sure you want to delete ?', 'Center', 'Center', 'Yes', 'No').subscribe(
      result => {
        if (result === true) {
          this.isLoading$.next(true);
          this.loadingMessages$.next('deleting earnings....please wait');

          const index = this.personEvent.earnings.findIndex(s => s == earning);
          if (index > -1) {
            this.personEvent.earnings.splice(index, 1);
          }

          this.dataSource = new MatTableDataSource<Earning>(this.personEvent.earnings);
          this.dataSource.paginator = this.paginator;

          this.loadData(true);
        }
      });
  }

  editEarning(earning: Earning): void {
    const dialogRef = this.dialog.open(CaptureEarningsComponent, {
      width: '70%',
      maxHeight: '800px',
      disableClose: true,
      data: {
        earningId: earning.earningId ? earning.earningId : 0,
        personEvent: this.personEvent,
        earningItem: this.personEvent.earnings.find(s => s == earning),
        eventDate: this.eventDate,
        section51Reason: earning.earningsType != EarningsTypeEnum.Current ? this.section51Reason : null,
        isTrainee: this.isTrainee && earning.earningsType != EarningsTypeEnum.Current,
        isAgeUnder26: this.isAgeUnder26 && earning.earningsType != EarningsTypeEnum.Current,
        earningType: earning.earningsType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isLoading$.next(true);
      this.loadingMessages$.next('updating earnings...please wait');
      this.loadData(true);
    });
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'variableSubTotal', show: true },
      { def: 'nonVariableSubTotal', show: true },
      { def: 'total', show: true },
      { def: 'createdBy', show: true },
      { def: 'createdDate', show: true },
      { def: 'modifiedBy', show: true },
      { def: 'modifiedDate', show: true },
      { def: 'isVerified', show: true },
      { def: 'isEstimated', show: true },
      { def: 'earningType', show: true },
      { def: 'actions', show: this.isWizard }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterNonVariableEarnings(earningDetails: EarningDetail[]) {
    return earningDetails.filter((item: EarningDetail) => this.nonVariableEarningTypes.map(({ earningTypeId }) => earningTypeId).includes(item.earningTypeId));
  }

  filterVariableEarnings(earningDetails: EarningDetail[]) {
    return earningDetails.filter((item: EarningDetail) => this.variableEarningTypes.map(({ earningTypeId }) => earningTypeId).includes(item.earningTypeId));
  }

  getNonVariableEarningDescription(item: any): string {
    let earningTypeId: number = item?.earningTypeId;
    let earningTypeName: string = item.otherDescription === null || undefined ? this.nonVariableEarningTypes.find(y => y.earningTypeId === earningTypeId)?.name : item.otherDescription;
    return earningTypeName;
  }

  getVariableEarningDescription(item: any): string {
    let otherDescription = item?.value[0].otherDescription; // The list should contain the same name hence we default to the first.
    let earningTypeName: string = otherDescription === null || undefined ? this.variableEarningTypes.find(y => y.earningTypeId === Number(item?.key))?.name : otherDescription;
    return earningTypeName;
  }

  getEventDate(event: EventModel) {
    if (event.eventType === EventTypeEnum.Disease && event.personEvents[0].personEventDiseaseDetail)
      this.eventDate = new Date(event.personEvents[0].personEventDiseaseDetail.dateDiagnosis);
    else if (event.eventType === EventTypeEnum.Accident)
      this.eventDate = new Date(event.eventDate);
    else
      this.eventDate = new Date();
  }

  getEarningType(earningsType: EarningsTypeEnum): string {
    return this.formatText(earningsType ? EarningsTypeEnum[earningsType] : 'N/A');
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  applyStrikeThrough($event: Earning): boolean {
    return $event.isEstimated && this.dataSource?.data?.some(s => !s.isEstimated);
  }

  setActiveWizards($event: Wizard[]) {
    this.activeWizards = $event;

    if ($event && $event?.length > 0) {
      const earningsWorkflowInProgress = $event.find(s => s.wizardConfiguration.name == 'capture-earnings' || s.wizardConfiguration.name == 'capture-earnings-override' || s.wizardConfiguration.name == 'capture-earnings-section-51');
      if (earningsWorkflowInProgress) {
        this.isEarningsWorkflowInProgress = true;
      }
    }

    this.activeWizardsChecked$.next(true);
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
    this.requiredDocumentsUploaded.emit(this.allRequiredDocumentsUploaded);
  }

  setIsSection51() {
    if (this.event.eventType != EventTypeEnum.Accident) {
      return;
    }

    if (this.earningType && this.earningType != EarningsTypeEnum.FutureProbable) {
      return;
    }

    this.isAgeUnder26 = this.getAge(this.personEvent?.rolePlayer?.person.dateOfBirth, this.eventDate) < 26;
    this.isTrainee = this.personEvent?.rolePlayer.person.personEmployments[0].isTraineeLearnerApprentice;

    if (this.isAgeUnder26 && this.isTrainee) {
      this.section51Reason = 'Average of 6 months earnings of a person, aged 26 years OR recently qualified in the same occupation OR with five years or more experience in the same occupation, trade or profession as the injured employee';
    } else if (this.isAgeUnder26) {
      this.section51Reason = 'Average of 6 months earnings of a person, aged 26 years OR with five years or more experience in the same occupation, trade or profession as the injured employee';
    } else if (this.isTrainee) {
      this.section51Reason = 'Average of 6 months earnings of a person, recently qualified OR with five years or more experience in the same occupation, trade or profession as the injured employee';
    }
  }

  setEarningTypeforCapture() {
    if (this.earningType) { return; }

    const today = new Date().getCorrectUCTDate();
    const claimAge = this.getAge(this.eventDate, today);

    if (this.personEvent.earnings?.length == 1 && this.personEvent.earnings[0].isVerified) {
      this.earningType = this.personEvent.earnings[0].earningsType;
    } else {
      if (claimAge >= 2 && this.personEvent.earnings?.some(s => (s.earningsType == EarningsTypeEnum.Accident && !s.isEstimated))) {
        this.earningType = EarningsTypeEnum.Current;
      } else if ((this.isAgeUnder26 || this.isTrainee)) {
        this.earningType = EarningsTypeEnum.FutureProbable;
      } else if (!this.isAgeUnder26 && !this.isTrainee) {
        this.earningType = EarningsTypeEnum.Accident;
      }
    }
  }

  getAge(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
  }

  canAdd(): boolean {
    if (!this.earningType) { return false; }

    if (this.isWizard) {
      if (this.personEvent.earnings?.some(s => s.earningsType == this.earningType && !s.isEstimated)) {
        return false;
      }
    } else {
      if (this.earningType == EarningsTypeEnum.Current &&
        this.personEvent.earnings?.some(s => s.earningsType == EarningsTypeEnum.Current)) {
        return false;
      } else if (this.earningType == EarningsTypeEnum.Accident &&
        this.personEvent.earnings?.some(s => s.earningsType == EarningsTypeEnum.Accident && s.isVerified)
      ) {
        return false;
      } else if (this.earningType == EarningsTypeEnum.FutureProbable &&
        this.personEvent.earnings?.some(s => s.earningsType == EarningsTypeEnum.FutureProbable && s.isVerified)
      ) {
        return false;
      }
    }

    return true;
  }

  setRequiredDocuments() {
    this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.StatementOfEarnings];

    if (this.earningType == EarningsTypeEnum.Current) {
      this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.StatementOfEarnings, DocumentTypeEnum.CurrentEarnings];
    }

    if (this.earningType == EarningsTypeEnum.FutureProbable) {
      const earning = this.personEvent.earnings?.find(s => s.earningsType == this.earningType);
      if (earning?.sec51EmpNo) {
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.StatementOfEarnings, DocumentTypeEnum.Section51];
      } else {
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.StatementOfEarnings, DocumentTypeEnum.RMAFormulaSheet, DocumentTypeEnum.Section51ConfirmationLetter];
      }
    }
  }

  documentUploaded($event: GenericDocument) {
    if (this.isWizard) { return; }

    if (this.activeWizards?.length > 0) {
      const wizards = this.activeWizards.filter(s => s.wizardConfiguration.name == 'capture-earnings' || s.wizardConfiguration.name == 'capture-earnings-section-51');
      wizards?.forEach(wizard => {
        if (wizard.lockedToUser) {
          this.userService.getUserByUsername(wizard?.lockedToUser).subscribe(user => {
            if (user?.email != wizard.lockedToUser) {
              const userReminder = new UserReminder();
              userReminder.alertDateTime = new Date().getCorrectUCTDate();
              userReminder.assignedByUserId = this.currentUser?.id;
              userReminder.assignedToUserId = user?.id;
              userReminder.linkUrl = `/claimcare/claim-manager/${wizard.wizardConfiguration.name}/continue/${wizard.id}`;
              userReminder.text = `New earnings documents, ${this.getDocumentType($event?.documentType)}, was uploaded`;
              userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
              userReminder.userReminderItemType = UserReminderItemTypeEnum.WorkflowTask;

              this.userReminderService.createUserReminder(userReminder).subscribe(_ => { });
            }
          });
        } else {
          let userReminders: UserReminder[] = [];

          this.userService.getUsersByRoleName('Earnings Assessor').subscribe(results => {
            if (results?.length > 0) {
              results?.forEach(user => {
                const userReminder = new UserReminder();
                userReminder.alertDateTime = new Date().getCorrectUCTDate();
                userReminder.assignedByUserId = this.currentUser?.id;
                userReminder.assignedToUserId = user?.id;
                userReminder.linkUrl = `/claimcare/claim-manager/${wizard.wizardConfiguration.name}/continue/${wizard.id}`;
                userReminder.text = `New earnings documents, ${this.getDocumentType($event?.documentType)}, was uploaded`;
                userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
                userReminder.userReminderItemType = UserReminderItemTypeEnum.WorkflowTask;

                userReminders.push(userReminder);
              });

              this.userReminderService.createUserReminders(userReminders).subscribe(_ => { });
            }
          });
        }
      });
    }
  }

  getDocumentType(documentType: DocumentTypeEnum): string {
    return this.formatText(documentType ? DocumentTypeEnum[documentType] : 'N/A');
  }
}
