import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { ClaimRequirementService } from '../../../Services/claim-requirement.service';
import { PersonEventClaimRequirement } from '../../entities/person-event-claim-requirement';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ClaimRequirementCategorySearchDialogComponent } from './claim-requirement-category-search-dialog/claim-requirement-category-search-dialog.component';
import { MemberContactDialogComponent } from 'projects/shared-components-lib/src/lib/member-contacts/member-contact-dialog/member-contact-dialog.component';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';
import { AdhocClaimRequirementCommunicationRequest } from '../../entities/adhoc-claim-requirement-communication-request';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { CommunicationTypeManagerDialogComponent } from 'projects/shared-components-lib/src/lib/member-contacts/communication-type-manager-dialog/communication-type-manager-dialog.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MedicalUploadDialogComponent } from '../medical-upload-icon/medical-upload-dialog/medical-upload-dialog.component';
import { MedicalReportTypeEnum } from '../medical-upload-icon/medical-report-type.enum';

@Component({
  selector: 'claim-requirements-v2',
  templateUrl: './claim-requirements-v2.component.html',
  styleUrls: ['./claim-requirements-v2.component.css']
})
export class ClaimRequirementsV2Component implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() triggerRefresh = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading requirements...please wait');

  selectedPersonEventClaimRequirement: PersonEventClaimRequirement;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  documentUploadStatus = DocumentStatusEnum.Accepted;
  documentFilter: DocumentTypeEnum[];
  
  rolePlayer: RolePlayer;

  _new = PersonEventStatusEnum.New;

  selectedRequirements: PersonEventClaimRequirement[];

  menus: { title: string, action: string, disable: boolean }[];

  currentUser: User;

  medicalReportType = MedicalReportTypeEnum.FirstMedicalReport;

  constructor(
    private readonly claimRequirementService: ClaimRequirementService,
    public readonly dialog: MatDialog,
    private readonly alertService: ToastrManager,
    private readonly rolePlayerService: RolePlayerService,
    private readonly authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.setMenuOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEvent) {
      if (this.personEvent.personEventStatus == PersonEventStatusEnum.New) {
        this.getConfiguredRequirements();
      } else {
        this.getPersonEventRequirements();
      }
    }
  }

  setMenuOptions() {
    this.menus = null;
    this.menus =
      [
        { title: 'Employer Contacts', action: 'employerContacts', disable: false },
        { title: 'Employee Contacts', action: 'employeeContacts', disable: false },
      ];
  }

  onMenuItemClick(menu: any): void {
    switch (menu.action) {
      case 'employerContacts':
        this.openContactsDialog(this.personEvent.companyRolePlayerId);
        break;
      case 'employeeContacts':
        this.openContactsDialog(this.personEvent.insuredLifeId);
        break;
    }
  }

  getConfiguredRequirements() {
    this.isLoading$.next(true);
    this.claimRequirementService.getConfiguredRequirements(this.personEvent).subscribe(results => {
      if (results?.length > 0) {
        if (this.personEvent.personEventClaimRequirements?.length > 0) {
          // Step 1: Filter and merge collections without duplicates
          const uniqueRequirementsMap = new Map();

          // Add items from the original collection that meet criteria
          this.personEvent.personEventClaimRequirements.forEach(itemA => {
            if (
              results.some(itemB => itemB.claimRequirementCategoryId === itemA.claimRequirementCategoryId) ||
              itemA.dateClosed !== null
            ) {
              uniqueRequirementsMap.set(itemA.claimRequirementCategoryId, itemA);
            }
          });

          // Add items from the new collection that are not in the map
          results.forEach(itemB => {
            const key = itemB.claimRequirementCategoryId;
            if (!uniqueRequirementsMap.has(key)) {
              uniqueRequirementsMap.set(key, itemB);
            }
          });

          // Update personEventClaimRequirements with deduplicated items
          this.personEvent.personEventClaimRequirements = Array.from(uniqueRequirementsMap.values());
        } else {
          // Direct assignment when personEventClaimRequirements is initially empty
          this.personEvent.personEventClaimRequirements = results;
        }
      }

      if (this.personEvent.personEventStatus != PersonEventStatusEnum.New) {
        this.personEvent.personEventClaimRequirements.forEach(item => {
          item.personEventId = this.personEvent.personEventId;
        });

        this.claimRequirementService.addPersonEventClaimRequirements(this.personEvent.personEventClaimRequirements).subscribe(result => {
          this.getPersonEventRequirements();
        });
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  getPersonEventRequirements() {
    this.isLoading$.next(true);
    this.claimRequirementService.GetPersonEventRequirements(this.personEvent.personEventId).subscribe(results => {
      if (results?.length > 0) {
        this.personEvent.personEventClaimRequirements = results;
      }

      this.isLoading$.next(false);
    });
  }

  uploadRequiredDocument($event: PersonEventClaimRequirement) {
    this.selectedPersonEventClaimRequirement = $event;
    this.documentFilter = [$event.claimRequirementCategory.documentType];

    this.shouldOpenMedicalUploadDialog();
  }

  deleteRequirement($event: PersonEventClaimRequirement) {
    this.selectedPersonEventClaimRequirement = $event;
    this.selectedPersonEventClaimRequirement.isDeleted = !$event.isDeleted;

    const index = this.personEvent.personEventClaimRequirements.findIndex(s => s == this.selectedPersonEventClaimRequirement);
    if (index > -1) {
      this.personEvent.personEventClaimRequirements[index] = this.selectedPersonEventClaimRequirement;
    }

    if (this.personEvent.personEventStatus != PersonEventStatusEnum.New) {
      this.claimRequirementService.updatePersonEventClaimRequirement(this.selectedPersonEventClaimRequirement).subscribe(_ => { });
    }

    this.reset();
  }

  openConfirmationDialog($event: PersonEventClaimRequirement) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: $event.dateClosed ? `Open Requirement` : `Close Requirement`,
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleRequirement($event);
      }
    });
  }

  openAdditionalRequirements() {
    const dialogRef = this.dialog.open(ClaimRequirementCategorySearchDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: 'Additional Requirements',
        eventType: this.personEvent?.event?.eventType,
        allowInstructionOverride: true
      }
    });

    dialogRef.afterClosed().subscribe(results => {
      if (results) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('saving additional requirements...please wait');

        const additionalPersonEventClaimRequirements: PersonEventClaimRequirement[] = [];

        results.forEach(claimRequirementCategory => {
          const personEventClaimRequirement = new PersonEventClaimRequirement();

          personEventClaimRequirement.claimRequirementCategoryId = claimRequirementCategory.claimRequirementCategoryId;
          personEventClaimRequirement.dateOpened = new Date().getCorrectUCTDate();
          personEventClaimRequirement.instruction = claimRequirementCategory.description;
          personEventClaimRequirement.personEventId = this.personEvent.personEventId;
          personEventClaimRequirement.isMinimumRequirement = false;
          personEventClaimRequirement.isMemberVisible = claimRequirementCategory.isMemberVisible;

          if (!this.personEvent.personEventClaimRequirements.some(s => s.claimRequirementCategoryId == personEventClaimRequirement.claimRequirementCategoryId)) {
            additionalPersonEventClaimRequirements.push(personEventClaimRequirement);
          }
        });

        if (additionalPersonEventClaimRequirements?.length > 0) {
          this.claimRequirementService.addPersonEventClaimRequirements(additionalPersonEventClaimRequirements).subscribe(result => {
            this.getPersonEventRequirements();
          });
        } else {
          this.isLoading$.next(false);
        }
      }
    });
  }

  handleRequirement($event: PersonEventClaimRequirement) {
    this.selectedPersonEventClaimRequirement = $event;
    this.selectedPersonEventClaimRequirement.dateClosed = $event.dateClosed ? null : new Date().getCorrectUCTDate();

    const index = this.personEvent.personEventClaimRequirements.findIndex(s => s == this.selectedPersonEventClaimRequirement);
    if (index > -1) {
      this.personEvent.personEventClaimRequirements[index] = this.selectedPersonEventClaimRequirement;
    }

    if (this.personEvent.personEventStatus != PersonEventStatusEnum.New) {
      this.claimRequirementService.updatePersonEventClaimRequirement(this.selectedPersonEventClaimRequirement).subscribe(_ => { });
    }

    this.reset();
  }

  requiredDocumentsUploaded($event: boolean) {
    if (!$event) {
      this.selectedPersonEventClaimRequirement.dateClosed = null;
    } else {
      this.selectedPersonEventClaimRequirement.dateClosed = new Date().getCorrectUCTDate();
    }

    const index = this.personEvent.personEventClaimRequirements.findIndex(s => s == this.selectedPersonEventClaimRequirement);
    if (index > -1) {
      this.personEvent.personEventClaimRequirements[index] = this.selectedPersonEventClaimRequirement;
    }

    if (this.personEvent.personEventStatus != PersonEventStatusEnum.New) {
      this.claimRequirementService.updatePersonEventClaimRequirement(this.selectedPersonEventClaimRequirement).subscribe(_ => { });
    }
  }

  reset() {
    this.selectedPersonEventClaimRequirement = null;
  }

  handleSelectedRequirements() {
    if (this.selectedRequirements?.length > 0) {
      this.selectedRequirements = null;
    } else {
      if (!this.selectedRequirements) { this.selectedRequirements = []; }
      this.personEvent.personEventClaimRequirements.forEach(s => {
        if (!s.dateClosed && !s.isDeleted) {
          this.selectedRequirements.push(s);
        }
      });
    }
  }

  refresh() {
    this.loadingMessage$.next('loading requirements...please wait');
    this.selectedRequirements = null;
    this.selectedPersonEventClaimRequirement = null;

    if (this.personEvent.personEventStatus == PersonEventStatusEnum.New) {
      this.getConfiguredRequirements();
    } else {
      this.getPersonEventRequirements();
    }
  }

  requirementSelected($event: PersonEventClaimRequirement) {
    if (!this.selectedRequirements) { this.selectedRequirements = []; }

    let index = this.selectedRequirements.findIndex(a => a.personEventClaimRequirementId === $event.personEventClaimRequirementId);
    if (index > -1) {
      this.selectedRequirements.splice(index, 1);
    } else {
      this.selectedRequirements.push($event);
    }
  }

  isSelected($event: PersonEventClaimRequirement): boolean {
    return !this.selectedRequirements ? false : this.selectedRequirements.some(s => s.personEventClaimRequirementId == $event.personEventClaimRequirementId)
  }

  openContactsDialog(rolePlayerId: number) {
    this.getRolePlayer(rolePlayerId);

    const dialogRef = this.dialog.open(MemberContactDialogComponent, {
      width: '75%',
      disableClose: true,
      data: {
        rolePlayerId: rolePlayerId,
        filteredInformationTypes: [ContactInformationTypeEnum.Claims]
      }
    });

    dialogRef.afterClosed().subscribe(results => {
      if (results?.length > 0) {
        this.openCommunicationTypeManager(results);
      }
    });
  }

  openCommunicationTypeManager(rolePlayerContacts: RolePlayerContact[]) {
    const dialogRef = this.dialog.open(CommunicationTypeManagerDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        rolePlayerContacts: rolePlayerContacts
      }
    });

    dialogRef.afterClosed().subscribe(results => {
      if (results) {
        this.openCommunicationConfirmationDialog(results);
      }
    });
  }

  openCommunicationConfirmationDialog(recipients: any) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Communication Confirmantion`,
        text: `Are you sure you want send communication(s) to the selected contact(s)?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (recipients?.emailRecipients?.length > 0) {
          this.sendEmailCommunication(recipients.emailRecipients);
        }

        if (recipients?.smsRecipients?.length > 0) {
          this.sendSmsCommunication(recipients.smsRecipients);
        }
      } else {
        this.handleSelectedRequirements();
      }
    });
  }

  getRolePlayer(rolePlayerId: number) {
    this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(result => {
      this.rolePlayer = result;
    });
  }

  sendEmailCommunication(rolePlayerContacts: RolePlayerContact[]) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('sending communication...please wait');

    const adhocClaimRequirementCommunicationRequest = new AdhocClaimRequirementCommunicationRequest();
    adhocClaimRequirementCommunicationRequest.personEventId = this.personEvent.personEventId;
    adhocClaimRequirementCommunicationRequest.requirementsHtml = this.generateRequirementsHtml();
    adhocClaimRequirementCommunicationRequest.rolePlayerContacts = rolePlayerContacts;
    adhocClaimRequirementCommunicationRequest.subject = `Outstanding Claim Requirements Requested Ref: ${this.personEvent.personEventReferenceNumber}`;
    adhocClaimRequirementCommunicationRequest.displayName = this.rolePlayer?.displayName ? this.rolePlayer.displayName : 'Valued Client';

    this.claimRequirementService.sendAdhocClaimRequirementCommunicationEmail(adhocClaimRequirementCommunicationRequest).subscribe(result => {
      this.handleSelectedRequirements();
      this.alertService.successToastr('Email communication sent successfully...');
      this.isLoading$.next(false);
    });
  }

  sendSmsCommunication(rolePlayerContacts: RolePlayerContact[]) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('sending communication...please wait');

    const adhocClaimRequirementCommunicationRequest = new AdhocClaimRequirementCommunicationRequest();
    adhocClaimRequirementCommunicationRequest.personEventId = this.personEvent.personEventId;
    adhocClaimRequirementCommunicationRequest.requirementsCsv = this.generateRequirementsCsv();
    adhocClaimRequirementCommunicationRequest.rolePlayerContacts = rolePlayerContacts;
    adhocClaimRequirementCommunicationRequest.subject = `Outstanding Claim Requirements Requested Ref: ${this.personEvent.personEventReferenceNumber}`;
    adhocClaimRequirementCommunicationRequest.displayName = this.rolePlayer?.displayName ? this.rolePlayer.displayName : 'Valued Client';

    this.claimRequirementService.sendAdhocClaimRequirementCommunicationSms(adhocClaimRequirementCommunicationRequest).subscribe(result => {
      this.handleSelectedRequirements();
      this.alertService.successToastr('Sms communication sent successfully...');
      this.isLoading$.next(false);
    });
  }

  generateRequirementsHtml(): string {
    let requirementHtml = '<ul>';
    this.selectedRequirements.forEach(s => {
      requirementHtml += `<li>${s.instruction.trim()}</li>`
    });
    requirementHtml += '</ul>';

    return requirementHtml;
  }

  generateRequirementsCsv(): string {
    return this.selectedRequirements
      .map(s => s.instruction.trim())
      .join(',');
  }

  regenerate() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('regenerating requirements...please wait');
    this.getConfiguredRequirements();
  }

  showMemberVisibilityOnOption(): boolean {
    return this.selectedRequirements?.length > 0 && this.selectedRequirements.some(s => s.isMemberVisible == false || (s.isMemberVisible == null && s?.claimRequirementCategory.isMemberVisible == false));
  }

  showMemberVisibilityOffOption(): boolean {
    return this.selectedRequirements?.length > 0 && this.selectedRequirements.some(s => s.isMemberVisible == true || (s.isMemberVisible == null && s?.claimRequirementCategory.isMemberVisible == true));
  }

  toggleMemberVisibility(targetState: boolean) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('updating requirements...please wait');

    this.selectedRequirements.forEach(personEventClaimRequirement => {
      personEventClaimRequirement.isMemberVisible = targetState;
    });

    this.claimRequirementService.updatePersonEventClaimRequirements(this.selectedRequirements).subscribe(_ => {
      this.handleSelectedRequirements();
      this.refresh();
    });
  }

  shouldOpenMedicalUploadDialog() {
    const medicalDocumentTypes = [ DocumentTypeEnum.FirstMedicalReport, DocumentTypeEnum.ProgressMedicalReport, DocumentTypeEnum.FinalMedicalReport];

    const openMedicalUpload = medicalDocumentTypes.some(document => this.documentFilter.includes(document));
    const isDateOpen = this.selectedPersonEventClaimRequirement.dateClosed == null;

    if (openMedicalUpload && isDateOpen) {
      this.medicalReportType = this.getMedicalReportType(this.documentFilter[0]);
      const dialogRef = this.dialog.open(MedicalUploadDialogComponent, {
        width: '1300px',
        maxHeight: '700px',
        disableClose: true,
        data: {
          selectedPersonEvent: this.personEvent,
          event: this.personEvent.event,
          isWizard: this.isWizard,
          medicalReportType: this.medicalReportType,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.requiredDocumentsUploaded(true);
          this.refresh();
        }
      });
    }
  }

  getMedicalReportType(documentType: DocumentTypeEnum): MedicalReportTypeEnum {
    switch (documentType) {
      case DocumentTypeEnum.ProgressMedicalReport:
        return MedicalReportTypeEnum.ProgressMedicalReport;
      case DocumentTypeEnum.FinalMedicalReport:
        return MedicalReportTypeEnum.FinalMedicalReport;
      default:
        return MedicalReportTypeEnum.FirstMedicalReport; // default
    }
  }
}