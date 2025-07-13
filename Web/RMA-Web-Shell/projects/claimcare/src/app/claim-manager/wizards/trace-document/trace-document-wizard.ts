import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { TraceDocumentComponent } from './trace-document/trace-document.component';
import { TraceDocumentModel } from '../../shared/entities/trace-document-model';

@Injectable({
  providedIn: 'root'
})

export class TraceDocumentWizard extends WizardContext {
  backLink: string;

  breadcrumbModule = 'Trace Document';
  breadcrumbTitle = 'Trace Document';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(2, 'Trace Document', TraceDocumentComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const claimantRecovery = this.data[0] as TraceDocumentModel;
    this.backLink = `claimcare/claim-manager/claim-workpool`;
  }
}
