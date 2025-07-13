import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProductManagerRoutingModule } from './product-manager-routing.module';
import { BenefitListComponent } from './views/benefit-list/benefit-list.component';
import { BenefitDetailsComponent } from './views/benefit-details/benefit-details.component';
import { BenefitLastViewedListComponent } from './views/benefit-last-viewed-list/benefit-last-viewed-list.component';
import { BenefitLastViewedListDataSource } from './datasources/benefit-last-viewed-list.datasource';
import { ProductListComponent } from './views/product-list/product-list.component';
import { ProductDetailsComponent } from './views/product-details/product-details.component';
import { ProductOptionListComponent } from './views/product-option-list/product-option-list.component';
import { ProductOptionListDataSource } from './datasources/product-option-list.datasource';
import { ProductOptionDetailComponent } from './views/product-option-details/product-option-detail.component';
import { ProductLastViewedListComponent } from './views/product-last-viewed-list/product-last-viewed-list.component';
import { ProductLastViewedListDataSource } from './datasources/product-last-viewed-list.datasource';
import { DiscountTypeComponent } from './views/discount-type-details/discount-type-details.component';
import { DiscountTypeLastViewedListDataSource } from './views/discount-type-last-viewed/discount-type-last-viewed-list.datasource';
import { SearchModule } from '../shared/search/search.module';
import { FrameworkModule } from 'src/app/framework.module';
import { ProductHomeComponent } from './views/product-home/product-home.component';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { BenefitWizard } from './wizards/benefit-wizard';
import { ProductWizard } from './wizards/product-wizard';
import { ProductLayoutComponent } from './views/product-layout/product-layout.component';
import { DiscountTypeLastViewedListComponent } from './views/discount-type-last-viewed-list/discount-type-last-viewed-list.component';
import { ProductService } from './services/product.service';
import { DiscountTypeService } from './services/discount-type.service';
import { BreadcrumbProductService } from './services/breadcrumb-product.service';
import { UnderwriterService } from './services/underwriter.service';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { ProductOptionSearchComponent } from './views/product-option-search/product-option-search.component';
import { BenefitSearchComponent } from './views/benefit-search/benefit-search.component';
import { DiscountTypeListComponent } from './views/discount-type-list/discount-type-list.component';
import { DiscountTypeSearchComponent } from './views/discount-type-search/discount-type-search.component';
import { ProductSearchComponent } from './views/product-search/product-search.component';
import { ProductOptionLastViewedListComponent } from './views/product-option-last-viewed-list/product-option-last-viewed-list.component';
import { ProductViewComponent } from './views/product-view/product-view.component';
import { ProductNotesComponent } from './views/product-notes/product-notes.component';
import { BenefitNotesComponent } from './views/benefit-notes/benefit-notes.component';
import { BenefitViewComponent } from './views/benefit-view/benefit-view.component';
import { ProductOptionViewComponent } from './views/product-option-view/product-option-view.component';
import { ProductOptionNotesComponent } from './views/product-option-notes/product-option-notes.component';
import { ProductOptionLastViewedListDataSource } from './datasources/product-option-last-viewed-list.datasource';
import { ProductOptionBenefitsComponent } from './views/product-option-benefits/product-option-benefits.component';
import { ProductOptionWizard } from './wizards/product-option-wizard';
import { BenefitService } from './services/benefit.service';
import { ProductRulesComponent } from './views/product-rules/product-rules.component';
import { ProductOptionRulesComponent } from './views/product-option-rules/product-option-rules.component';
import { BenefitRulesComponent } from './views/benefit-rules/benefit-rules.component';
import { ProductDocumentsComponent } from './views/product-documents/product-documents.component';
import { ProductOptionDocumentsComponent } from './views/product-option-documents/product-option-documents.component';
import { BenefitDocumentsComponent } from './views/benefit-documents/benefit-documents.component';
import { ProductSummaryComponent } from './views/product-summary/product-summary.component';
import { ProductReportComponent } from './views/product-report/product-report-view.component';
import { ProductOptionSummaryComponent } from './views/product-option-summary/product-option-summary.component';
import { BenefitSummaryComponent } from './views/benefit-summary/benefit-summary.component';
import { ProductOptionSettingsWizardComponent } from './views/product-option-settings-wizard/product-option-settings-wizard.component';
import { BenefitUploadComponent } from './views/benefit-upload/benefit-upload.component';
import { BenefitUploadErrorAuditComponent } from './views/benefit-upload-error-audit/benefit-upload-error-audit.component';
import { BenefitImportComponent } from './views/benefit-import/benefit-import.component';

@NgModule({
    imports: [
        FrameworkModule,
        ProductManagerRoutingModule,
        SearchModule,
        ClientCareSharedModule,
        WizardModule
    ],
    declarations: [
        BenefitDetailsComponent,
        BenefitLastViewedListComponent,
        BenefitListComponent,
        BenefitSearchComponent,
        DiscountTypeComponent,
        DiscountTypeLastViewedListComponent,
        DiscountTypeListComponent,
        DiscountTypeSearchComponent,
        ProductDetailsComponent,
        ProductHomeComponent,
        ProductLastViewedListComponent,
        ProductLayoutComponent,
        ProductListComponent,
        ProductSearchComponent,
        ProductOptionDetailComponent,
        ProductOptionListComponent,
        ProductOptionLastViewedListComponent,
        ProductOptionSearchComponent,
        ProductViewComponent,
        ProductNotesComponent,
        BenefitViewComponent,
        BenefitNotesComponent,
        ProductOptionViewComponent,
        ProductOptionNotesComponent,
        ProductOptionBenefitsComponent,
        ProductRulesComponent,
        ProductOptionRulesComponent,
        BenefitRulesComponent,
        ProductDocumentsComponent,
        BenefitDocumentsComponent,
        ProductOptionDocumentsComponent,
        ProductReportComponent,
        ProductSummaryComponent,
        ProductOptionSummaryComponent,
        BenefitSummaryComponent,
        ProductOptionSettingsWizardComponent,
        BenefitUploadComponent,
        BenefitUploadErrorAuditComponent,
        BenefitImportComponent,
    ],
    exports: [],
    entryComponents: [
        ProductDetailsComponent,
        ProductNotesComponent,
        BenefitDetailsComponent,
        BenefitNotesComponent,
        ProductOptionDetailComponent,
        ProductOptionNotesComponent,
        ProductOptionBenefitsComponent,
        ProductRulesComponent,
        ProductOptionRulesComponent,
        BenefitRulesComponent,
        ProductDocumentsComponent,
        BenefitDocumentsComponent,
        ProductOptionDocumentsComponent,
        ProductSummaryComponent,
        ProductReportComponent,
        ProductOptionSummaryComponent,
        BenefitSummaryComponent,
    ],
    providers: [
        BenefitLastViewedListDataSource,
        BenefitService,
        BreadcrumbProductService,
        DiscountTypeLastViewedListDataSource,
        DiscountTypeService,
        ProductLastViewedListDataSource,
        ProductOptionListDataSource,
        ProductService,
        RuleService,
        SharedServicesLibModule,
        UnderwriterService,
        ProductOptionLastViewedListDataSource,
        DecimalPipe
    ],
    bootstrap: []
})
export class ProductManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver,
        wizardContextFactory: WizardContextFactory) {
        wizardContextFactory.addWizardContext(new BenefitWizard(componentFactoryResolver), 'benefit');
        wizardContextFactory.addWizardContext(new ProductWizard(componentFactoryResolver), 'product');
        wizardContextFactory.addWizardContext(new ProductOptionWizard(componentFactoryResolver), 'product-option');
    }
}
