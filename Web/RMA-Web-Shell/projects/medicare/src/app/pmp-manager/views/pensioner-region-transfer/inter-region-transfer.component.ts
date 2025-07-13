import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { ToastrManager } from "ng6-toastr-notifications";
import { ModuleTypeEnum } from "projects/shared-models-lib/src/lib/enums/module-type-enum";
import { NoteItemTypeEnum } from "projects/shared-models-lib/src/lib/enums/note-item-type-enum";
import { RoleEnum } from "projects/shared-models-lib/src/lib/enums/role-enum";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { ReferralItemTypeEnum } from "projects/shared-models-lib/src/lib/referrals/referral-item-type-enum";
import { User } from "projects/shared-models-lib/src/lib/security/user";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { UserService } from "projects/shared-services-lib/src/lib/services/security/user/user.service";
import { isNullOrUndefined } from "util";
import { PmpRegionTransfer } from "../../models/pmp-region-transfer";
import { PensionerMedicalPlanService } from "../../services/pensioner-medical-plan-service";
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { ActivatedRoute, Router } from '@angular/router';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inter-region-transfer',
  templateUrl: './inter-region-transfer.component.html',
  styleUrls: ['./inter-region-transfer.component.css']
})
export class PensionerInterRegionTransferComponent {

  @Input() passedInterRegionTransfer: PmpRegionTransfer;
  @Input() title: string = 'Pensioner Region Transfer:';
  @Output() InterRegionTransferEmit = new EventEmitter<PmpRegionTransfer>();

  pensionerInterTransferPatientDetailsFormGroup: FormGroup;
  isLoading = false;

  pmpRegions: Lookup[];
  allReferringAndReceivingUsers: User[];
  allMCAUsers: User[];
  allPAUsers: User[];

  //notes
  moduleType = [ModuleTypeEnum.MediCare, ModuleTypeEnum.ClaimCare, ModuleTypeEnum.PensCare];
  noteItemType = NoteItemTypeEnum.PensionCaseMedicare;

  //referrals
  targetModuleType = ModuleTypeEnum.MediCare;
  referralItemType = ReferralItemTypeEnum.PersonEvent;
  referralItemTypeReference: string;
  pmpRegionTransfer: PmpRegionTransfer;

  handoverInfoEmited: boolean
  pensionCaseId: number;
  pensionCaseNumber: string;
  claimId: number;
  pmpRegionTransferId: number;
  crudActionType: CrudActionType

  crudActionTypeEnum = CrudActionType;
  userReminders: UserReminder[] = [];

  constructor(private formBuilder: FormBuilder, private lookupService: LookupService,
    private pensionerMedicalPlanService: PensionerMedicalPlanService,
    private readonly toasterService: ToastrManager,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userReminderService: UserReminderService,
    private readonly router: Router,
    private readonly authService: AuthService, private readonly userService: UserService,
    private location: Location) {
    this.loadAllReferringAndReceivingUsers();
    this.getPMPRegions();
    this.creatForm();
    this.getRouteData();
    if (isNullOrUndefined(this.pmpRegionTransfer) && this.pmpRegionTransferId < 1)
      this.pmpRegionTransfer = new PmpRegionTransfer();
  }

  creatForm() {

    this.pensionerInterTransferPatientDetailsFormGroup = this.formBuilder.group({
      reasonForReferral: [{ value: '', disabled: false }],
      referringPMPRegion: [{ value: '', disabled: false }],
      referringMCA: [{ value: '', disabled: false }],
      referringPA: [{ value: '', disabled: false }],
      receivingPMPRegion: [{ value: '', disabled: false }],
      receivingMCA: [{ value: '', disabled: false }],
      receivingPA: [{ value: '', disabled: false }],
      dateOfTransfer: [{ value: '', disabled: false }],
      dateOfVisit: [{ value: '', disabled: false }],
      expectedDateOfArrival: [{ value: '', disabled: false }],
      confirmedDateOfArrival: [{ value: '', disabled: false }],
      passportVisaRenewalDate: [{ value: '', disabled: false }],
      dateOfReferral: [{ value: '', disabled: false }],
      comments: [{ value: '', disabled: false }]

    });
  }

  getRouteData(){

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.pensionCaseId) {
        this.pensionCaseId = +params.pensionCaseId;
      }
      if (params.pensionCaseNumber) {
        this.pensionCaseNumber = params.pensionCaseNumber;
      }
      if (params.claimId) {
        this.claimId = +params.claimId;
      }
      if (params.pmpRegionTransferId) {
        this.pmpRegionTransferId = +params.pmpRegionTransferId;
      }

