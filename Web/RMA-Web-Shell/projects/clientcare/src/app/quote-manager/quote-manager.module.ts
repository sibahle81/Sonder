import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AuditLogService } from 'projects/shared-components-lib/src/lib/audit/audit-log.service';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { QuoteManagerRoutingModule } from './quote-manager-routing.module';
import { QuoteHomeComponent } from './views/quote-home/quote-home.component';
import { QuoteLayoutComponent } from './views/quote-layout/quote-layout.component';
import { QuoteSearchComponent } from './views/quote-search/quote-search.component';
import { ProductService } from './../product-manager/services/product.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { RMAQuotationWizard } from './wizards/rma-quotation-wizard';
import { RMLQuotationWizard } from './wizards/rml-quotation-wizard';
import { RmaRmlQuoteDetailsComponent } from './wizards/views/rma-rml-quote-details/rma-rml-quote-details.component';
import { RmaQuotePreviewComponent } from './wizards/views/rma-quote-preview/rma-quote-preview.component';
import { RmlQuotePreviewComponent } from './wizards/views/rml-quote-preview/rml-quote-preview.component';
import { RmaRmlQuoteDetailsCaptureComponent } from './wizards/views/rma-rml-quote-details/rma-rml-quote-details-capture/rma-rml-quote-details-capture.component';
import { LeadManagerModule } from '../lead-manager/lead-manager.module';
import { QuoteReportsComponent } from './views/quote-reports/quote-reports.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { QuoteViewComponent } from './views/quote-view/quote-view.component';

@NgModule({
    imports: [
        QuoteManagerRoutingModule,
        WizardModule,
        FrameworkModule,
        SharedModule,
        MatTooltipModule,
        ClientCareSharedModule,
        LeadManagerModule,
        SharedComponentsLibModule
    ],
    declarations: [
        QuoteHomeComponent,
        QuoteLayoutComponent,
        QuoteSearchComponent,
        RmaRmlQuoteDetailsComponent,
        RmaQuotePreviewComponent,
        RmlQuotePreviewComponent,
        RmaRmlQuoteDetailsCaptureComponent,
        QuoteReportsComponent,
        QuoteViewComponent
    ],
    exports: [ ],
    entryComponents: [
        QuoteReportsComponent
    ],
    providers: [
        AuthService,
        RequiredDocumentService,
        AuditLogService,
        ProductService
    ]
})
export class QuoteManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
        contextFactory.addWizardContext(new RMAQuotationWizard(componentFactoryResolver), 'rma-quotation');
        contextFactory.addWizardContext(new RMLQuotationWizard(componentFactoryResolver), 'rml-quotation');
    }
}
