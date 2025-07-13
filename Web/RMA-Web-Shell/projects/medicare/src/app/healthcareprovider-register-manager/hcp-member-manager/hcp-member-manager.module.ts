import { DatePipe } from '@angular/common';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { HCPMemberManagerRoutingModule } from './hcp-member-manager-routing.module';
import { HCPMemberModule } from '../hcp-member/hcp-member.module';
import { HCPMemberHomeComponent } from './views/hcp-member-home/hcp-member-home.component';
import { HCPMemberLayoutComponent } from './views/hcp-member-layout/hcp-member-layout.component';
import { HCPMemberUserAdministrationComponent } from './views/hcp-member-user-administration/hcp-member-user-administration.component';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { HealthcareProviderRegistrationWizard } from './wizards/healthcare-provider-registration/healthcare-provider-registration-wizard';
import { HealthcareProviderRegistrationComponent } from './wizards/healthcare-provider-registration/steps/healthcare-provider-registration.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { CaptureNewHealthcareProviderComponent } from './wizards/healthcare-provider-registration/capture-new-healthcare-provider-component/capture-new-healthcare-provider-component';
import { HealthcareProviderUpdateDemographicsComponent } from './wizards/healthcare-provider-registration/steps/healthcare-provider-update-demographics.component';
import { HealthcareProviderBankingDetailsComponent } from './wizards/healthcare-provider-registration/steps/healthcare-provider-banking-details.component';
import { HealthcareProviderUpdateDemographicsWizard } from './wizards/healthcare-provider-registration/healthcare-provider-update-demographics-wizard';
import { HealthcareProviderBankingDetailsWizard } from './wizards/healthcare-provider-registration/healthcare-provider-update-banking-details-wizard';

@NgModule({
    imports: [
        MaterialsModule,
        FrameworkModule,
        HCPMemberManagerRoutingModule,
        SharedModule,
        HCPMemberModule,
        ClientCareSharedModule,//important for using selectors inside hcp-member-view
        SharedComponentsLibModule,
    ],
    declarations: [
        HCPMemberHomeComponent,
        HCPMemberLayoutComponent,
        HCPMemberUserAdministrationComponent,
        HealthcareProviderRegistrationComponent,
        CaptureNewHealthcareProviderComponent,
        HealthcareProviderUpdateDemographicsComponent,
        HealthcareProviderBankingDetailsComponent
    ],
    exports: [

    ],
    providers: [
        SharedServicesLibModule,
        DatePipe,
    ],
    bootstrap: [],
})
export class HCPMemberManagerModule {

    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
        contextFactory.addWizardContext(new HealthcareProviderRegistrationWizard(componentFactoryResolver), 'healthcare-provider-registration');
        contextFactory.addWizardContext(new HealthcareProviderUpdateDemographicsWizard(componentFactoryResolver), 'update-healthcare-provider-demographics');
        contextFactory.addWizardContext(new HealthcareProviderBankingDetailsWizard(componentFactoryResolver), 'update-healthcare-provider-banking-details');
    }
}
