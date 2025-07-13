import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './capture-claim.component.html',
  styleUrls: ['./capture-claim.component.css']
})
export class CaptureClaimComponent extends PermissionHelper implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  rolePlayerId: number;
  linkedUserMember = new LinkedUserMember();

  form: UntypedFormGroup;

  supportedEventTypes: EventTypeEnum[] = [EventTypeEnum.Accident, EventTypeEnum.Disease];

  currentUser: User;

  constructor(
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.createForm();
  }

  isContextReady(): boolean {
    const isReady = userUtility.isMemberContextReady();
    return isReady ? isReady : false;
  }

  getSelectedMemberContext(): number {
    const selectedMemberContext = userUtility.getSelectedMemberContext();
    return selectedMemberContext ? selectedMemberContext.rolePlayerId : this.rolePlayerId ? this.rolePlayerId : 0;
  }

  setRolePlayer($event) {
    this.linkedUserMember.memberName = $event.displayName;
    this.rolePlayerId = $event.rolePlayerId;
  }

  reset() {
    this.rolePlayerId = 0;
    this.linkedUserMember = new LinkedUserMember();
  }

  createForm() {
    this.form = this.formBuilder.group({
      eventType: [{ value: null, disabled: false }, Validators.required],
    });

    this.isLoading$.next(false);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getEventTypeText(eventType: EventTypeEnum): string {
    return this.formatLookup(EventTypeEnum[eventType]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  openConfirmationDialog(eventType: EventTypeEnum) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Capture New Claim Notification?',
        text: `Are you sure you want to start a new ${this.getEventTypeText(eventType)} claim notification?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startClaimWizard(eventType);
      }
    });
  }

  startClaimWizard(eventType: EventTypeEnum) {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = eventType == EventTypeEnum.Accident ? 'accident-claim' : 'disease-claim';
    const event = new EventModel();
    event.memberSiteId = this.getSelectedMemberContext();
    startWizardRequest.data = JSON.stringify(event);
    startWizardRequest.lockedToUser = this.currentUser.email;

    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      Wizard.redirect(this.router, wizard.wizardConfiguration.name, wizard.id);
    });
  }
}
