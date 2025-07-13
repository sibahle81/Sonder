import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Component, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { WizardBreadcrumbService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-breadcumb.service';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardParameters } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-parameters';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WizardApprovalStepComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-approval-step/wizard-approval-step.component';
import { WizardCancelStepComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-cancel-step/wizard-cancel-step.component';
import { WizardSaveStepComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-save-step/wizard-save-step.component';
import { WizardStartStepComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-start-step/wizard-start-step.component';
import { WizardSubmitStepComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-submit-step/wizard-submit-step.component';
import { WizardValidationStepComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-validation-step/wizard-validation-step.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ApprovalRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/approval-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './wizard-host.component.html',
  styleUrls: ['./wizard-host.component.css']
})
export class WizardHostComponent implements OnInit {
  @ViewChildren('step', { read: ViewContainerRef }) stepperSteps: QueryList<ViewContainerRef>;

  @ViewChild(MatStepper, { static: false }) matStepper: MatStepper;
  @ViewChild(WizardStartStepComponent, { static: true }) wizardStartStepComponent: WizardStartStepComponent;
  @ViewChild(WizardCancelStepComponent, { static: true }) wizardCancelStepComponent: WizardCancelStepComponent;
  @ViewChild(WizardValidationStepComponent, { static: false }) wizardValidationStepComponent: WizardValidationStepComponent;
  @ViewChild(WizardApprovalStepComponent, { static: false }) wizardApprovalStepComponent: WizardApprovalStepComponent;
  @ViewChild(WizardSubmitStepComponent, { static: true }) wizardSubmitStepComponent: WizardSubmitStepComponent;
  @ViewChild(WizardSaveStepComponent, { static: true }) wizardSaveStepComponent: WizardSaveStepComponent;

  error: any;
  wizardContext: WizardContext;
  hasStarted = false;
  isLastStep = false;
  isApprovalResolved = false;
  showRejectOnConditionButton = false;
  showfinishRejectionWithConditionButton = false;
  premiumListingWizardConfigurationId = '24';
  RejectOnConditionButtonClicked = false;
  isSubscribeToWizardContext = false;
  wizardStatusId: number;
  isInternalUser = false;
  lockedUser: string;
  newname: string;
  invoiceCaptureConfigurationId: string = '80';

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    readonly authService: AuthService,
    readonly appEventsManager: AppEventsManager,
    readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    readonly wizardService: WizardService,
    readonly breadcrumbService: WizardBreadcrumbService,
    readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService
  ) {
  }

  ngOnInit(): void {
    this.appEventsManager.errorMessageChanged.subscribe(error => this.error = error);

    this.activatedRoute.params.subscribe((params: any) => {
      this.wizardContext = null;
      this.hasStarted = false;
      this.error = null;

      if (params.type == null) { throw new Error('Cannot start a wizard without a type parameter'); }
      if (params.action == null) { throw new Error('Cannot start a wizard without an action parameter'); }
      if (params.linkedId == null) { throw new Error('Cannot start a wizard without an id parameter'); }

      const wizardParameters = new WizardParameters(params.linkedId, params.action, params.type);
      this.wizardStartStepComponent.startWizard(wizardParameters);
      this.subscribeToWizardContextCreated();
    });
    const currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
  }

  get hasLoaded(): boolean {
    return this.wizardContext != null && this.wizardContext.wizard != null;
  }

  get isValidationValid(): boolean {
    if (!this.wizardValidationStepComponent || !this.hasLoaded) { return true; }
    return this.wizardValidationStepComponent.isValidationValid;
  }

  get isValidationComplete(): boolean {
    if (!this.wizardValidationStepComponent || !this.hasLoaded) { return true; }
    return this.wizardValidationStepComponent.isValidationComplete;
  }

  get showBackButton(): boolean {
    if (!this.matStepper || !this.hasLoaded) { return false; }
    if (this.isLastStep && this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval) { return false; }

    const result = this.matStepper.selectedIndex > 0;
    return result;
  }

  get showNextButton(): boolean {
    if (!this.matStepper) { return true; }
    const result = this.matStepper.selectedIndex + 1 < this.totalSteps;
    return result;
  }

  get showFinishButton(): boolean {
    if (!this.hasLoaded || this.wizardContext.wizard.lockedReason) { return false; }
    const result = this.currentStep === this.totalSteps && (this.isValidationValid || this.wizardContext.wizard.wizardConfigurationId == this.invoiceCaptureConfigurationId) && this.isValidationComplete && !this.wizardContext.wizard.hasApproval;
    return result;
  }

  get showOverrideButton(): boolean {
    if (!this.hasLoaded || this.wizardContext.wizard.lockedReason) { return false; }
    const canOverride = this.wizardContext.wizard.wizardConfiguration.isOverridable;
    const result = this.currentStep === this.totalSteps && canOverride && this.isValidationComplete && !this.isValidationValid && !this.wizardContext.wizard.hasApproval && this.isInternalUser;
    return result;
  }

  get showRequestApprovalButton(): boolean {
    if (!this.hasLoaded || this.wizardContext.wizard.lockedReason) { return false; }
    const result = this.currentStep === this.totalSteps && this.isValidationValid && this.isValidationComplete && this.wizardContext.wizard.hasApproval && this.wizardContext.wizard.wizardStatusId !== WizardStatus.AwaitingApproval;
    return result;
  }

  get showApproveButton(): boolean {
    if (!this.hasLoaded || this.wizardContext.wizard.lockedReason) { return false; }
    const result = this.currentStep === this.totalSteps && this.isValidationValid && this.isValidationComplete;
    return result;
  }

  get showSaveCloseButton(): boolean {
    if (!this.hasLoaded || (this.wizardContext.wizard.lockedReason || this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval)) { return false; }
    const result = this.hasStarted && ((this.currentStep < this.totalSteps) || (!this.isValidationValid && this.isValidationComplete));
    return result;
  }

  get showCloseButton(): boolean {
    if (!this.hasLoaded) { return false; }

    if (this.wizardContext.wizard.lockedToUser != null && !this.isLastStep) {
      this.lockedUser = this.wizardContext.wizard.lockedToUser;
      return true;
    }

    const result = !this.isLastStep && this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval;
    return result;
  }

  get showCancelButton(): boolean {
    if (!this.hasLoaded) { return false; }
    return this.wizardContext && this.wizardContext.wizard.canEdit && !this.isLastStep;
  }

  get isReadonly(): boolean {
    return !this.hasLoaded || !this.wizardContext.wizard.canEdit;
  }

  get totalSteps(): number {
    if (!this.matStepper) { return -1; }
    return this.matStepper._steps.length;
  }

  get currentStep(): number {
    if (!this.hasLoaded) { return 0; }
    return this.wizardContext.wizard.currentStepIndex;
  }

  get awaitingApproval(): number {
    return WizardStatus.AwaitingApproval;
  }

  private subscribeToWizardContextCreated(): void {
    this.wizardStartStepComponent.onWizardContextCreated.subscribe((wizardContext: WizardContext) => {
      this.wizardContext = wizardContext;

      if (this.wizardContext.breadcrumbModule.length > 0) {
        if (this.wizardContext.wizard.id > 0) {
          this.breadcrumbService.setBreadcrumb(this.wizardContext.breadcrumbModule, this.wizardContext.breadcrumbTitle);
        }
      }
      if (wizardContext) {
        this.isSubscribeToWizardContext = true;
        this.wizardStatusId = wizardContext.wizard.wizardStatusId;
      }
    });
  }

  onStartClicked(): void {
    this.hasStarted = true;
    this.addComponentsToSteps();
    const currentStep = this.wizardContext.wizard.wizardStatusId === (WizardStatus.InProgress || WizardStatus.New)
      ? 1
      : 1;

    this.moveWizardToStep(currentStep);
    this.subscribeSelectionChanged();

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.linkedId === 0) {
        this.wizardContext.wizard.hasApproval = false;
      }
    });
  }

  private addComponentsToSteps(): void {
    let counter = 0;
    this.wizardContext.stepComponents = new Array();

    this.stepperSteps.forEach(stepperStep => {
      const wizardStep = this.wizardContext.getActiveWizardComponents()[counter++];

      const component = this.wizardContext.createComponent(wizardStep.name);
      const wizardComponent = stepperStep.createComponent(component).instance as WizardComponentInterface;
      wizardComponent.isWizard = true;
      wizardComponent.firstName = typeof (wizardComponent).firstName;
      wizardComponent.displayName = wizardStep.name;
      wizardComponent.step = wizardStep.index.toString();
      this.wizardContext.setComponentPermissions(wizardComponent);
      this.wizardContext.stepComponents.push(wizardComponent);
    });
  }

  private setStepData(step: number): void {
    const component = this.wizardContext.stepComponents[step];
    if (component != null) {
      this.wizardContext.currentData = this.wizardContext.data[step];
      component.wizardPopulateForm(this.wizardContext);

      if (this.isReadonly) {
        component.disable();
      }
    }
  }

  private saveStepData(step: number) {
    const wizardComponent = this.wizardContext.getActiveWizardComponents()[step];
    if (!wizardComponent) { return; }

    if (!this.canSaveComponentData(wizardComponent)) { return; }

    const component = this.wizardContext.stepComponents[step];
    if (!component) { return; }

    if (!component.singleDataModel) {
      // this is temporary until all wizards have migrated to use a single data model
      this.wizardContext.data[step] = component.wizardReadFormData(this.wizardContext);
    } else {
      this.wizardContext.data[0] = component.wizardReadFormData(this.wizardContext);
    }
  }

  private moveWizardToStep(index: number): void {
    for (let i = 1; i < index; i++) {
      this.matStepper.next();
    }

    this.setStepData(index - 1);
    this.processIfLastStep(this.matStepper.selectedIndex);
  }

  private subscribeSelectionChanged(): void {
    this.matStepper.selectionChange.subscribe((selection: any) => {
      const wizardComponentStep = this.wizardContext.getActiveWizardComponents()[selection.selectedIndex];
      this.initializeCustomProperties(wizardComponentStep);

      this.saveStepData(selection.previouslySelectedIndex);
      this.setStepData(selection.selectedIndex);
      this.wizardContext.wizard.currentStepIndex = selection.selectedIndex + 1;
      if (this.wizardContext.wizard.linkedItemId !== 0) {
        if (!this.wizardContext.wizard.name || this.wizardContext.wizard.name === '') {
          this.getName();
        }
      }
      this.save(selection.previouslySelectedIndex);
      this.processIfLastStep(selection.selectedIndex);
    });
  }

  private getName(): void {
    this.wizardService.getWizardName(this.wizardContext.wizard.id).subscribe((thewizard: Wizard) => {
      if (thewizard != null) {
        this.wizardContext.wizard.name = thewizard.name;
      }
    });
  }

  private processIfLastStep(step: number) {
    if (step + 1 !== this.totalSteps) {
      this.isLastStep = false;
      return;
    }
    this.isLastStep = true;
    if (this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval && !(this.wizardContext.wizard.canApprove &&
      this.wizardContext.getActiveWizardComponents().filter(c => c.isApprovalStep).length > 0)) {
      this.wizardApprovalStepComponent.startApproval(this.wizardContext);
    } else {
      this.wizardValidationStepComponent.validate(this.wizardContext);
    }
  }

  onNavigate(stepNumber: number) {
    this.matStepper.selectedIndex = stepNumber;
  }

  previousStep(): void {
    this.matStepper.previous();
  }

  nextStep(): void {
    this.matStepper.next();
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

  reject(): void {
    const action = this.wizardContext.forceApproveRejectOptions ? 'Reject' : 'Delete';
    this.confirmservice.confirmWithoutContainer(`${action} Wizard`, `Are you sure you want to ${action.toLocaleLowerCase()} this wizard?`,
      'Center', 'Center', 'Yes', 'No').subscribe(result => {
        if (result === true) {
          this.isLoading$.next(true);
          this.wizardService
            .cancelWizard(this.wizardContext.wizard.id)
            .subscribe(() => {
              this.alertService.success(`Wizard${action === 'Reject' ? 'rejected' : 'deleted'} successfully`);
              this.back();
              this.isLoading$.next(false);
            }, (error) => {
              this.alertService.error(error);
              this.isLoading$.next(false);
            });
        }
      });
  }

  back(): void {
    this.router.navigate([this.wizardContext.backLink]);
  }

  private canSaveComponentData(component: WizardComponentStep): boolean {
    let continueSave = false;
    continueSave = !(this.isReadonly
      && !(
        this.wizardContext.wizard.canApprove
        && this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval
      )
    );
    return continueSave;
  }

  save(previouslySelectedIndex: number): void {
    const previousComponent = this.wizardContext.getActiveWizardComponents()[previouslySelectedIndex];
    if (!previousComponent) { return; }
    if (!this.canSaveComponentData(previousComponent)) { return; }
    this.saveWizardData();
  }

  saveWizardData(): void {
    // tslint:disable-next-line: triple-equals
    if (this.wizardContext.wizard.canEdit || this.wizardContext.wizard.wizardConfigurationId == this.premiumListingWizardConfigurationId) {
      const saveWizardRequest = this.wizardContext.createSaveWizardRequest();
      saveWizardRequest.updateLockedUser = true;
      saveWizardRequest.lockedToUser = this.authService.getUserEmail();
      saveWizardRequest.currentStep = this.wizardContext.wizard.currentStepIndex;
      this.wizardService.saveWizard(saveWizardRequest).subscribe();
    }
  }

  saveAndClose(): void {
    this.saveStepData(this.matStepper.selectedIndex);
    this.wizardSaveStepComponent.startSave(this.wizardContext);
  }

  finishWizard(): void {
    this.wizardSubmitStepComponent.submitWizard(this.wizardContext);
  }

  overrideWizard(): void {
    this.wizardSubmitStepComponent.overrideWizard(this.wizardContext);
  }

  requestApproval(): void {
    this.wizardSubmitStepComponent.requestApproval(this.wizardContext);
  }

  onApprovalSubmit(approvalRequest: ApprovalRequest): void {
    this.wizardSubmitStepComponent.resolveApproval(this.wizardContext, approvalRequest);
  }

  rejectWithCondition() {
    const setIndex = this.wizardContext.wizardComponents.findIndex(c => c.name === 'Notes');
    if (setIndex !== -1) {
      this.matStepper.selectedIndex = setIndex;
      this.RejectOnConditionButtonClicked = true;
    }
  }

  finishRejectionWithCondition(): void {
    const component = this.wizardContext.stepComponents[this.matStepper.selectedIndex];
    const data = component.wizardReadFormData(this.wizardContext);
    this.saveStepData(this.matStepper.selectedIndex);
    this.wizardSubmitStepComponent.rejectWizardWithCondition(this.wizardContext, data);
  }

  initializeCustomProperties(wizardComponentStep: WizardComponentStep) {
    this.resetCustomProperties();
    if (wizardComponentStep) {
      if (wizardComponentStep.rejectOnCondition) {
        this.showRejectOnConditionButton = wizardComponentStep.rejectOnCondition;
      }
      if (wizardComponentStep.showfinishRejectionWithCondition) {
        this.showfinishRejectionWithConditionButton = wizardComponentStep.showfinishRejectionWithCondition;
      }
    }
  }

  resetCustomProperties() {
    this.showRejectOnConditionButton = false;
    this.showfinishRejectionWithConditionButton = false;
  }

  get rejectedStatus(): number {
    return WizardStatus.Rejected;
  }

  get isContinue(): boolean {
    return this.hasLoaded && (this.wizardContext.wizard.wizardStatusId === WizardStatus.InProgress
      || this.wizardContext.wizard.wizardStatusId === WizardStatus.Disputed);
  }

  createdByMe(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) { return null; }
    return this.hasLoaded && this.wizardContext.wizard.createdBy.toLowerCase() === user.email.toLowerCase();
  }

  isLockedToMe(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) { return false; }
    return this.hasLoaded && this.wizardContext.wizard.lockedToUser === user.email;
  }

  canCancel(): boolean {
    return this.hasLoaded && this.isContinue && (userUtility.hasPermission('Cancel Wizard')
      || this.createdByMe()
      || this.isLockedToMe());
  }
}
