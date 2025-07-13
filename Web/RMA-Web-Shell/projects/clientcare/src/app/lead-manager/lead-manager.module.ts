import { RequiredDocumentService } from './../../../../admin/src/app/configuration-manager/shared/required-document.service';
import { LeadService } from './services/lead.service';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { LeadManagerRoutingModule } from './lead-manager-routing.module';
import { LeadsHomeComponent } from './views/leads-home/leads-home.component';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LeadsLayoutComponent } from './views/leads-layout/leads-layout.component';
import { AuditLogService } from 'projects/shared-components-lib/src/lib/audit/audit-log.service';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { CommissionBandService } from 'projects/admin/src/app/configuration-manager/shared/commission-band.service';
import { LeadCompanyComponent } from './views/leads-holistic/lead-company/lead-company.component';
import { LeadViewComponent } from './views/leads-holistic/lead-view.component';
import { LeadDetailsComponent } from './views/leads-holistic/lead-details/lead-details.component';
import { LeadNoteComponent } from './views/leads-holistic/lead-note/lead-note.component';
import { LeadNoteDataSource } from './views/leads-holistic/lead-note/lead-note.datasource';
import { LeadAddressDataSource } from './views/leads-holistic/lead-address/lead-address.datasource';
import { LeadAddressComponent } from './views/leads-holistic/lead-address/lead-address.component';
import { LeadQuotesComponent } from './views/leads-holistic/lead-quotes/lead-quotes.component';
import { LeadQuotesDataSource } from './views/leads-holistic/lead-quotes/lead-quotes.datasource';
import { LeadReportsComponent } from './views/lead-reports/lead-reports.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { BulkLeadUploadComponent } from './views/bulk-lead-upload/bulk-lead-upload.component';

@NgModule({
  imports: [
    LeadManagerRoutingModule,
    FrameworkModule,
    ClientCareSharedModule,
    WizardModule,
    MaterialsModule,
    SharedComponentsLibModule
  ],
  declarations: [
    LeadsHomeComponent,
    LeadsLayoutComponent,
    LeadViewComponent,
    LeadDetailsComponent,
    LeadCompanyComponent,
    LeadNoteComponent,
    LeadAddressComponent,
    LeadQuotesComponent,
    LeadReportsComponent,
    BulkLeadUploadComponent
  ],
  exports: [
    LeadViewComponent,
    LeadReportsComponent,
  ],
  entryComponents: [
  ],
  providers: [
    AuthService,
    LeadService,
    RequiredDocumentService,
    AuditLogService,
    CommissionBandService,
    LeadNoteDataSource,
    LeadAddressDataSource,
    LeadQuotesDataSource
  ]
})
export class LeadManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver,
    wizardContextFactory: WizardContextFactory) {
  }
}
