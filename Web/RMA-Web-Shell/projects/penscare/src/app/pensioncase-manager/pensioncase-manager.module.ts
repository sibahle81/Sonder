import { PensionCaseMenuComponent } from './views/pensioncase-menu/pensioncase-menu.component';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { SharedModule } from 'src/app/shared/shared.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { FrameworkModule } from 'src/app/framework.module';
import { PensManagerModule } from 'projects/penscare/src/app/pens-manager/pens-manager.module';
import { PensionCaseManagerRoutingModule } from 'projects/penscare/src/app/pensioncase-manager/pensioncase-manager-routing.module';
import { PensionCaseOverviewComponent } from 'projects/penscare/src/app/pensioncase-manager/views/pensioncase-overview/pensioncase-overview.component';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { InitiatePensionCaseWizard } from './views/wizards/initiate-pension-case-wizard/initiate-pension-case-wizard';
import { PensionCaseDetailsComponent } from './views/wizards/initiate-pension-case-wizard/pension-case-details/pension-case-details.component';
import { PensionLedgerComponent } from './views/wizards/initiate-pension-case-wizard/pension-ledger/pension-ledger.component';
import { PensionLedgerDetailsComponent } from './views/wizards/initiate-pension-case-wizard/pension-ledger/pension-ledger-details/pension-ledger-details.component';
import { PensionNotesComponent } from './views/wizards/initiate-pension-case-wizard/pension-notes/pension-notes.component';
import { ClaimInformationComponent } from './views/wizards/initiate-pension-case-wizard/claim-information/claim-information.component';
import { RecipientInformationComponent } from './views/wizards/initiate-pension-case-wizard/recipient-information/recipient-information.component';
import { AccountInformationComponent } from './views/wizards/initiate-pension-case-wizard/account-information/account-information.component';
import { RecipientBeneficiaryListComponent } from './views/wizards/initiate-pension-case-wizard/recipient-beneficiary-list/recipient-beneficiary-list.component';
import { AccountInformationListComponent } from './views/wizards/initiate-pension-case-wizard/account-information-list/account-information-list.component';
import { PensionerInformationComponent } from './views/wizards/initiate-pension-case-wizard/pensioner-information/pensioner-information.component';
import { BeneficiaryInformationComponent } from './views/wizards/initiate-pension-case-wizard/beneficiary-information/beneficiary-information.component';
import { ConfirmDeleteDialogComponent } from './views/wizards/initiate-pension-case-wizard/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { PensionCaseDocumentsComponent } from './views/wizards/initiate-pension-case-wizard/pension-case-documents/pension-case-documents.component';
import { VerifyCvComponent } from './views/wizards/initiate-pension-case-wizard/verify-cv/verify-cv.component';
import { VerifyCompensationTableComponent } from './views/wizards/initiate-pension-case-wizard/verify-cv/verify-compensation-table/verify-compensation-table.component';
import { VerifyCvCalculationTableComponent } from './views/wizards/initiate-pension-case-wizard/verify-cv/verify-cv-calculation-table/verify-cv-calculation-table.component';
import { ClaimInformationListComponent } from './views/wizards/initiate-pension-case-wizard/claim-information/claim-information-list/claim-information-list.component';
import { PenscareTableLedgerComponent } from './views/penscare-table-ledger/penscare-table-ledger.component';
import { PensionCaseViewComponent } from './views/pension-case-view/pension-case-view.component';
import { StatusChangeReasonDialogComponent } from './views/wizards/initiate-pension-case-wizard/dialogs/status-change-reason-dialog/status-change-reason-dialog.component';
import { PensionLedgerStatusComponent } from './views/wizards/pension-ledger-status-wizard/pension-ledger-status/pension-ledger-status.component';
import { PensionLedgerStatusWizard } from './views/wizards/pension-ledger-status-wizard/pension-ledger-status-wizard';
import { PensionLedgersTabComponent } from './views/pension-case-view/pension-ledgers-tab/pension-ledgers-tab.component';
import { SharedPenscareModule } from '../shared-penscare/shared-penscare.module';
import { PensionCaseTabComponent } from './views/pension-case-view/pension-case-tab/pension-case-tab.component';
import { PensionBeneficiariesTabComponent } from './views/pension-case-view/pension-beneficiaries-tab/pension-beneficiaries-tab.component';
import { PensionRecipientsTabComponent } from './views/pension-case-view/pension-recipients-tab/pension-recipients-tab.component';
import { PensionBankingDetailsTabComponent } from './views/pension-case-view/pension-banking-details-tab/pension-banking-details-tab.component';
import { PensionLedgerStatusNotesComponent } from './views/wizards/pension-ledger-status-wizard/pension-ledger-status-notes/pension-ledger-status-notes.component';
import { CorrectiveEntryListComponent } from './views/corrective-entry-list/corrective-entry-list.component';
import { PensionClaimsTabComponent } from './views/pension-case-view/pension-claims-tab/pension-claims-tab.component';
import { CorrectiveEntryDetailsComponent } from './views/wizards/corrective-entry-wizard/corrective-entry-details/corrective-entry-details.component';
import { CorrectiveEntryWizard } from './views/wizards/corrective-entry-wizard/corrective-entry-wizard';
import { PensionLedgerSummaryComponent } from './views/wizards/initiate-pension-case-wizard/pension-ledger/pension-ledger-summary/pension-ledger-summary.component';
import { CorrectiveEntryLedgerDetailComponent } from './views/wizards/corrective-entry-wizard/corrective-entry-ledger-detail/corrective-entry-ledger-detail.component';
import { CorrectiveEntrySplitComponent } from './views/wizards/corrective-entry-wizard/corrective-entry-split/corrective-entry-split.component';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { TaxManagerModule } from '../tax-manager/tax-manager.module';
import { CommutationEntryListComponent } from './views/commutation-entry-list/commutation-entry-list.component';
import { CommutationImpactAnalysisComponent } from './views/commutation-impact-analysis/commutation-impact-analysis.component';
import { CommutationWizardContext } from './views/wizards/commutation-wizard/commutation-wizard';
import { CommutationDetailsComponent } from './views/wizards/commutation-wizard/commutation-details/commutation-details.component';
import { CommutationWizardComponent } from './views/wizards/commutation-wizard/commutation-wizard.component';
import { ExpenditureComponent } from './views/wizards/commutation-wizard/expenditure/expenditure.component';
import { PensionerDetailsComponent } from './views/wizards/commutation-wizard/pensioner-details/pensioner-details.component';
import { RecipeintDetailsComponent } from './views/wizards/commutation-wizard/recipeint-details/recipeint-details.component';

@NgModule({
  imports: [
    FrameworkModule,
    PensionCaseManagerRoutingModule,
    WizardModule,
    SharedModule,
    PensManagerModule,
    SharedPenscareModule,
    ClientCareSharedModule,
    TaxManagerModule
  ],
  declarations: [
    PensionCaseOverviewComponent,
    PensionCaseMenuComponent,
    PensionCaseDetailsComponent,
    PensionLedgerComponent,
    PensionLedgerDetailsComponent,
    PensionNotesComponent,
    ClaimInformationComponent,
    RecipientInformationComponent,
    AccountInformationComponent,
    RecipientBeneficiaryListComponent,
    AccountInformationListComponent,
    PensionerInformationComponent,
    BeneficiaryInformationComponent,
    ConfirmDeleteDialogComponent,
    PensionCaseDocumentsComponent,
    VerifyCvComponent,
    VerifyCompensationTableComponent,
    VerifyCvCalculationTableComponent,
    ClaimInformationListComponent,
    PenscareTableLedgerComponent,
    PensionCaseViewComponent,
    StatusChangeReasonDialogComponent,
    PensionLedgerStatusComponent,
    PensionLedgersTabComponent,
    PensionCaseTabComponent,
    PensionBeneficiariesTabComponent,
    PensionRecipientsTabComponent,
    PensionBankingDetailsTabComponent,
    PensionLedgerStatusNotesComponent,
    CorrectiveEntryListComponent,
    PensionClaimsTabComponent,
    CorrectiveEntryDetailsComponent,
    PensionLedgerSummaryComponent,
    CorrectiveEntryLedgerDetailComponent,
    CorrectiveEntrySplitComponent,
    CommutationEntryListComponent,
    CommutationImpactAnalysisComponent,
    PensionerDetailsComponent,
    RecipeintDetailsComponent,
    CommutationDetailsComponent,
    ExpenditureComponent,
    CommutationWizardComponent,
  ],

  exports: [
    PensionCaseViewComponent
  ],

  providers: [
    SharedServicesLibModule,
    PensCareService
  ],
  bootstrap: []
})
export class PensionCaseManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    contextFactory: WizardContextFactory,
    pensCareService: PensCareService) {
    pensCareService.loadLookupsCache();
    contextFactory.addWizardContext(new InitiatePensionCaseWizard(componentFactoryResolver), 'initiate-pension-case');
    contextFactory.addWizardContext(new PensionLedgerStatusWizard(componentFactoryResolver), 'pension-ledger-status');
    contextFactory.addWizardContext(new CorrectiveEntryWizard(componentFactoryResolver), 'corrective-entry');
    contextFactory.addWizardContext(new CommutationWizardContext(componentFactoryResolver), 'commutation-wizard');
  }
}
