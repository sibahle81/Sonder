import { CommonModule, CurrencyPipe } from '@angular/common';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { MedicalInvoiceWizardContext } from 'projects/medicare/src/app/medical-invoice-manager/views/wizards/medical-invoice-wizard';
import { MedicalInvoiceManagerRoutingModule } from 'projects/medicare/src/app/medical-invoice-manager/medical-invoice-manager-routing.module';
import { MedicalInvoiceDetailsComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/wizards/medical-invoice/medical-invoice-details/medical-invoice-details.component';
import { MedicalInvoiceListComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-invoice-list/medical-invoice-list.component';
import { ViewMedicalInvoiceComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/view-medical-invoice/view-medical-invoice.component';
import { MedicalInvoiceDetailsResolverService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-resolver.service';
import { MedicalInvoiceSwitchBatchViewDetailsResolverService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch-view-details-resolver.service';
import { PreAuthManagerModule } from 'projects/medicare/src/app/preauth-manager/preauth-manager.module';
import { InvoiceClaimSearchComponent } from '../medi-manager/Views/shared/invoice-claim-search/invoice-claim-search.component';
import { PreauthViewModalComponent } from './modals/preauth-view-modal/preauth-view-modal.component';
import { InvoiceSwitchBatchDeleteReasonComponent } from './modals/invoice-switch-batch-delete-reason/invoice-switch-batch-delete-reason.component';
import { InvoiceSwitchBatchViewerModalComponent } from './modals/invoice-switch-batch-viewer-modal/invoice-switch-batch-viewer-modal.component';
import { MediManagerModule } from 'projects/medicare/src/app/medi-manager/medi-manager.module';
import { InvoiceSwitchBatchViewerComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-switch-batch/invoice-switch-batch-viewer/invoice-switch-batch-viewer.component';
import { InvoiceSwitchBatchSearchPevTableResultsComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-switch-batch/invoice-switch-batch-search-pev-table-results/invoice-switch-batch-search-pev-table-results.component';
import { PayeeTypeService } from 'projects/shared-services-lib/src/lib/services/payee-type/payee-type.service';
import { MedicalInvoiceAssessModalComponent } from './modals/medical-invoice-assess/medical-invoice-assess.component';
import { InvoiceSwitchBatchSearchPevModalComponent } from './modals/invoice-switch-batch-search-pev/invoice-switch-batch-search-pev.component';
import { InvoiceSwitchBatchAccidentPersonDetailsComponent } from './views/medical-switch-batch/invoice-switch-batch-accident-person-details/invoice-switch-batch-accident-person-details.component';
import { MedicalReportViewModalComponent } from './modals/medical-report-view-modal/medical-report-view-modal.component';
import { MedicalReportDetailsViewerComponent } from './views/medical-report-details-viewer/medical-report-details-viewer.component';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MedicalInvoiceSearchComponent } from './views/medical-invoice-search/medical-invoice-search.component';
import { MedicalInvoiceMenuComponent } from './views/medical-invoice-menu/medical-invoice-menu.component';
import { NotificationWizard } from 'projects/fincare/src/app/billing-manager/wizards/notification-wizard';
import { ViewPaymentBreakdownComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/view-payment-breakdown/view-payment-breakdown.component';
import { MedicalInvoiceUnderPaymentAndNonPaymentComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-invoice-under-payment-and-non-payment/medical-invoice-under-payment-and-non-payment.component';
import { MedicalInvoiceLinkedPreauthListComponent } from './views/medical-invoice-linked-preauth-list/medical-invoice-linked-preauth-list.component';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { InvoiceSwitchBatchReinstateReasonComponent } from './modals/invoice-switch-batch-reinstate-reason/invoice-switch-batch-reinstate-reason.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';
import { MedicareSearchMenusComponent } from '../shared/components/medicare-search-menus/medicare-search-menus.component';
import { UnderAssessReasonsViewerComponent } from '../shared/components/under-assess-reasons-viewer/under-assess-reasons-viewer.component';
import { InvoiceUnderAssessReasonsViewerModalComponent } from './modals/invoice-under-assess-reasons-viewer-modal/invoice-under-assess-reasons-viewer-modal.component';
import { ReportViewerModule } from 'projects/shared-components-lib/src/lib/report-viewers/reportviewer.module';
import { MedicalInvoiceRejectPendModalComponentComponent } from './modals/medical-invoice-reject-pend-modal-component/medical-invoice-reject-pend-modal-component.component';
import { RecallMedicalPaymentComponent } from './views/recall-medical-payment/recall-medical-payment.component';
import { MedicalInvoiceBreakdownDetailsComponent } from '../shared/components/medical-invoice-breakdown-details/medical-invoice-breakdown-details.component';
import { InvoicePayeeSearchModalComponent } from './modals/invoice-payee-search-modal/invoice-payee-search-modal.component';
import { MedicalInvoiceLineUnderAssessReasonColorPipe } from './pipes/medical-invoice-line-under-assess-reason-color.pipe';
import { MedicalInvoiceStatusColorPipe } from './pipes/medical-invoice-status-color.pipe';
import { MedicalInvoiceTotalsCalculationsPipe } from './pipes/medical-invoice-totals-calculations.pipe';
import { MedicalInvoiceValidationsPipe } from './pipes/medical-invoice-validations.pipe';
import { SwitchBatchInvoiceStatusColorPipe } from './pipes/switch-batch-invoice-status-color.pipe';
import { HolisticViewInvoicesComponent } from './views/holistic-view-invoices/holistic-view-invoices.component';
import { MedicalInvoiceAssesmentWizardContext } from './views/wizards/invoice-assessment-wizard';
import { InvoiceAssessmentDetailsComponent } from './views/invoice-assessment-details/invoice-assessment-details.component';
import { MedicalInvoiceQueryResponseComponent } from './views/wizards/medical-invoice/medical-invoice-query-response/medical-invoice-query-response.component';
import { MedicalInvoiceQueryResponseWizardContext } from './views/wizards/medical-invoice-query-response-wizard';

@NgModule({
  declarations: [
    MedicalInvoiceDetailsComponent,
    ViewMedicalInvoiceComponent,
    InvoiceClaimSearchComponent,
    PreauthViewModalComponent,
    InvoiceSwitchBatchDeleteReasonComponent,
    InvoiceSwitchBatchViewerModalComponent,
    InvoiceSwitchBatchViewerComponent,
    MedicalInvoiceAssessModalComponent,
    InvoiceSwitchBatchSearchPevModalComponent,
    InvoiceSwitchBatchSearchPevTableResultsComponent,
    InvoiceSwitchBatchAccidentPersonDetailsComponent,
    MedicalReportViewModalComponent,
    MedicalReportDetailsViewerComponent,
    MedicalInvoiceSearchComponent,
    MedicalInvoiceMenuComponent,
    ViewPaymentBreakdownComponent,
    MedicalInvoiceUnderPaymentAndNonPaymentComponent,
    MedicalInvoiceLinkedPreauthListComponent,
    InvoiceSwitchBatchReinstateReasonComponent,
    InvoiceUnderAssessReasonsViewerModalComponent,
    MedicalInvoiceRejectPendModalComponentComponent,
    RecallMedicalPaymentComponent,
    InvoicePayeeSearchModalComponent,
    HolisticViewInvoicesComponent,
    InvoiceAssessmentDetailsComponent,
    MedicalInvoiceQueryResponseComponent
  ],
  imports: [
    CommonModule,
    MedicalInvoiceManagerRoutingModule,
    PreAuthManagerModule,
    MediManagerModule,
    ReportViewerModule,
    ClaimCareSharedModule,
    SharedComponentsLibModule,
    //--Standalone components
    MedicalInvoiceLineUnderAssessReasonColorPipe,
    MedicalInvoiceStatusColorPipe,
    MedicalInvoiceTotalsCalculationsPipe,
    MedicalInvoiceValidationsPipe,
    SwitchBatchInvoiceStatusColorPipe,
    MedicareSearchMenusComponent,
    UnderAssessReasonsViewerComponent,
    MedicalInvoiceBreakdownDetailsComponent,
    MedicalInvoiceListComponent
  ],
  exports: [
    MedicalInvoiceDetailsComponent,
    ViewMedicalInvoiceComponent,
    InvoiceClaimSearchComponent,
    PreauthViewModalComponent,
    InvoiceSwitchBatchDeleteReasonComponent,
    InvoiceSwitchBatchViewerModalComponent,
    InvoiceSwitchBatchViewerComponent,
    MedicalInvoiceAssessModalComponent,
    InvoiceSwitchBatchSearchPevModalComponent,
    InvoiceSwitchBatchSearchPevTableResultsComponent,
    InvoiceSwitchBatchAccidentPersonDetailsComponent,
    MedicalReportViewModalComponent,
    MedicalReportDetailsViewerComponent,
    MedicalInvoiceSearchComponent,
    MedicalInvoiceMenuComponent,
    ViewPaymentBreakdownComponent,
    MedicalInvoiceUnderPaymentAndNonPaymentComponent,
    MedicalInvoiceLinkedPreauthListComponent,
    InvoiceSwitchBatchReinstateReasonComponent,
    InvoiceUnderAssessReasonsViewerModalComponent,
    MedicalInvoiceRejectPendModalComponentComponent,
    RecallMedicalPaymentComponent,
    InvoicePayeeSearchModalComponent,
    HolisticViewInvoicesComponent
  ],
  entryComponents: [
    PreauthViewModalComponent,
    InvoiceSwitchBatchDeleteReasonComponent,
    InvoiceSwitchBatchViewerModalComponent,
    MedicalInvoiceAssessModalComponent,
    InvoiceSwitchBatchViewerComponent,
    InvoiceSwitchBatchSearchPevModalComponent,
    InvoiceSwitchBatchSearchPevTableResultsComponent,
    MedicalReportViewModalComponent,
    InvoiceSwitchBatchReinstateReasonComponent,
    MedicalInvoiceBreakdownDetailsComponent,
    MedicalInvoiceListComponent,
    HolisticViewInvoicesComponent
  ],
  providers: [CurrencyPipe ,MedicalInvoiceDetailsResolverService, MedicalInvoiceSwitchBatchViewDetailsResolverService, PayeeTypeService, RolePlayerService]
})

export class MedicalInvoiceManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
    contextFactory.addWizardContext(new MedicalInvoiceWizardContext(componentFactoryResolver), 'capture-medical-invoice');
    contextFactory.addWizardContext(new MedicalInvoiceWizardContext(componentFactoryResolver), 'edit-medical-invoice');
    contextFactory.addWizardContext(new NotificationWizard(componentFactoryResolver), 'capture-medical-invoice-notification');
    contextFactory.addWizardContext(new NotificationWizard(componentFactoryResolver), 'pend-medical-invoice-notification');
    contextFactory.addWizardContext(new NotificationWizard(componentFactoryResolver), 'reject-medical-invoice-notification');
    contextFactory.addWizardContext(new MedicalInvoiceAssesmentWizardContext(componentFactoryResolver), 'medical-invoice-assessment');
    contextFactory.addWizardContext(new MedicalInvoiceQueryResponseWizardContext(componentFactoryResolver), 'medical-invoice-query-response');
  }
}