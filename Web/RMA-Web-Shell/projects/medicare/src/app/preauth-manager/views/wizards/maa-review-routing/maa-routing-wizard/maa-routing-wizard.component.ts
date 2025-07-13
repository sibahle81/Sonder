import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { PreAuthorisation } from '../../../../models/preauthorisation';
import { MediCarePreAuthService } from '../../../../services/medicare-preauth.service';
import { MaaRouting } from '../../../../models/maa-routing';
import { MatDialog } from '@angular/material/dialog';
import { UserSearchDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/user-search-dialog/user-search-dialog.component';
import { RoleSearchDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/role-search-dialog/role-search-dialog.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { PreauthReviewWizardConfigTypeEnum } from 'projects/medicare/src/app/shared/enums/review-wizard-config-type';

@Component({
  selector: 'app-maa-routing-wizard',
  templateUrl: './maa-routing-wizard.component.html',
  styleUrls: ['./maa-routing-wizard.component.css']
})
export class MaaRoutingWizardComponent extends WizardDetailBaseComponent<PreAuthorisation> implements OnInit {

  loadingData$ = new BehaviorSubject<boolean>(false);
  isInternalUser: boolean = true;
  currentUserEmail: string;
  selectedTab = 0;
  noPersonEventLink: boolean = false;
  personEventId: number;
  claimId = 0;
  selectedEvent: EventModel;
  selectedPersonEvent: PersonEventModel;
  icd10List = [];
  mode = ModeEnum.Default;
  eventId: Number;
  previousUrl = '';
  preloadMedicalInvoices = false;
  searchedPreauthType: PreauthTypeEnum = PreauthTypeEnum.Unknown;
  selectedPreAuthId = 0;
  isHolisticView = false;
  selectedClaim: Claim;
  selectedPreAuth: PreAuthorisation;
  assignmentTypes: { name: string, value: number }[] = [];
  form: UntypedFormGroup;
  selectedAssignedName = '';
  reviewConfigId = 0;
  assignToUserId = 0;

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      assignmentType: [],
    });

  }
  onLoadLookups(): void {

  }
  populateModel(): void {
    this.model.assignToUserId = this.assignToUserId;
    this.model.reviewWizardConfigId = this.reviewConfigId;
  }
  populateForm(): void {
    this.loadAssignmentTypes();
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
  constructor(
    readonly claimCareService: ClaimCareService,
    readonly preauthService: MediCarePreAuthService,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute, private matDialog: MatDialog, private formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.createForm(0);
  }

  loadAssignmentTypes() { 
    this.assignmentTypes.push({ name: 'User', value: 0 });
    this.assignmentTypes.push({ name: 'HUM Pool', value: PreauthReviewWizardConfigTypeEnum.HUMReview });
    this.assignmentTypes.push({ name: 'CCA Pool', value: PreauthReviewWizardConfigTypeEnum.CCAReview });
    this.assignmentTypes.push({ name: 'Case Management Pool', value: PreauthReviewWizardConfigTypeEnum.CaseManagementReview });
  }

  onAssignementTypeChanged($event: number) {
     if ($event === 0) {
      this.openUsersDialog();
    }
    else{
      this.reviewConfigId = $event;
    }
  }

  openUsersDialog(
  ): void {
    const dialogRef = this.matDialog.open(UserSearchDialogComponent, {
      width: "50%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.assignToUserId = result.id;
        this.selectedAssignedName = result.email;   
       this.populateModel();
      };
    });
  }
}

