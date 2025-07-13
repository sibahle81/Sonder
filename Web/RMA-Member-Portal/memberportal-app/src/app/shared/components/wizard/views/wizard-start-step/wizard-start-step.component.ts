import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ServiceType } from 'src/app/shared/enums/service-type.enum';
import { Note } from 'src/app/shared/models/note.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { NotesService } from '../../../notes/notes.service';
import { WizardContextFactory } from '../../sdk/wizard-context.factory';
import { StartWizardRequest } from '../../shared/models/start-wizard-request';
import { Wizard } from '../../shared/models/wizard';
import { WizardAction } from '../../shared/models/wizard-action.enum';
import { WizardContext } from '../../shared/models/wizard-context';
import { WizardParameters } from '../../shared/models/wizard-parameters';
import { WizardStatus } from '../../shared/models/wizard-status.enum';
import { WizardService } from '../../shared/services/wizard.service';

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
  isReady$ = new BehaviorSubject<boolean>(false);
  loadingTitle = 'Preparing your requested wizard';
  lastMessage: Note;
  rejectionComment: string;
  namedisplay: string;
  wizardStatus: string;
  isLoading = false;

  get isNew(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard || !this.wizardContext.wizard.startType) { return false; }
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress && this.wizardContext.wizard.startType.toLowerCase() === 'new';
  }

  get isContinue(): boolean {
    if (!this.wizardContext || !this.wizardContext.wizard || !this.wizardContext.wizard.startType) { return false; }
    return ((this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress)
      || (this.isDisputed)) && this.wizardContext.wizard.startType.toLowerCase() === 'continue';
  }

  get isDisputed(): boolean {
    return this.wizardContext.wizard.wizardStatusId === WizardStatus.Disputed
      || (this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress && this.wizardContext.wizard.customStatus === 'Disputed');
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
    private readonly alertService: AlertService,
    private readonly authService: AuthService) {
  }

  startWizard(wizardParameters: WizardParameters) {
    this.wizardContext = this.wizardContextFactory.createContext(wizardParameters.type);
    this.wizardContext.wizard = null;
    this.isReady$.next(false);

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
    this.isReady$.next(true);
    this.onWizardContextCreated.emit(this.wizardContext);
  }

  private retieveLastMessage(): void {
    if (this.isDisputed || this.isRejected) {
      this.notesService
        .getNotes(ServiceType.BusinessProcessManager, 'Wizard', this.wizardContext.wizard.id)
        .subscribe(data => {
          if (data) {
            const note = data[data.length - 1];
            this.rejectionComment = note.text;
            this.notesService.getNote(ServiceType.BusinessProcessManager,
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

  }

  hasPermissionCancelWizard(): boolean {
    return this.authService.userHasPermission('Cancel Wizard');
  }

  createdByMe(): boolean {
    return this.wizardContext.wizard.createdBy === this.authService.getCurrentUser().email;
  }

  isLockedToMe(): boolean {
    return this.wizardContext.wizard.lockedToUser === this.authService.getCurrentUser().email;
  }

  canCancel(): boolean {
    return this.isContinue && (this.hasPermissionCancelWizard()
      || this.createdByMe()
      || this.isLockedToMe());
  }
}
