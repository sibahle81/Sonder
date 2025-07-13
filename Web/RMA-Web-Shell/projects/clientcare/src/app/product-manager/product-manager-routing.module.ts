import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenefitListComponent } from './views/benefit-list/benefit-list.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { ProductLayoutComponent } from './views/product-layout/product-layout.component';
import { ProductListComponent } from './views/product-list/product-list.component';
import { ProductViewComponent } from './views/product-view/product-view.component';
import { BenefitViewComponent } from './views/benefit-view/benefit-view.component';
import { ProductOptionViewComponent } from './views/product-option-view/product-option-view.component';
import { ProductOptionListComponent } from './views/product-option-list/product-option-list.component';
import { ProductHomeComponent } from './views/product-home/product-home.component';
import { ProductReportComponent } from './views/product-report/product-report-view.component';
import { BenefitUploadComponent } from './views/benefit-upload/benefit-upload.component';
import { BenefitImportComponent } from './views/benefit-import/benefit-import.component';
import { BenefitUploadErrorAuditComponent } from './views/benefit-upload-error-audit/benefit-upload-error-audit.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
    {
        path: '', component: ProductLayoutComponent, 
        canActivate: [SignInGuard, PermissionGuard], 
        canActivateChild: [PermissionGuard],
        data: { title: 'Product Manager', permissions: ['Product manager view']},
        children: [
            { path: '', component: ProductHomeComponent, data: { title: 'Product Manager' } },

            { path: 'product-list', component: ProductListComponent, data: { title: 'Products', group: 2, permissions: ['View Product'] }, canActivate: [SignInGuard] },
            { path: 'product-details/:id', component: ProductViewComponent, data: { title: 'Product Details', group: 1, permissions: ['View Product'] }, canActivate: [SignInGuard] },

            { path: 'benefit-list', component: BenefitListComponent, data: { title: 'Benefits', group: 2 , permissions: ['View Benefit']} },
            { path: 'benefit-upload', component: BenefitUploadComponent, data: { title: 'Upload', group: 2 , permissions: ['View Benefit']} },
            { path: 'benefit-upload-error-audit', component: BenefitUploadErrorAuditComponent, data: { title: 'Error Audit', group: 2 , permissions: ['View Benefit']} },
            { path: 'benefit-details/:id', component: BenefitViewComponent, data: { title: 'Benefit Details', group: 2 , permissions: ['View Benefit']}, canActivate: [SignInGuard] },
            { path: 'benefit-import', component: BenefitImportComponent, data: { title: 'Import', group: 2, permission: ['View Benefit']}, canActivate: [SignInGuard] },
            { path: 'product-option-list', component: ProductOptionListComponent, data: { title: 'Product Options', group: 3, permissions: ['View Product Option'] }, canActivate: [SignInGuard] },
            { path: 'product-option/:id', component: ProductOptionViewComponent, data: { title: 'Product Option Details', group: 3, permissions: ['View Product Option'] }, canActivate: [SignInGuard] },

            { path: 'product/:type/:action/:linkedId', component: WizardHostComponent, data: { permissions: ['View Product'] }, canActivate: [SignInGuard] },
            { path: 'benefit/:type/:action/:linkedId', component: WizardHostComponent, data: { permissions: ['View Benefit'] }, canActivate: [SignInGuard] },
            { path: 'product-option/:type/:action/:linkedId', component: WizardHostComponent, data: { permissions: ['View Product Option'] }, canActivate: [SignInGuard] },

            { path: 'product-report/:id', component: ProductReportComponent, data: { title: 'Report', group: 2, permissions: ['View Product'] }, canActivate: [SignInGuard] },
            { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
        ]
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductManagerRoutingModule { }
