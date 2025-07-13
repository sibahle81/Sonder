import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component'
import { SearchPensionCaseComponent } from '../../search-pension-case/search-pension-case.component';
import { PMPScheduleDetailsComponent } from '../../pmp-schedule-details/pmp-schedule-details.component';
import { PMPVisitDetailsComponent } from '../../pmp-visit-details/pmp-visit-details.component';

@Injectable({
    providedIn: 'root'
  })
  
export class PMPScheduleWizard extends WizardContext  {
  backLink = 'medicare/work-manager';  

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.pmpScheduleWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }

  pmpScheduleWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'PMP Schedule Details', PMPScheduleDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'PMP Visit Details', PMPVisitDetailsComponent));
  }

}
