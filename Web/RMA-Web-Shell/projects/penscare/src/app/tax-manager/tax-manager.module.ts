import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaxManagerLayoutComponent } from './views/tax-manager-layout/tax-manager-layout.component';
import { TaxRebatesComponent } from './views/tax-rebates/tax-rebates.component';
import { TaxManagerRoutingModule } from './tax-manager-routing.module';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { TaxRatesComponent } from './views/tax-rates/tax-rates.component';
import { TaxItemsListComponent } from './views/wizards/tax-rates-wizard/tax-items-list/tax-items-list.component';
import { TaxItemComponent } from './views/wizards/tax-rates-wizard/tax-item/tax-item.component';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { TaxRatesFormWizardContext } from './views/wizards/tax-rates-form-wizard';
import { TaxManagerOverviewComponent } from './views/tax-manager-overview/tax-manager-overview.component';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { TaxRebatesFormWizardContext } from './views/wizards/tax-rebates-form-wizard';
import { TaxRebatesFormComponent } from './views/wizards/tax-rebates-wizard/tax-rebates-form/tax-rebates-form.component';
import { TaxRateNotesComponent } from './views/wizards/tax-rates-wizard/tax-rate-notes/tax-rate-notes.component';
import { SharedPenscareModule } from '../shared-penscare/shared-penscare.module';
import { TaxRebatesNotesComponent } from './views/wizards/tax-rebates-wizard/tax-rebates-notes/tax-rebates-notes.component';
import { TaxRatesViewComponent } from './views/tax-rates/tax-rates-view/tax-rates-view.component';
import { PensionTaxService } from './services/pension-tax.service';
import { AdditionalTaxFormComponent } from './views/additional-tax-form/additional-tax-form.component';
import { AdditionalTaxWizardComponent } from './views/wizards/additional-tax-wizard/additional-tax-wizard.component';
import { AdditionalTaxWizardContext } from './views/wizards/additional-tax-wizard';

@NgModule({
  declarations: [
    TaxManagerLayoutComponent,
    TaxRebatesComponent,
    TaxRatesComponent,
    TaxItemsListComponent,
    TaxItemComponent,
    TaxManagerOverviewComponent,
    TaxRebatesFormComponent,
    TaxRateNotesComponent,
    TaxRebatesNotesComponent,
    TaxRatesViewComponent,
    AdditionalTaxFormComponent,
    AdditionalTaxWizardComponent
  ],
  imports: [
    CommonModule,
    TaxManagerRoutingModule,
    FrameworkModule,
    SharedModule,
    WizardModule,
    MatTooltipModule,
    SharedPenscareModule,
  ],
  providers: [
    SharedServicesLibModule,
    DatePipe,
    PensionTaxService
  ],
  exports: [
    AdditionalTaxFormComponent,
  ]
})
export class TaxManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    contextFactory: WizardContextFactory) {
    // register the context factories used in the wizard controls
    contextFactory.addWizardContext(new TaxRatesFormWizardContext(componentFactoryResolver), 'tax-rates');
    contextFactory.addWizardContext(new TaxRebatesFormWizardContext(componentFactoryResolver), 'tax-rebates');
    contextFactory.addWizardContext(new AdditionalTaxWizardContext(componentFactoryResolver), 'additional-tax-wizard');
  }
}