      if (params.crudActionType) {
        this.crudActionType = +params.crudActionType;

        switch (this.crudActionType) {
          case CrudActionType.create:
            this.disableForm(false);
            break;
          case CrudActionType.edit:
            this.disableForm(false);
            this.listInterRegionTransferForm()
            break;
          case CrudActionType.read:
            this.disableForm(true);
            this.listInterRegionTransferForm()
            break;
          default:
            break;
        }
      }
    });
  }

  submitInterRegionTransferForm() {
    this.isLoading = true;
    this.createInterRegionTransferDetails()

    if (this.crudActionType == CrudActionType.create) {
      this.pensionerMedicalPlanService.createPmpRegionTransfer(this.pmpRegionTransfer).subscribe(
        data => {
          this.isLoading = false;
          if (data > 0) {
            this.pmpRegionTransferId = data;
            this.toasterService.successToastr('PMP Region Transfer: created');
            this.sendNotifications();
          }
        }
      );
    }
    else if (this.crudActionType == CrudActionType.edit) {
      this.pensionerMedicalPlanService.updatePmpRegionTransfer(this.pmpRegionTransfer).subscribe(
        data => {
          this.isLoading = false;
          if (data)
            this.toasterService.successToastr('PMP Region Transfer: updated');
          this.onNavigateBack()
        }
      );
    }

  }

  sendNotifications() {
    const userReminder = new UserReminder();
    userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
    userReminder.text = `New Inter-Region Transfer submitted by: ${this.authService.getUserEmail()}`;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();
    userReminder.userReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications;
    userReminder.itemId = this.pensionCaseId;
    userReminder.linkUrl = `/medicare/pmp-manager/pensioner-inter-region-transfer/${this.pensionCaseId}/${this.pensionCaseNumber}/${this.claimId}/${this.pmpRegionTransferId}/${CrudActionType.read}`;
    userReminder.assignedByUserId = this.authService.getCurrentUser().id;

    let receivingUserIds: number[] = [this.pmpRegionTransfer.receivingMcaId, this.pmpRegionTransfer.receivingPaId];

    for (let index = 0; index < receivingUserIds.length; index++) {
      const element = receivingUserIds[index];
      let userSelected = this.allReferringAndReceivingUsers.find(d => d.id == element)
      userReminder.assignedToUserId = userSelected.id;
      this.userReminders.push(userReminder);
    }

    this.userReminderService.createUserReminders(this.userReminders).subscribe(result => {
      this.toasterService.successToastr('PMP Region Transfer notifications: sent..');
      this.onNavigateBack();
    });
  }

  onNavigateBack() {
    this.location.back();
  }

  listInterRegionTransferForm() {
    this.isLoading = true;
    this.pensionerMedicalPlanService.getPmpRegionTransferByClaimId(this.claimId).subscribe(
      data => {
        this.isLoading = false;
        this.pmpRegionTransfer = data.find(d => d.pmpRegionTransferId == this.pmpRegionTransferId)
        this.prepopulateForm()
      }
    );
  }

  getPMPRegions(): void {
    this.isLoading = true;
    this.lookupService.getPMPRegions().subscribe(
      data => {
        this.isLoading = false;
        this.pmpRegions = data;
      }
    );
  }

  loadAllReferringAndReceivingUsers(): void {
    this.isLoading = true;
    const roles = [RoleEnum.PensionServiceAdministrator.toString(), RoleEnum.PensionerMedicalCaseAuditor.toString()]
    this.userService.getUsersByRoleIds(roles).subscribe(
      data => {
        this.isLoading = false;
        if (data) {
          this.allReferringAndReceivingUsers = data;
          this.allMCAUsers = data.filter(d => d.roleId == RoleEnum.PensionServiceAdministrator);
          this.allPAUsers = data.filter(d => d.roleId == RoleEnum.PensionerMedicalCaseAuditor);
        }
      }
    );
  }

  createInterRegionTransferDetails(): void {
    
    this.pmpRegionTransfer.reasonForReferral = this.pensionerInterTransferPatientDetailsFormGroup.controls.reasonForReferral.value;
    this.pmpRegionTransfer.referringPmpRegionId = this.pensionerInterTransferPatientDetailsFormGroup.controls.referringPMPRegion.value;
    this.pmpRegionTransfer.referringMcaId = this.pensionerInterTransferPatientDetailsFormGroup.controls.referringMCA.value;
    this.pmpRegionTransfer.referringPaId = this.pensionerInterTransferPatientDetailsFormGroup.controls.referringPA.value;
    this.pmpRegionTransfer.receivingPmpRegionId = this.pensionerInterTransferPatientDetailsFormGroup.controls.receivingPMPRegion.value;
    this.pmpRegionTransfer.receivingMcaId = this.pensionerInterTransferPatientDetailsFormGroup.controls.receivingMCA.value;
    this.pmpRegionTransfer.receivingPaId = this.pensionerInterTransferPatientDetailsFormGroup.controls.receivingPA.value;
    this.pmpRegionTransfer.dateOfTransfer = this.pensionerInterTransferPatientDetailsFormGroup.controls.dateOfTransfer.value;
    this.pmpRegionTransfer.expDateOfArrival = this.pensionerInterTransferPatientDetailsFormGroup.controls.expectedDateOfArrival.value;
    this.pmpRegionTransfer.confDateOfArrival = this.pensionerInterTransferPatientDetailsFormGroup.controls.confirmedDateOfArrival.value;
    this.pmpRegionTransfer.passportVisaRenewalDate = this.pensionerInterTransferPatientDetailsFormGroup.controls.passportVisaRenewalDate.value;
    this.pmpRegionTransfer.dateOfReferral = this.pensionerInterTransferPatientDetailsFormGroup.controls.dateOfReferral.value;
    this.pmpRegionTransfer.claimId = this.claimId;
    this.pmpRegionTransfer.healthCareProviderId = (this.authService.getCurrentUser().userTypeId == RolePlayerIdentificationTypeEnum.HealthCareProvider) ? this.authService.getCurrentUser().id : null;
    this.pmpRegionTransfer.isActive = true;
    this.pmpRegionTransfer.isDeleted = false;
    this.pmpRegionTransfer.comments = this.pensionerInterTransferPatientDetailsFormGroup.controls.comments.value;
    this.pmpRegionTransfer.modifiedBy = this.authService.getUserEmail();

    if (this.crudActionType == CrudActionType.create) {
      this.pmpRegionTransfer.createdDate = new Date().toDateString();
      this.pmpRegionTransfer.modifiedDate = new Date().toDateString();
      this.pmpRegionTransfer.createdBy = this.authService.getUserEmail();
      this.pmpRegionTransfer.modifiedBy = this.authService.getUserEmail();
    }
    else {
      this.pmpRegionTransfer.modifiedBy = this.authService.getUserEmail();
      this.pmpRegionTransfer.modifiedDate = new Date().toDateString();
    }

  }


  getHandoverInfo($event: PmpRegionTransfer) {
    this.pmpRegionTransfer.treatmentReceived = $event.treatmentReceived;
    this.pmpRegionTransfer.daigonsis = $event.daigonsis;
    this.pmpRegionTransfer.medicationSundriesIssued = $event.medicationSundriesIssued;
    this.pmpRegionTransfer.issuedDate = $event.issuedDate;
    this.pmpRegionTransfer.isSpousalTraining = $event.isSpousalTraining;
    this.pmpRegionTransfer.isUds = $event.isUds;
    this.pmpRegionTransfer.issuedMonth = $event.issuedMonth;
    this.pmpRegionTransfer.comments = $event.comments;
    this.pmpRegionTransfer.isActive = true;
    this.pmpRegionTransfer.isDeleted = false;
    this.handoverInfoEmited = true;
  }

  disableForm(disableVal: boolean) {
    if (disableVal) {
      this.pensionerInterTransferPatientDetailsFormGroup.disable();
    }
    else {
      this.pensionerInterTransferPatientDetailsFormGroup.enable();
    }
  }


  prepopulateForm() {
    this.isLoading = false
    this.handoverInfoEmited = true;
    const selectedPmpRegionTransferData = this.pmpRegionTransfer;

    if (!isNullOrUndefined(selectedPmpRegionTransferData)) {

      this.pensionerInterTransferPatientDetailsFormGroup.patchValue({
        reasonForReferral: selectedPmpRegionTransferData.reasonForReferral,
        referringPMPRegion: selectedPmpRegionTransferData.referringPmpRegionId,
        referringMCA: selectedPmpRegionTransferData.referringMcaId,
        referringPA: selectedPmpRegionTransferData.referringPaId,
        receivingPMPRegion: selectedPmpRegionTransferData.receivingPmpRegionId,
        receivingMCA: selectedPmpRegionTransferData.referringMcaId,
        receivingPA: selectedPmpRegionTransferData.receivingPaId,
        dateOfTransfer: selectedPmpRegionTransferData.dateOfTransfer,
        dateOfVisit: selectedPmpRegionTransferData.issuedDate,
        expectedDateOfArrival: selectedPmpRegionTransferData.expDateOfArrival,
        confirmedDateOfArrival: selectedPmpRegionTransferData.confDateOfArrival,
        passportVisaRenewalDate: selectedPmpRegionTransferData.passportVisaRenewalDate,
        dateOfReferral: selectedPmpRegionTransferData.dateOfReferral

      });


    }
  }

}
