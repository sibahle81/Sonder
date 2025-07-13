import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Component, Output, EventEmitter } from '@angular/core';

import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardAction } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-action.enum';
import { WizardParameters } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-parameters';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';

import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { Router } from '@angular/router';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wizard-start-step',
  templateUrl: './wizard-start-step.component.html'
})
export class WizardStartStepComponent {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onWizardContextCreated = new EventEmitter<WizardContext>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStartClicked = new EventEmitter();

  wizardContext: WizardContext;
  isReady: boolean;
  loadingTitle: string;
  lastMessage: Note;
  rejectionComment: string;
  namedisplay: string;
  wizardStatus: string;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get isNew(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard || !this.wizardContext.wizard.startType) { return false; }
    return (this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress || this.wizardContext.wizard.wizardStatusId === WizardStatus.New) && this.wizardContext.wizard.startType.toLowerCase() === 'new';
  }

  get isContinue(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard || !this.wizardContext.wizard.startType) { return false; }
    return ((this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress || this.wizardContext.wizard.wizardStatusId === WizardStatus.New ) || (this.isDisputed)) && this.wizardContext.wizard.startType.toLowerCase() === 'continue';
  }

  get isDisputed(): boolean {
    const customStatus = this.wizardContext.wizard.customStatus
      ? this.wizardContext.wizard.customStatus.toLowerCase()
      : '';
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.Disputed
      || (this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress && customStatus === 'disputed');
  }

  get isAwaitingApproval(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard) { return false; }
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval;
  }

  get isCancelled(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard) { return false; }
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.Cancelled;
  }

  get isCompleted(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard) { return false; }
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.Completed;
  }

  get isRejected(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard) { return false; }
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.Rejected;
  }

  get totalSteps(): number {
    if (!this.wizardContext || !this.wizardContext.wizard) { return 1; }
    return this.wizardContext.wizardComponents.length + 1;
  }

  get currentStep(): number {
    if (!this.wizardContext || !this.wizardContext.wizard) { return 0; }
    return this.wizardContext.wizard.currentStepIndex;
  }

  get currentDescription(): string {
    return this.wizardContext.name;
  }

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly wizardContextFactory: WizardContextFactory,
    private readonly notesService: NotesService,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService) {
  }

  startWizard(wizardParameters: WizardParameters) {
    this.wizardContext = this.wizardContextFactory.createContext(wizardParameters.type);
    this.wizardContext.wizard = null;
    this.loadingTitle = 'Preparing your requested wizard';
    this.isReady = false;

    if (wizardParameters.action === WizardAction.New) {
      const startWizardRequest = new StartWizardRequest();
      startWizardRequest.type = wizardParameters.type;
      startWizardRequest.linkedItemId = wizardParameters.id;
      this.wizardService.startWizard(startWizardRequest).subscribe(wizard => this.wizardCreated(wizard));
    } else {
      this.wizardService.continueWizard(wizardParameters.id).subscribe(wizard => this.wizardCreated(wizard));
    }
  }

  private wizardCreated(wizard: Wizard): void {
    this.wizardContext.wizard = wizard;
    this.wizardContext.data = new Array();

    this.wizardContext.formatData();
    this.retieveLastMessage();
    this.isReady = true;
    this.onWizardContextCreated.emit(this.wizardContext);
  }

  private retieveLastMessage(): void {
    if (this.isDisputed || this.isRejected) {
      this.notesService
        .getNotes(ServiceTypeEnum.BusinessProcessManager, 'Wizard', this.wizardContext.wizard.id)
        .subscribe(data => {
          if (data) {
            const note = data[data.length - 1];
            this.rejectionComment = note.text;
            this.notesService.getNote(ServiceTypeEnum.BusinessProcessManager,
              note.id).subscribe(
                // tslint:disable-next-line: no-shadowed-variable
                note => {
                  this.lastMessage = new Note();
                  this.lastMessage.text = this.rejectionComment;
                });
          }
        });
    }
  }

  start(): void {
    this.onStartClicked.emit(this.wizardContext);
  }

  back(): void {
    this.router.navigate([this.wizardContext.backLink]);
  }

  cancel(): void {
    this.confirmservice.confirmWithoutContainer('Delete Wizard', 'Are you sure you want to delete this wizard?',
      'Center', 'Center', 'Yes', 'No').subscribe(result => {
        if (result === true) {
          this.isLoading$.next(true);
          this.wizardService
            .cancelWizard(this.wizardContext.wizard.id)
            .subscribe(() => {
              this.alertService.success('Wizard deleted successfully');
              this.back();
              this.isLoading$.next(false);
            }, (error) => {
              this.alertService.error(error);
              this.isLoading$.next(false);
            });
        }
      });
  }

  createdByMe(): boolean {
    return this.wizardContext.wizard.createdBy === this.authService.getCurrentUser().email;
  }

  isLockedToMe(): boolean {
    return this.wizardContext.wizard.lockedToUser === this.authService.getCurrentUser().email;
  }

  canCancel(): boolean {
    return this.isContinue && (userUtility.hasPermission('Cancel Wizard')
      || this.createdByMe()
      || this.isLockedToMe());
  }
}
