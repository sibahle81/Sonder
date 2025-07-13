import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicalInvoiceDetailsResolverService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-resolver.service';
import { MedicalInvoiceDetailsComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/wizards/medical-invoice/medical-invoice-details/medical-invoice-details.component';
import { MedicalInvoiceListComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-invoice-list/medical-invoice-list.component';
import { ViewMedicalInvoiceComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/view-medical-invoice/view-medical-invoice.component';
import { MedicalInvoiceSearchComponent } from './views/medical-invoice-search/medical-invoice-search.component';
import { InvoiceSwitchBatchSearchComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/invoice-switch-batch-search/invoice-switch-batch-search.component';
import { InvoiceSwitchBatchListComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/invoice-switch-batch-list/invoice-switch-batch-list.component';
import { InvoiceSwitchBatchViewDetailsComponent } from '../medi-manager/Views/shared/invoice-switch-batch-view-details/invoice-switch-batch-view-details.component';
import { MedicalInvoiceSwitchBatchViewDetailsResolverService } from './services/medicare-medical-invoice-switch-batch-view-details-resolver.service';
import { InvoiceSwitchBatchUnprocessedMilistComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/invoice-switch-batch-unprocessed-milist/invoice-switch-batch-unprocessed-milist.component';
import { ViewPaymentBreakdownComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/view-payment-breakdown/view-payment-breakdown.component';
import { MedicalInvoiceUnderPaymentAndNonPaymentComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-invoice-under-payment-and-non-payment/medical-invoice-under-payment-and-non-payment.component';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { SearchMedicalInvoiceComponent } from '../shared/components/search-medical-invoice/search-medical-invoice.component';
import { MedicarePersonSearchComponent } from '../shared/components/medicare-person-search/medicare-person-search.component';
import { MedicalTariffComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/medical-tariff/medical-tariff.component';
import { RecallMedicalPaymentComponent } from './views/recall-medical-payment/recall-medical-payment.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { TebaInvoiceCaptureDetailsComponent } from '../medi-manager/Views/shared/wizards/teba-invoice-capture-details/teba-invoice-capture-details.component';
import { InvoiceClaimSearchComponent } from '../medi-manager/Views/shared/invoice-claim-search/invoice-claim-search.component';

const routes: Routes = [

  {
    path: 'medical-invoice-details',
    component: MedicalInvoiceDetailsComponent,
    canActivate: [PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Medical invoice manager view'] },
    children: [
      { path: 'capture-medical-invoice', component: InvoiceClaimSearchComponent, data: { title: 'Capture Medical Invoice' } },
      { path: 'edit-medical-invoice', component: InvoiceClaimSearchComponent, data: { title: 'Edit Medical Invoice' } }
    ],
  },
  {
    path: 'medical-invoice-list',
    component: MedicalInvoiceListComponent
  },

  {
    path: 'medical-invoice-search',
    component: MedicalInvoiceSearchComponent
  },
  {
    path: 'invoice-switch-batch-unprocessed-milist',
    component: InvoiceSwitchBatchUnprocessedMilistComponent
  },

  {
    path: 'medical-invoice-under-payment-and-non-payment',
    component: MedicalInvoiceUnderPaymentAndNonPaymentComponent
  },
  {
    path: 'medicare-person-search',
    component: MedicarePersonSearchComponent
  },
  {
    path: 'search-medical-invoices',
    component: SearchMedicalInvoiceComponent
  },
  {
    path: 'recall-medical-invoice-payments',
    component: RecallMedicalPaymentComponent
  },
  {
    path: 'medical-tariff',
    component: MedicalTariffComponent
  },
  {
    path: 'teba-invoice-capture-details',
    component: TebaInvoiceCaptureDetailsComponent
  },
  {
    path: 'view-medical-invoice/:id/:switchBatchType',
    component: ViewMedicalInvoiceComponent,
    resolve: { medicalInvoiceDetails: MedicalInvoiceDetailsResolverService }
  },
  {
    path: 'invoice-switch-batch-view-details/:id/:switchBatchType',
    component: InvoiceSwitchBatchViewDetailsComponent,
    resolve: { switchBatchInvoicesDetails: MedicalInvoiceSwitchBatchViewDetailsResolverService }
  },
  {
    path: 'view-payment-breakdown/:id/:switchBatchType',
    component: ViewPaymentBreakdownComponent,
    resolve: { medicalInvoiceDetails: MedicalInvoiceDetailsResolverService }
  },
  {
    path: 'edit-medical-invoice/:id',
    component: MedicalInvoiceDetailsComponent,
    resolve: { medicalInvoiceDetails: MedicalInvoiceDetailsResolverService }
  },
  {
    path: 'invoice-switch-batch-search/:switchBatchType',
    component: InvoiceSwitchBatchSearchComponent
  },
  {
    path: 'invoice-switch-batch-list/:switchBatchType',
    component: InvoiceSwitchBatchListComponent
  },
  { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },//required for wizard routing
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalInvoiceManagerRoutingModule { }
