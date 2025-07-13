import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChildExtensionManagerRoutingModule } from './child-extension-manager-routing.module';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { ChildExtensionManagerOverviewComponent } from './views/child-extension-manager-overview/child-extension-manager-overview.component';
import { ChildExtensionManagerLayoutComponent } from './views/child-extension-manager-layout/child-extension-manager-layout.component';
import { ChildToAdultListComponent } from './views/child-to-adult-list/child-to-adult-list.component';
import { ChildExtensionListComponent } from './views/child-extension-list/child-extension-list.component';

import { ChildExtensionRecipientComponent } from './wizards/child-extension-wizard/child-extension-recipient/child-extension-recipient.component';
import { ChildExtensionBeneficiaryComponent } from './wizards/child-extension-wizard/child-extension-beneficiary/child-extension-beneficiary.component';
import { ChildExtensionWizardContext } from './wizards/child-extension.wizard';
import { SharedPenscareModule } from '../shared-penscare/shared-penscare.module';
import { ChildExtensionDocumentsComponent } from './wizards/child-extension-wizard/child-extension-documents/child-extension-documents.component';
import { ChildExtensionNotesComponent } from './wizards/child-extension-wizard/child-extension-notes/child-extension-notes.component';
import { ChildExtensionViewComponent } from './views/child-extension-view/child-extension-view.component';
import { ChildExtensionBeneficiaryTabComponent } from './views/child-extension-view/child-extension-beneficiary-tab/child-extension-beneficiary-tab.component';
import { ChildExtensionRecipientTabComponent } from './views/child-extension-view/child-extension-recipient-tab/child-extension-recipient-tab.component';
@NgModule({
  declarations: [
    ChildExtensionManagerOverviewComponent,
    ChildExtensionManagerLayoutComponent,
    ChildToAdultListComponent,
    ChildExtensionRecipientComponent,
    ChildExtensionBeneficiaryComponent,
    ChildExtensionListComponent,
    ChildExtensionDocumentsComponent,
    ChildExtensionNotesComponent,
    ChildExtensionViewComponent,
    ChildExtensionBeneficiaryTabComponent,
    ChildExtensionRecipientTabComponent
  ],
  imports: [
    CommonModule,
    ChildExtensionManagerRoutingModule,
    FrameworkModule,
    SharedModule,
    WizardModule,
    SharedPenscareModule
  ],
  providers: [
    SharedServicesLibModule,
    DatePipe
  ]
})
export class ChildExtensionManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    contextFactory: WizardContextFactory) {
    contextFactory.addWizardContext(new ChildExtensionWizardContext(componentFactoryResolver), 'child-extension');
    // contextFactory.addWizardContext(new TaxRebatesFormWizardContext(componentFactoryResolver), 'tax-rebates');
  }
}
