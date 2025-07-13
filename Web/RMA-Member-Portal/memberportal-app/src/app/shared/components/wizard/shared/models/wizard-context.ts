import { Wizard } from './wizard';
import { WizardComponentInterface } from '../../sdk/wizard-component.interface';
import { SaveWizardRequest } from './save-wizard-request';
import { WizardComponentStep } from '../../sdk/wizard-component-step';
import { ComponentFactoryResolver } from '@angular/core';
import { WizardStatus } from './wizard-status.enum';

export abstract class WizardContext {
  data: any[];
  currentData: any;
  name: string;
  addPermission: string;
  editPermission: string;
  viewPermission: string;

  public stepComponents: WizardComponentInterface[];
  public wizardComponents: WizardComponentStep[] = [];
  public wizard: Wizard;
  abstract backLink: string;
  public breadcrumbModule = '';
  public breadcrumbTitle = '';

  abstract formatData(): void;
  abstract onApprovalRequested(): void;

  constructor(private readonly componentFactoryResolver: ComponentFactoryResolver) {
  }

  createComponent(name: string): any {
    const wizardComponent = this.wizardComponents.find(component => component.name.toLowerCase() === name.toLowerCase());
    if (wizardComponent == null) { throw new Error(`Could not find step component '${name}'`); }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(wizardComponent.componentType);
    return componentFactory;
  }

  getDataByName(name: string): any {
    const component = this.stepComponents.find((child) => child.firstName === name);
    if (component == null) { return null; }

    const stepNumber = parseInt(component.step, 10);
    if (stepNumber == null) { return null; }

    return this.data[stepNumber];
  }

  createSaveWizardRequest(): SaveWizardRequest {
    const saveWizardRequest = new SaveWizardRequest();
    saveWizardRequest.wizardId = this.wizard.id;
    saveWizardRequest.currentStep = this.wizard.currentStepIndex;
    saveWizardRequest.data = JSON.stringify(this.data);
    saveWizardRequest.wizardName = this.wizard.name;
    return saveWizardRequest;
  }

  setComponentPermissions(component: any) {
  }

  getActiveWizardComponents(): WizardComponentStep[] {
    return this.wizardComponents.filter(c => !c.isApprovalStep || (c.isApprovalStep && this.wizard.wizardStatusId === WizardStatus.AwaitingApproval &&
      this.wizard.canApprove && this.wizard.wizardConfiguration.allowEditOnApproval));
  }

  getActiveStepCount(): number {
    const activeSteps = this.getActiveWizardComponents();
    return activeSteps.length;
  }

  get hasApprovalStep(): boolean {
    return this.getActiveWizardComponents().filter(c => c.isApprovalStep).length > 0 && this.wizard.canApprove && this.wizard.wizardStatusId === WizardStatus.AwaitingApproval && this.wizard.wizardConfiguration.allowEditOnApproval;
  }
}
