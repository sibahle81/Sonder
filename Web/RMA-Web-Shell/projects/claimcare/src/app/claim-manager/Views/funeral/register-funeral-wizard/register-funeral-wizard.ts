import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { AdditionalRegistryDetailsComponent } from '../additional-registry-details/additional-registry-details.component';
import { BodyCollectionComponent } from '../body-collection/body-collection.component';
import { InformantComponent } from '../informant/informant.component';
import { MedicalPractitionerComponent } from '../medical-practitioner/medical-practitioner.component';
import { ForensicPathologistComponent } from '../forensic-pathologist/forensic-pathologist.component';
import { FuneralParlorComponent } from '../funeral-parlor/funeral-parlor.component';
import { UndertakerComponent } from '../undertaker/undertaker.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { ClaimsDocumentsComponent } from '../claims-document/claims-document.component';
import { ClaimantComponent } from '../claimant/claimant.component';

@Injectable({
  providedIn: 'root'
})

export class RegisterFuneralWizard extends WizardContext {
  backLink = 'claimcare/claim-manager/claim-workpool';

  breadcrumbModule = 'Register Funeral';
  breadcrumbTitle = 'Funeral';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Deceased Details', AdditionalRegistryDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Claimant', ClaimantComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Informant', InformantComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Medical Practitioner', MedicalPractitionerComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Forensic Pathologist',  ForensicPathologistComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Funeral Parlour', FuneralParlorComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Undertaker', UndertakerComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Body Collector', BodyCollectionComponent));
    this.wizardComponents.push(new WizardComponentStep(8, 'Documents', ClaimsDocumentsComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const personEventTest = this.data[0] as PersonEventModel;
  }
}
