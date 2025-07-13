import { ComponentFactoryResolver, OnInit } from '@angular/core';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreAuthClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { PreAuthCaptureComponent } from '../preauth-capture/preauth-capture.component';
import { TreatingDoctorPreauthComponent } from 'projects/medicare/src/app/medi-manager/views/shared/treating-doctor-preauth/treating-doctor-preauth.component';
import { HealthcareProviderAccessRights } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider-access-rights';
import { isNullOrUndefined } from 'util';
import { PreAuthorisation } from '../../../models/preauthorisation';

export class PreAuthFormWizardContext extends WizardContext {
  backLink = 'medicare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.getHealthcareProviderPreAuthAccess();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;
    this.wizard.currentStepIndex = 1;
    this.wizard.currentStep = "Step 1";
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }

  getHealthcareProviderPreAuthAccess() {
    
    let healthcareProviderPreAuthAccessRights = new HealthcareProviderAccessRights();
    let healthcareProviderPreAuthAccessRightsJSON = sessionStorage.getItem('healthcareProviderPreAuthAccessRights');
    if(!isNullOrUndefined(healthcareProviderPreAuthAccessRightsJSON)){
      healthcareProviderPreAuthAccessRights = JSON.parse(healthcareProviderPreAuthAccessRightsJSON) as HealthcareProviderAccessRights;
    }
    if(healthcareProviderPreAuthAccessRights.canCaptureHospital || healthcareProviderPreAuthAccessRights.canCaptureTreatingDoctor){
      this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', PreAuthClaimSearchComponent));
      this.wizardComponents.push(new WizardComponentStep(1, 'Health care provider', HealthCareProviderSearchComponent));
      this.wizardComponents.push(new WizardComponentStep(2, 'Capture authorisation details', PreAuthCaptureComponent));
      this.wizardComponents.push(new WizardComponentStep(3, 'Capture ICD10 codes', PreAuthDiagnosisComponent));
      this.wizardComponents.push(new WizardComponentStep(4, 'Preauthorisation breakdown', PreauthBreakdownComponent));
      this.wizardComponents.push(new WizardComponentStep(5, 'Treating doctor authorisation', TreatingDoctorPreauthComponent));
    }
    else{
      this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', PreAuthClaimSearchComponent));
      this.wizardComponents.push(new WizardComponentStep(1, 'Health care provider', HealthCareProviderSearchComponent));
      this.wizardComponents.push(new WizardComponentStep(2, 'Capture authorisation details', PreAuthCaptureComponent));
      this.wizardComponents.push(new WizardComponentStep(3, 'Capture ICD10 codes', PreAuthDiagnosisComponent));
      this.wizardComponents.push(new WizardComponentStep(4, 'Preauthorisation breakdown', PreauthBreakdownComponent));
      this.wizardComponents.push(new WizardComponentStep(5, 'Treating doctor authorisation', TreatingDoctorPreauthComponent));
    }
  }
}